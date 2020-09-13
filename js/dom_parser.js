class domParser{
    constructor(domTokenizer) {
        this.domTokenizer = domTokenizer;
        this.__raw__ = this.domTokenizer.buffer;

        //separate extractions into nested and unnested
        this.scripts = []; //[Script, Script, ...]
        this.unnested_iocs = {};
        this.nested_iocs = {};
        for(let key in userSettings.extractions){
            if(userSettings.extractions[key]["hasNested"]){
                let processedTags = this.processExtractions(userSettings.extractions[key]["attributes"]);
                this.nested_iocs[key] = {
                    "attributes":processedTags["attributes"],
                    "nested_tags":processedTags["nestedTags"],
                    "extractions":null
                };
            }else{
                this.unnested_iocs[key] = {
                    "attributes":userSettings.extractions[key]["attributes"],
                    "extractions":null
                };
            }
        }

        this.parseDom();
    }

    processExtractions(attList) {
        let processedTags = {"nestedTags": {}, "attributes": []};
        for (let i = 0; i < attList.length; i++) {
            if (attList[i].match(new RegExp("[:,\\[\\]]", "g"))) {
                let nestedTag = attList[i].replace(new RegExp("[\\[\\]]", "g"), "");
                processedTags["nestedTags"][nestedTag.split(":")[0]] = nestedTag.split(":")[1].split(",");
            } else {
                processedTags["attributes"].push(attList[i]);
            }
        }
        return processedTags;
    }

    parseDom(){
        //Use the main tokenizer to extract all unnested iocs
        while(this.domTokenizer.hasNext()){
            if(this.domTokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME && this.domTokenizer.current.value in this.unnested_iocs){
                let tag = this.domTokenizer.current.value;
                let allAttributes = this.getAttribute("*", this.domTokenizer);
                let attributesOfInterest = {};
                for(let key in allAttributes){
                    if(this.unnested_iocs[tag]["attributes"].includes(key) && !this.alreadyExists(tag, key, allAttributes[key], false, null)){
                        attributesOfInterest[key] = this.checkForBase(key, allAttributes[key]);
                    }
                }
                if(Object.keys(attributesOfInterest).length > 0){
                    if(this.unnested_iocs[tag]["extractions"] == null){
                        this.unnested_iocs[tag]["extractions"] = [];
                    }
                    this.unnested_iocs[tag]["extractions"].push(attributesOfInterest);
                }
            }else if(this.domTokenizer.current.tokenType === DOMTokenType.SCRIPT){
                let scriptParser = new ScriptParser(this.domTokenizer.current);
                this.scripts.push(scriptParser.script);
            }

            this.domTokenizer.next();
        }

        //Use a fresh tokenizer for each nested ioc extraction
        for(let tag in this.nested_iocs){
            let tokenizer = new DOMTokenizer(this.__raw__);
            while(tokenizer.hasNext()){
                if(tokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME && tokenizer.current.value === tag){
                    let outerTag = this.parseNestedTag(tag, this.nested_iocs[tag]["attributes"], this.nested_iocs[tag]["nested_tags"], tokenizer)
                    if(!(outerTag.extractions == null && outerTag.innerTags == null) && !this.alreadyExists(tag, null, null, true, outerTag)){
                        if(this.nested_iocs[tag]["extractions"] == null){
                            this.nested_iocs[tag]["extractions"] = [];
                        }
                        this.nested_iocs[tag]["extractions"].push(outerTag);
                    }
                }
                tokenizer.next();
            }
        }


        //FIXME: THIRD: Use a fresh tokenizer to extract all scripts and deobfuscate
    }

    alreadyExists(tag, attName, attValue, nested, outerTag){
        let iocs = (nested) ? this.nested_iocs : this.unnested_iocs;
        if(nested){
            if(iocs[tag]["extractions"] != null){
                for(let i=0; i<iocs[tag]["extractions"].length; i++){
                    if(iocs[tag]["extractions"][i].equals(outerTag)){
                        return true;
                    }
                }
            }
        }else{
            if(iocs[tag]["extractions"] != null){
                for(let i=0; i<iocs[tag]["extractions"].length; i++){
                    if(attName in iocs[tag]["extractions"][i] && attValue === iocs[tag]["extractions"][i][attName]){
                        return true;
                    }
                }
            }
        }
        return false;
    }

    parseNestedTag(tag, outerTagAttributes, nestedTags, tokenizer){
        let outerTag = new OuterTag(null, null);

        let allAttributes = this.getAttribute("*", tokenizer);
        let attributesOfInterest = {};
        for(let key in allAttributes){
            if(outerTagAttributes.includes(key)){
                attributesOfInterest[key] = this.checkForBase(key, allAttributes[key]);
            }
        }
        if(Object.keys(attributesOfInterest).length > 0){
            outerTag.extractions = attributesOfInterest;
        }
        //!(tokenizer.current.tokenType === DOMTokenType.CLOSE_TAG_NAME && tokenizer.current.value === tag)
        let sameTagNameNesting = 1;
        while(tokenizer.hasNext() && sameTagNameNesting > 0){
            if(tokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME && tokenizer.current.value in nestedTags){
                if(tokenizer.current.value === tag){
                    sameTagNameNesting++;
                }

                let t = tokenizer.current.value;
                let innerTag = new InnerTag(t, null);
                allAttributes = this.getAttribute("*", tokenizer);
                attributesOfInterest = {};
                for(let key in allAttributes){
                    if(nestedTags[t].includes(key)){
                        attributesOfInterest[key] = this.checkForBase(key, allAttributes[key]);
                    }
                }
                if(Object.keys(attributesOfInterest).length > 0){
                    innerTag.extractions = attributesOfInterest;
                    if(outerTag.innerTags == null){
                        outerTag.innerTags = [];
                    }
                    outerTag.innerTags.push(innerTag);
                }
            }else if(tokenizer.current.value === tag){
                if(tokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME){
                    sameTagNameNesting++;
                }else if(tokenizer.current.tokenType === DOMTokenType.CLOSE_TAG_NAME){
                    sameTagNameNesting--;
                }
            }
            tokenizer.next();
        }

        return outerTag;
    }

    checkForBase(attName, attVal){
        let urlAttributes = ["data-src","src","href"];
        if(urlAttributes.includes(attName) && this.unnested_iocs["base"] != null && this.unnested_iocs["base"]["extractions"] != null){
            if(!(attVal.startsWith(this.unnested_iocs["base"]["extractions"][0]["href"])) &&
                !(attVal.startsWith("http")) &&
                !(attVal.startsWith("#"))){
                return this.unnested_iocs["base"]["extractions"][0]["href"] + attVal;
            }
        }
        return attVal;
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
                            attributes[att_key] = "NULL";
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

    hasIocs(){
        for(let key in this.unnested_iocs){
            if(this.unnested_iocs[key]["extractions"] != null && this.unnested_iocs[key]["extractions"].length > 0){
                return true;
            }
        }
        for(let key in this.nested_iocs){
            if(this.nested_iocs[key]["extractions"] != null && this.nested_iocs[key]["extractions"].length > 0){
                return true;
            }
        }
        return false;
    }
}

class OuterTag{
    constructor(extractions, innerTags){
        this.extractions = extractions; //{att1:val1,att2:val2...}
        this.innerTags = innerTags; //[InnerTag, InnerTag,...]
    }

    equals(outerTag){
        if(this.extractions != null && outerTag.extractions != null){
            for(let att in this.extractions){
                if(!(att in outerTag.extractions) || (att in outerTag.extractions && outerTag.extractions[att] !== this.extractions[att])){
                    return false;
                }
            }
            for(let att in outerTag.extractions){
                if(!(att in this.extractions)){
                    return false;
                }
            }
        }else if((this.extractions == null && outerTag.extractions != null) || (this.extractions != null && outerTag.extractions == null)){
            return false;
        }
        if(this.innerTags != null && outerTag.innerTags != null){
            for(let i=0; i<this.innerTags.length; i++){
                let foundEquivalent = false;
                for(let j=0; j<outerTag.innerTags.length; j++){
                    if(this.innerTags[i].equals(outerTag.innerTags[j])){
                        foundEquivalent = true;
                        break;
                    }
                }
                if(!foundEquivalent){
                    return false;
                }
            }
            for(let i=0; i<outerTag.innerTags.length; i++){
                let foundEquivalent = false;
                for(let j=0; j<this.innerTags.length; j++){
                    if(outerTag.innerTags[i].equals(this.innerTags[j])){
                        foundEquivalent = true;
                        break;
                    }
                }
                if(!foundEquivalent){
                    return false;
                }
            }
        }else if((this.innerTags == null && outerTag.innerTags != null) || (this.innerTags != null && outerTag.innerTags == null)){
            return false;
        }
        return true;
    }
}

class InnerTag{
    constructor(tag, extractions){
        this.tag = tag;
        this.extractions = extractions; //{att1:val1,att2:val2...}
    }

    equals(innerTag){
        if(this.extractions != null && innerTag.extractions != null) {
            for (let key in this.extractions) {
                if(!(key in innerTag.extractions) || (key in innerTag.extractions && innerTag.extractions[key] !== this.extractions[key])){
                    return false;
                }
            }
            for(let key in innerTag.extractions){
                if(!(key in this.extractions) || (key in this.extractions && this.extractions[key] !== innerTag.extractions[key])){
                    return false;
                }
            }
        }else if((this.extractions != null && innerTag.extractions == null) || (this.extractions == null && innerTag.extractions != null)){
            return false;
        }
        return true;
    }
}