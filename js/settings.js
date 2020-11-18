function changeExtractions(key){
    if(key!=null){
        userSettings.removeExtraction(key);
        showSettings('html');
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
            showSettings('html');
        }catch(err){
            throwError(err);
        }
    }
}

function changeSignatures(key){
    if(key!=null){
        userSettings.removeSignature(key);
        showSettings('javascript');
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
            showSettings('javascript');
        }catch(err){
            throwError(err);
        }
    }
}

function changeCssSignatures(key){
    if(key!=null){
        userSettings.removeCssSignature(key);
        showSettings('css');
    }else{
        let name = document.getElementById('newName').value;
        let selector = document.getElementById('newSelector').value;
        let attribute = document.getElementById('newAttribute').value;
        let val = document.getElementById('newValue').value;
        try{
            if(name === undefined || name.trim().length === 0){
                throw "CSS signature name is required";
            }
            if(selector === undefined || selector.trim().length === 0){
                selector = ".*";
            }
            if(attribute === undefined || attribute.trim().length === 0){
                attribute = ".*";
            }
            if(val === undefined || val.trim().length === 0){
                val = ".*";
            }
            userSettings.addCssSignature(name, selector, attribute, val);
            showSettings('css');
        }catch(err){
            throwError(err);
        }
    }
}

function clearSignatures(){
    userSettings.signatures = {};
    showSettings('javascript');
}

function clearExtractions(){
    userSettings.extractions = {};
    showSettings('html');
}

function clearCssSignatures(){
    userSettings.cssSignatures = {};
    showSettings('css');
}

function resetDomExtractionDefaults(){
    userSettings.extractions = getDefaultDomExtractions();
    showSettings('html');
}

function resetScriptSignatureDefaults(){
    userSettings.signatures = getDefaultScriptSignatures();
    showSettings('javascript');
}


function resetCssSignatureDefaults(){
    userSettings.cssSignatures = getDefaultCssSignatures();
    showSettings('css');
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
    exportString += '[STYLE]\n' + ((userSettings.getOption('checkStyle')) ? 'TRUE':'FALSE') + '\n';
    exportString += '[CONDITIONALS]\n' + ((userSettings.getOption('conditionalComments')) ? 'TRUE':'FALSE') + '\n';

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
        }else if(line === '[STYLE]'){
            mode = 'checkStyle'
        }else if(line === '[CONDITIONALS]'){
            mode = 'conditionalComments'
        }else if(line !== ''){
            if(['truncate', 'simpleDeob','debugTokenizer', "debugTokenizer", "checkStyle", "conditionalComments"].includes(mode)){
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
        this.cssSignatures = getDefaultCssSignatures();
        this.options = {
            'debugTokenizer': false,
            'truncate':true,
            'simpleDeob':true,
            'checkStyle':true,
            'conditionalComments':true,
            'deobSignatures':getDefaultDeobfuscations()
        };
    }

    addSignature(name, pattern){
        if(name in this.signatures){
            throw "Name \"" + name + "\" is already being used to identify a JavaScript signature.";
        }

        if(this.signatureAlreadyExists('javascript', [pattern])){
            throw "LinkRippr is already searching for this JavaScript signature.";
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

    addCssSignature(name, selector, attribute, value){
        //regex
        if(name in this.cssSignatures){
            throw "Name \"" + name + "\" is already being used to identify a CSS signature"
        }

        if(this.signatureAlreadyExists('css', [selector, attribute, value])){
            throw "LinkRippr is already looking for this CSS signature.";
        }

        this.cssSignatures[name] = {
            'selector':new RegExp(selector, 'g'),
            'attribute':new RegExp(attribute, 'g'),
            'value':new RegExp(value, 'g'),
            'selector_user_view':selector,
            'attribute_user_view':attribute,
            'value_user_view':value
        };
    }

    signatureAlreadyExists(type, signatures){
        if(type === 'css'){
            for(let key in this.cssSignatures){
                if(this.cssSignatures[key]['selector_user_view'] === signatures[0] &&
                this.cssSignatures[key]['attribute_user_view'] === signatures[1] &&
                this.cssSignatures[key]['value_user_view'] === signatures[2]){
                    return true;
                }
            }
        }else if(type === 'javascript'){
            for(let key in this.signatures){
                if(this.signatures[key]['user_view'] === signatures[0]){
                    return true;
                }
            }
        }
        return false;
    }

    removeCssSignature(selector){
        if(this.cssSignatures == null || !(selector in this.cssSignatures)){
            return;
        }
        if(selector in this.cssSignatures){
            delete this.cssSignatures[selector];
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
                    buffer = "err";
                    break;
                }
                buffer += attString.charAt(i);
            }
        }

        //check for errors
        if(buffer !== ""){
            throw "Incorrect syntax for nested extraction";
        }

        //clean up attributes
        for(let idx in attributes){
            attributes[idx] = attributes[idx].replace(" ","");
        }
        return {"attributes":attributes, "hasNested":hasNested};
    }
}