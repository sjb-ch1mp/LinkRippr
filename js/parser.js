class Parser{
    constructor(domTokenizer) {
        this.domTokenizer = domTokenizer;
        this.__raw__ = this.domTokenizer.buffer;

        this.iocs = {
            "base":null,
            "a":[],
            "iframe":[],
            "form":[],
            "script":[]
        };

        //add user defined extractions if they exist
        if(userSettings.userExtractions != null){
            for(let key in userSettings.userExtractions){
                this.iocs[key] = [];
            }
        }

        this.parseDom();
    }

    hasIocs(){

        let userDefinedExtractionsFound = false;
        if(userSettings.userExtractions != null){
            for(let key in userSettings.userExtractions){
                if(this.iocs[key].length > 0){
                    userDefinedExtractionsFound = true;
                }
            }
        }

        return this.iocs["base"] != null ||
            this.iocs["a"].length > 0 ||
            this.iocs["iframe"].length > 0 ||
            this.iocs["form"].length > 0 ||
            this.iocs["script"].length > 0 ||
            userDefinedExtractionsFound;
    }

    parseDom(){
        while(this.domTokenizer.hasNext()){
            if(this.domTokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME &&
                this.domTokenizer.current.value in this.iocs &&
                defaultTags.includes(this.domTokenizer.current.value)){ //while user-defined tags will be detected, they will be ignored
                let searchTag = this.domTokenizer.current.value;
                switch(searchTag) {
                    case "base":
                        this.iocs[searchTag] = this.getAttribute("href", null);
                        break;
                    case "a":
                        let url = (this.iocs["base"] == null) ? "" : this.iocs["base"];
                        url += this.getAttribute("href", null);
                        if(!this.iocs[searchTag].includes(url)){
                            this.iocs[searchTag].push(url);
                        }
                        break;
                    case "iframe":
                        this.iocs[searchTag].push(this.getAttribute("href", null));
                        break;
                    case "form":
                        let form = this.parseForm();
                        if(!form.alreadyParsed(this.iocs[searchTag])){
                            this.iocs[searchTag].push(form);
                        }
                        break;
                    case "script":
                        this.parseScript();
                        break;
                }
            }
            this.domTokenizer.next();
        }

        //now get user-defined extractions
        let freshTokenizer = new DOMTokenizer(this.__raw__);
        while(freshTokenizer.hasNext()){
            if(freshTokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME &&
                freshTokenizer.current.value in this.iocs &&
                !(defaultTags.includes(freshTokenizer.current.value))){
                let searchTag = freshTokenizer.current.value;
                let attributes = this.getAttribute("*", freshTokenizer);
                let attributeFound = false;
                let att_container = {};
                if(userSettings.userExtractions[searchTag][0] === "*"){
                    this.iocs[searchTag].push(attributes);
                }else{
                    for(let i=0; i<userSettings.userExtractions[searchTag].length; i++) {
                        if(attributes != null && userSettings.userExtractions[searchTag][i] in attributes){
                            attributeFound = true;
                            att_container[userSettings.userExtractions[searchTag][i]] = attributes[userSettings.userExtractions[searchTag][i]];
                        }
                    }
                    if(attributeFound){
                        this.iocs[searchTag].push(att_container);
                    }
                }
            }
            freshTokenizer.next();
        }
    }

    parseScript(){
        //check if the script is being imported from elsewhere
        let attributes = this.getAttribute("*", null);
        if(attributes != null){
            if("data-src" in attributes){
                this.iocs["script"].push(attributes["data-src"]);
            }else if("src" in attributes) {
                this.iocs["script"].push(attributes["src"]);
            }
            return;
        }

        //if not, parse the contents of the script element
        this.domTokenizer.next();
        if(this.domTokenizer.current.tokenType === DOMTokenType.SCRIPT){
            let script = this.domTokenizer.current.value;
            //then parse script and deobfuscate where necessary
        }
    }

    parseForm(){
        let form = new Form("", "");

        //get form attributes
        let attributes = this.getAttribute("*", null);
        form.method = ("method" in attributes) ? attributes["method"] : "no-method";
        form.action = ("action" in attributes && attributes["action"] !== "") ? attributes["action"] : "/";

        //get form inputs
        while(this.domTokenizer.hasNext() &&
            !(this.domTokenizer.current.tokenType === DOMTokenType.CLOSE_TAG_NAME &&
                this.domTokenizer.current.value === "form")){
            if(this.domTokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME &&
                this.domTokenizer.current.value === "input"){
                let inputAttributes = this.getAttribute("*", null);
                form.inputs.push(new Input(
                    ("name" in inputAttributes) ? inputAttributes["name"]:"",
                    ("type" in inputAttributes) ? inputAttributes["type"]:""
                ));
            }
            this.domTokenizer.next();
        }
        return form;
    }

    getAttribute(attributeName, useTokenizer){
        let tokenizer = (useTokenizer == null) ? this.domTokenizer : useTokenizer;
        if(attributeName === "*"){ //get all attributes
            let attributes = null;
            while(tokenizer.hasNext() &&
                tokenizer.current.tokenType !== DOMTokenType.DEFAULT_TAG_FINISH &&
                tokenizer.current.tokenType !== DOMTokenType.VOID_TAG_FINISH){
                if(tokenizer.current.tokenType === DOMTokenType.ATT_KEY){
                    if(attributes == null){
                        attributes = {};
                    }
                    let att_key = tokenizer.current.value;

                    while(tokenizer.hasNext() && tokenizer.current.tokenType !== DOMTokenType.ATT_VALUE
                    && tokenizer.current.tokenType !== DOMTokenType.QUOTE){
                        tokenizer.next();
                    }

                    if(tokenizer.current.tokenType === DOMTokenType.QUOTE){
                        tokenizer.next();
                        if(tokenizer.current.tokenType === DOMTokenType.QUOTE){
                            attributes[att_key] = "";
                        }else{
                            attributes[att_key] = tokenizer.current.value;
                        }
                    }else if(tokenizer.current.tokenType === DOMTokenType.ATT_VALUE){
                        attributes[att_key] = tokenizer.current.value;
                    }
                }else if(tokenizer.current.tokenType === DOMTokenType.BOOL_ATT){
                    if(attributes == null){
                        attributes = {};
                    }
                    attributes[tokenizer.current.value] = "True";
                }
                tokenizer.next();
            }
            return attributes;
        }else{
            while(tokenizer.hasNext() &&
                tokenizer.current.tokenType !== DOMTokenType.DEFAULT_TAG_FINISH &&
                tokenizer.current.tokenType !== DOMTokenType.VOID_TAG_FINISH){
                if(tokenizer.current.tokenType === DOMTokenType.ATT_KEY &&
                    tokenizer.current.value === attributeName){
                    while(tokenizer.hasNext() && tokenizer.current.tokenType !== DOMTokenType.ATT_VALUE
                        && tokenizer.current.tokenType !== DOMTokenType.QUOTE){
                        tokenizer.next();
                    }

                    if(tokenizer.current.tokenType === DOMTokenType.QUOTE){
                        tokenizer.next();
                        if(tokenizer.current.tokenType === DOMTokenType.QUOTE){
                            return "";
                        }else{
                            return tokenizer.current.value;
                        }
                    }else if(tokenizer.current.tokenType === DOMTokenType.ATT_VALUE){
                        return tokenizer.current.value;
                    }
                }else if(tokenizer.current.tokenType === DOMTokenType.BOOL_ATT){
                    return "True";
                }
                tokenizer.next();
            }
        }
    }
}

class Form{
    constructor(method, action){
        this.method = method;
        this.action = action;
        this.inputs = [];
    }

    equals(form){
        if(this.method !== form.method) return false;
        if(this.action !== form.action) return false;
        for(let i=0; i<this.inputs.length; i++){
            if(!this.inputs[i].existsInArray(form.inputs)) return false;
        }
        return true;
    }

    alreadyParsed(formList){
        for(let i=0; i<formList.length; i++){
            if(formList[i].equals(this)) return true;
        }
        return false;
    }
}

class Input{
    constructor(name, type){
        this.name = name;
        this.type = type;
    }

    equals(input){
        if(this.name !== input.name) return false;
        if(this.type !== input.type) return false;
        return true;
    }

    existsInArray(inputList){
        for(let i=0; i<inputList.length; i++){
            if(inputList[i].equals(this)) return true;
        }
        return false;
    }
}