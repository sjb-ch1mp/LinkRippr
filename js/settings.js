function changeExtractions(key){
    if(key!=null){
        userSettings.removeExtraction(key);
        showSettings('extractions');
    }else{
        let newTag = document.getElementById("newTag");
        let newAttributes = document.getElementById("newAttributes");
        try{
            if(newTag.value === undefined || newTag.value.trim().length === 0){
                throw "Tag name required";
            }
            if(newAttributes.value === undefined || newAttributes.value.trim().length === 0){
                throw "Attributes required";
            }
            userSettings.addExtraction(newTag.value, newAttributes.value);
            showSettings('extractions');
        }catch(err){
            throwError(err);
        }
    }
}

function changeSignatures(key){
    if(key!=null){
        userSettings.removeSignature(key);
        showSettings('signatures');
    }else{
        let newFunction = document.getElementById("newFunction");
        let newPattern = document.getElementById("newPattern");
        try{
            if(newFunction.value === undefined || newFunction.value.trim().length === 0){
                throw "Signature name required";
            }
            if(newPattern.value === undefined || newPattern.value.trim().length === 0){
                throw "Pattern is required";
            }
            userSettings.addSignature(newFunction.value, newPattern.value);
            showSettings('signatures');
        }catch(err){
            throwError(err);
        }
    }
}

function clearSignatures(){
    userSettings.signatures = {};
    showSettings('signatures');
}

function clearExtractions(){
    userSettings.extractions = {};
    showSettings('extractions');
}

function resetDomExtractionDefaults(){
    userSettings.extractions = getDefaultDomExtractions();
    showSettings('extractions');
}

function resetScriptSignatureDefaults(){
    userSettings.signatures = getDefaultScriptSignatures();
    showSettings('signatures');
}

function exportCurrentSettings(){
    let exportString = '[EXTRACTIONS]\n';
    for(let key in userSettings.extractions){
        exportString += key + " :::: " + userSettings.extractions[key]['attributes'].join(',') + '\n';
    }

    exportString += '[SIGNATURES]\n';
    for(let key in userSettings.signatures){
        exportString += key + " :::: " + userSettings.signatures[key]['user_view'] + '\n';
    }

    exportString += '[DEBUG]\n' + ((userSettings.getOption('debugTokenizer')) ? 'TRUE':'FALSE') + '\n';
    exportString += '[TRUNCATE]\n' + ((userSettings.getOption('truncate')) ? 'TRUE':'FALSE') + '\n';
    exportString += '[DEOBFUSCATE]\n' + ((userSettings.getOption('simpleDeob')) ? 'TRUE':'FALSE') + '\n';

    downloadFile(exportString, 'linkrippr_settings.txt');
}

function downloadFile(contents, fileName){
    let blob = new Blob([contents], {type:'text/plain'});
    if(window.navigator.msSaveOrOpenBlob){
        window.navigator.msSaveOrOpenBlob(blob, fileName);
    }else{
        let element = window.document.createElement('a');
        element.href = window.URL.createObjectURL(blob);
        element.download = fileName;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
}

function loadSettingsFromFile(settingsFile){

    clearExtractions();
    clearSignatures();

    let settings = settingsFile.split('\n');
    let mode = '';
    for(let i in settings){
        let line = settings[i].trim();
        if(line === '[EXTRACTIONS]'){
            mode = 'extractions';
        }else if(line === '[SIGNATURES]'){
            mode = 'signatures';
        }else if(line === '[DEBUG]'){
            mode = 'debugTokenizer';
        }else if(line === '[TRUNCATE]') {
            mode = 'truncate';
        }else if(line === '[DEOBFUSCATE]'){
            mode = 'simpleDeob';
        }else if(line !== ''){
            if(['truncate', 'simpleDeob','debugTokenizer'].includes(mode)){
                userSettings.setOption(mode, line === 'TRUE');
            }else{
                let key = line.split(' :::: ')[0];
                let value = line.split(' :::: ')[1];
                switch(mode){
                    case 'extractions':
                        userSettings.addExtraction(key, value);
                        break;
                    case 'signatures':
                        userSettings.addSignature(key, value);
                }
            }
        }
    }
}

class UserSettings{

    constructor(){
        this.extractions = getDefaultDomExtractions();
        this.signatures = getDefaultScriptSignatures();
        this.options = {
            'debugTokenizer': false,
            'truncate':true,
            'simpleDeob':true,
            'deobSignatures':getDefaultDeobfuscations()
        };
    }

    addSignature(name, pattern){
        if(name in this.signatures){
            throw "Name \"" + name + "\" is already being used to identify a signature.";
        }
        this.signatures[name] = {
            "global":new RegExp(pattern, "g"),
            "sticky":new RegExp(pattern, "y"),
            "user_view":pattern,
            "default":false
        };
    }

    removeSignature(name){
        if(this.signatures == null || !(name in this.signatures)){
            return;
        }
        if(name in this.signatures){
            delete this.signatures[name];
        }
    }

    addExtraction(tag, attributes){

        //check if tag is already being extracted
        if(tag in this.extractions){
            throw "Tag \"" + tag + "\" is already being extracted.";
        }

        if(attributes.includes(",") || attributes.includes("[") || attributes.includes("]")){
            attributes = this.processAttributes(attributes);
        }else{
            attributes = {"attributes":[attributes.replace(" ", "")], "hasNested":false};
        }

        //check if tag is for a void element and is nested - this is impossible
        if(getElementFeature(tag, Feature.IS_VOID) && attributes["hasNested"]){
            throw "\"" + tag.toUpperCase() + "\" is a void element and can therefore not contain nested elements.";
        }

        this.extractions[tag] = attributes;
    }

    removeExtraction(tag){
        if(this.extractions == null || !(tag in this.extractions)){
            return;
        }

        if(tag in this.extractions) {
            delete this.extractions[tag];
        }
    }

    getOption(option){
        return this.options[option];
    }

    setOption(option, value){
        this.options[option] = value;
    }

    processAttributes(attString){

        let hasNested = false;
        let attributes = [];
        let buffer = "";
        let nested = false;
        let errChars = ["]", ":"];

        //general check for bad characters
        attString = attString.toLowerCase();
        if(!(attString.match(new RegExp("^[,\\[\\]:a-z0-9\-\\*]+$")))){
            throw "Attribute string contains illegal values.";
        }

        //use pseudo parser to extract nested and unnested attributes
        for(let i=0; i<attString.length; i++){
            if(nested){
                hasNested = true;
                buffer += attString.charAt(i);
                if(attString.charAt(i) === "]"){
                    nested = false;
                    attributes.push(buffer);
                    buffer = "";
                }else if(attString.charAt(i) === "["){
                    throw "LinkRipper can only handle nesting to a depth of 1."
                }
            }else if(attString.charAt(i) === "["){
                if(buffer.trim() !== ""){
                    attributes.push(buffer);
                }
                buffer = "[";
                nested = true;
            }else if(attString.charAt(i) === ","){
                if(buffer.trim() !== ""){
                    attributes.push(buffer);
                    buffer = "";
                }
            }else if(i === attString.length - 1){
                if(errChars.includes(attString.charAt(i))){
                    buffer = "err";
                    break;
                }
                if(buffer.trim() != ""){
                    if(attString.charAt(i) !== ","){
                        attributes.push(buffer + attString.charAt(i));
                    }
                    buffer = "";
                }
            }else{
                if(errChars.includes(attString.charAt(i))){
                    console.log(attString.charAt(i))
                    buffer = "err";
                    break;
                }
                buffer += attString.charAt(i);
            }
        }

        //check for errors
        if(buffer !== ""){
            console.log(buffer);
            throw "Incorrect syntax for nested extraction";
        }

        //clean up attributes
        for(let idx in attributes){
            attributes[idx] = attributes[idx].replace(" ","");
        }
        return {"attributes":attributes, "hasNested":hasNested};
    }
}

function getDefaultDomExtractions(){
    return {
        "base":{"attributes":["href"],"hasNested":false},
        "a":{"attributes":["href"],"hasNested":false},
        "iframe":{"attributes":["href","data-src","src"],"hasNested":false},
        "script":{"attributes":["src"],"hasNested":false},
        "form":{"attributes":["method", "action","[input:name,type]"],"hasNested":true},
        "meta":{"attributes":["http-equiv"],"hasNested":false},
        "div":{"attributes":["visibility","display"],"hasNested":false}
    };
}

function getDefaultScriptSignatures(){
    return {
        "document.write":{
            "global":new RegExp("document\\.write\\(.*\\)(;|\\s)", "g"),
            "sticky":new RegExp("document\\.write\\(.*\\)(;|\\s)", "y"),
            "user_view":"document\\.write\\(.*\\)(;|\\s)",
            "default":true},
        "eval":{
            "global":new RegExp("eval\\(.*\\)", "g"),
            "sticky":new RegExp("eval\\(.*\\)", "y"),
            "user_view":"eval\\(.*\\)",
            "default":true},
        "atob":{
            "global":new RegExp("atob\\(.*\\)", "g"),
            "sticky":new RegExp("atob\\(.*\\)", "y"),
            "user_view":"atob\\(.*\\)",
            "default":true},
        "unescape":{
            "global":new RegExp("unescape\\(.*\\)", "g"),
            "sticky":new RegExp("unescape\\(.*\\)", "y"),
            "user_view":"unescape\\(.*\\)",
            "default":true},
        "simple-url":{
            "global":new RegExp('http(s)?:\\/\\/.*(;|\\s|")', "g"),
            "sticky":new RegExp('http(s)?:\\/\\/.*(;|\\s|")', "y"),
            "user_view":"http(s)?:\\/\\/.*(;|\\s|\")",
            "default":true},
        "ip-4":{
            "global":new RegExp('[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}', "g"),
            "sticky":new RegExp('[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}', "y"),
            "user_view":'[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}',
            "default":true},
        "ajax-post":{
            "global":new RegExp("\\$\\.ajax\\(\\{.*type:\\s?\\'POST\\'.*\\}\\)", "g"),
            "sticky":new RegExp("\\$\\.ajax\\(\\{.*type:\\s?\\'POST\\'.*\\}\\)", "y"),
            "user_view":"\\$\\.ajax\\(\\{.*type:\\s?\\'POST\\'.*\\}\\)",
            "default":true},
        "xml-http-request":{
            "global":new RegExp("new XMLHttpRequest\\(\\)", "g"),
            "sticky":new RegExp("new XMLHttpRequest\\(\\)", "y"),
            "user_view":"new XMLHttpRequest\\(\\)",
            "default":true}
    };
}

function getDefaultDeobfuscations(){
    return {
        'document-write-unescape':{
            'global':new RegExp('document\\.write\\(unescape\\(("|\').*("|\')\\)\\)', 'g'),
            'sticky':new RegExp('document\\.write\\(unescape\\(("|\').*("|\')\\)\\)', 'y'),
            'user_view':'document\\.write\\(unescape\\(("|\').*("|\')\\)\\)',
            'unwrap':new RegExp('(^document\\.write\\(|\\)$)','g')
        },
        'document-write':{
            'global':new RegExp('document\\.write\\(("|\').*("|\')\\)', 'g'),
            'sticky':new RegExp('document\\.write\\(("|\').*("|\')\\)', 'y'),
            'user_view':'document\\.write\\(("|\').*("|\'))',
            'unwrap':new RegExp('(^document\\.write\\(|\\)$)','g')
        }
    };
}