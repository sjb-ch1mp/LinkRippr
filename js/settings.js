function changeMode(){
    if(userSettings != null){
        switch(userSettings.mode){
            case LRMode.EXTRACTION:
                userSettings.mode = LRMode.URL_SEARCH;
                break;
            case LRMode.URL_SEARCH:
                userSettings.mode = LRMode.PRETTY_PRINT;
                break;
            case LRMode.PRETTY_PRINT:
                userSettings.mode = LRMode.DEBUG_TOKENIZER;
                break;
            case LRMode.DEBUG_TOKENIZER:
                userSettings.mode = LRMode.EXTRACTION;
        }
        showSettings("settings");
    }
}

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

function resetDomExtractionDefaults(){
    userSettings.extractions = getDefaultDomExtractions();
    showSettings('extractions');
}

function resetScriptSignatureDefaults(){
    userSettings.signatures = getDefaultScriptSignatures();
    showSettings('signatures');
}

class UserSettings{

    constructor(){
        this.extractions = getDefaultDomExtractions();
        this.signatures = getDefaultScriptSignatures();
        this.mode = LRMode.EXTRACTION;
    }

    addSignature(name, pattern){
        if(name in this.signatures){
            throw "Name \"" + name + "\" is already being used to identify a signature.";
        }
        this.signatures[name] = {
            "global":new RegExp(pattern, "g"),
            "sticky":new RegExp(pattern, "y"),
            "user_view":pattern,
            "default":false};
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

    processAttributes(attString){

        let hasNested = false;
        let attributes = [];
        let buffer = "";
        let nested = false;
        let errChars = ["]", ":"];

        //general check for bad characters
        attString = attString.toLowerCase();
        if(!(attString.match(new RegExp("^[,\\[\\]:a-z0-9\-]+$")))){
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

const LRMode = {
    EXTRACTION:"EXTRACTION",
    DEBUG_TOKENIZER:"DEBUG_TOKENIZER",
    PRETTY_PRINT:"PRETTY_PRINT",
    URL_SEARCH:"URL_SEARCH"
}

const DeobResult = {
    HTML:"HTML",
    SCRIPT:"SCRIPT",
    UNKNOWN:"UNKNOWN",
    STRING:"STRING"
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
            "default":true}
    }
}