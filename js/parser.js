class Parser{
    constructor(domTokenizer) {
        this.domTokenizer = domTokenizer;
        this.__raw__ = this.domTokenizer.buffer;

        //separate extractions into nested and unnested
        this.unnested_iocs = {};
        this.nested_iocs = {};
        for(let key in userSettings.extractions){
            if(userSettings.extractions[key]["hasNested"]){
                let attributes = this.processExtractions(false, userSettings.extractions[key]["attributes"]);
                let nestedTags = this.processExtractions(true, userSettings.extractions[key]["attributes"]);
                this.nested_iocs[key] = {
                    "attributes":attributes,
                    "nested_tags":nestedTags,
                    "extractions":[]
                };
            }else{
                this.unnested_iocs[key] = {
                    "attributes":userSettings.extractions[key]["attributes"],
                    "extractions":[]
                };
            }
        }

        this.parseDom();
    }

    processExtractions(getNestedTags, attList){
        if(getNestedTags){
            let nestedTags = {};
            for(let i=0; i<attList.length; i++){
                if(attList[i].match(new RegExp("[:,\\[\\]]", "g"))){
                    let nestedTag = attList[i].replace(new RegExp("[\\[\\]]","g"), "");
                    nestedTags[nestedTag.split(":")[0]] = nestedTag.split(":")[1].split(",");
                }
            }
            return nestedTags;
        }else{
            let attributes = [];
            for(let i=0; i<attList.length; i++){
                if(!(attList[i].match(new RegExp("[:,\\[\\]]", "g")))){
                    attributes.push(attList[i]);
                }
            }
            return attributes;
        }
    }

    hasIocs(){
        for(let key in this.unnested_iocs){
            if(this.unnested_iocs[key]["extractions"].length > 0){
                return true;
            }
        }
        for(let key in this.nested_iocs){
            if(this.nested_iocs[key]["extractions"].length > 0){
                return true;
            }
        }
        return false;
    }

    parseDom(){
        //FIXME: FIRST: Use main tokenizer to extract all unnested iocs

        while(this.domTokenizer.hasNext()){
            if(this.domTokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME && this.domTokenizer.current.value in this.unnested_iocs){

                let tag = this.domTokenizer.current.value;
                let allAttributes = this.getAttribute("*", this.domTokenizer);
                for(let key in allAttributes){
                    if(this.unnested_iocs[tag]["attributes"].includes(key)){
                        if(["data-src","src","href"].includes(key) && this.unnested_iocs["base"] != null){
                            if(!(allAttributes[key].startsWith(this.unnested_iocs["base"]) &&
                            !(allAttributes[key].startsWith("http")))){
                                this.unnested_iocs[tag]["extractions"].push({"att":key,"value":this.unnested_iocs["base"] + allAttributes[key]});
                            }
                        }
                        this.unnested_iocs[tag]["extractions"].push({key:allAttributes[key]});
                    }
                }
                // REMOVED: #001
            }
            this.domTokenizer.next();
        }

        //FIXME: SECOND: Use a fresh tokenizer to extract each nested ioc

        for(let tag in this.nested_iocs){
            let tokenizer = new DOMTokenizer(this.__raw__);
            while(tokenizer.hasNext()){
                if(tokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME && tokenizer.current.value === tag){
                    //REMOVED: #002
                    this.nested_iocs[tag]["extractions"].push(this.parseNestedTag(tag, this.nested_iocs[tag]["attributes"], this.nested_iocs[tag]["nested_tags"], tokenizer));
                }
                tokenizer.next();
            }
        }


        //FIXME: THIRD: Use a fresh tokenizer to extract all scripts and deobfuscate
    }

    parseNestedTag(tag, outerTagAttributes, nestedTags, tokenizer){
        let outerTag = new OuterTag({}, {});

        let allAttributes = this.getAttribute("*", tokenizer);
        for(let key in allAttributes){
            if(outerTagAttributes.includes(key)){
                outerTag.attributes[key] = allAttributes[key];
            }
        }

        while(tokenizer.hasNext() && !(tokenizer.current.tokenType === DOMTokenType.CLOSE_TAG_NAME && tokenizer.current.value === tag)){
            if(tokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME && tokenizer.current.value in nestedTags){
                let t = tokenizer.current.value;
                let innerTag = new InnerTag(t, {});
                allAttributes = this.getAttribute("*", tokenizer);
                for(let key in allAttributes){
                    if(nestedTags[t].includes(key)){
                        innerTag.attributes[key] = allAttributes[key];
                    }
                }
                outerTag.innerTags.push(innerTag);
            }
        }

        return outerTag;
    }

    getAttribute(attributeName, tokenizer){
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

//FIXME : These can be used as the generic containers for nested iocs
class OuterTag{
    constructor(attributes, innerTags){
        this.attributes = attributes; //{att1:val1,att2:val2...}
        this.innerTags = innerTags; //[InnerTag, InnerTag,...]
    }
}

class InnerTag{
    constructor(tag, attributes){
        this.tag = tag;
        this.attributes = attributes; //{att1:val1,att2:val2...}
    }
}

/*
{
    == REMOVED ==

    #001:
    switch(searchTag) {
        case "base":
            this.iocs[searchTag] = this.getAttribute("href", null);
            break;
        case "a":
            let url = this.getAttribute("href", null);
            if(this.iocs["base"] != null && !url.startsWith(this.iocs["base"]) && !url.startsWith("http")){
                url = (url !== "") ? this.iocs["base"] + url : this.iocs["base"];
            }else{
                url = (url !== "") ? url : "/";
            }
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

    #002:
    let attributes = this.getAttribute("*", tokenizer);
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

    #003:
    parseForm(){
        let form = new Form("", "");

        //get form attributes
        let attributes = this.getAttribute("*", null);
        form.method = ("method" in attributes) ? attributes["method"] : "no-method";
        form.action = ("action" in attributes) ? ((attributes["action"] === "") ? "/" : attributes["action"]) : "no-action";

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

    #004:
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

    #005:
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
}
*/