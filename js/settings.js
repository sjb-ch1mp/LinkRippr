function changeMode(){
    if(userSettings != null){
        userSettings.mode = (userSettings.mode === LRMode.NORMAL) ? LRMode.DEBUG_TOKENIZER : LRMode.NORMAL;
        showSettings('mode');
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

function getDefaultDomExtractions(){
    return {
        "base":{"attributes":["href"],"hasNested":false},
        "a":{"attributes":["href"],"hasNested":false},
        "iframe":{"attributes":["href"],"hasNested":false},
        "script":{"attributes":["src"],"hasNested":false},
        "form":{"attributes":["method", "action"],"hasNested":false},
        "meta":{"attributes":["http-equiv"],"hasNested":false}
    };
}

function getDefaultScriptSignatures(){
    return {
        "document.write":{"pattern":"document\\.write\\(.*\\)(;|\n| )", "result":DeobResult.HTML, "default":true},
        "eval":{"pattern":"eval\\(.*\\)","result":DeobResult.UNKNOWN, "default":true},
        "atob":{"pattern":"atob\\(.*\\)", "result":DeobResult.STRING, "default":true},
        "unescape":{"pattern":"unescape\\(.*\\)","result":DeobResult.STRING, "default":true}
    }
}

class UserSettings{

    constructor(){
        this.extractions = getDefaultDomExtractions();
        this.signatures = getDefaultScriptSignatures();
        this.mode = LRMode.NORMAL;
    }

    addSignature(name, pattern){
        if(name in this.signatures){
            throw "Name \"" + name + "\" is already being used to identify a signature.";
        }
        this.signatures[name] = {"pattern":pattern,"result":DeobResult.UNKNOWN, "default":false};
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
    NORMAL:"NORMAL",
    DEBUG_TOKENIZER:"DEBUG_TOKENIZER"
}

const DeobResult = {
    HTML:"HTML",
    SCRIPT:"SCRIPT",
    UNKNOWN:"UNKNOWN",
    STRING:"STRING"
}