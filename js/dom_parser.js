class DomParser{
    constructor(domString) {
        this.__raw__ = domString;

        //separate htmlSignatures into nested and unnested
        this.scripts = []; //[Script, Script, ...]
        this.conditionalHtml = []; //[{type:type, condition:condition, html:html}, ..., ]
        this.styleBlocks = []; //[StyleBlock, StyleBlock, ...]
        this.htmlSignatures = {};
        this.uniqueDomains = {'unique-domains':[]};
        for(let name in userSettings.htmlSignatures) {
            let processedSignature = this.processSignature(
                userSettings.htmlSignatures[name]['hasNested'],
                userSettings.htmlSignatures[name]['attributes']
            );
            this.htmlSignatures[name] = {
                'element': userSettings.htmlSignatures[name]['element'],
                'attributes': (processedSignature == null) ? userSettings.htmlSignatures[name]['attributes'] : processedSignature['attributes'],
                'value':userSettings.htmlSignatures[name]['value'],
                'nested_tags': (userSettings.htmlSignatures[name]['hasNested']) ? processedSignature['nestedTags'] : null,
                'nested': userSettings.htmlSignatures[name]['hasNested'],
                'detections': [] //if nested [OuterTag, ...], else [{attkey:attvalue, ...}]
            };
        }
        this.parseDom();
    }

    processSignature(nested, attList) {
        if(!nested){
            return null;
        }

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

        //1: Search for all HTML Signatures
        for(let name in this.htmlSignatures){
            //prepare variables for run
            let _tokenizer = new DOMTokenizer(this.__raw__);
            let signatureElement = this.htmlSignatures[name]['element'];
            let signatureAttributes = this.htmlSignatures[name]['attributes'];
            let nested = this.htmlSignatures[name]['nested'];
            let valueRegex = this.htmlSignatures[name]['value'];
            while(_tokenizer.hasNext()){
                if(_tokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME && (_tokenizer.current.value === signatureElement || signatureElement === "*")){
                    let element = _tokenizer.current.value;
                    if(!nested){
                        let currentAttributes = this.getCurrentAttributes(_tokenizer); //{key:val,key:val,...}
                        let detectedAttributes = {};
                        for(let key in currentAttributes){
                            if((signatureAttributes[0] === "*" || signatureAttributes.includes(key)) && valueRegex.test(currentAttributes[key])){
                                valueRegex.lastIndex = 0;
                                detectedAttributes[key] = currentAttributes[key]; //{key:val, ..., key:val}
                            }
                        }
                        if(Object.keys(detectedAttributes).length > 0){
                            let tag = new OuterTag(element, detectedAttributes, null);
                            if(!this.detectionExists(name, tag)){
                                this.htmlSignatures[name]['detections'].push(tag);
                            }
                        }
                    }else{
                        let outerTag = this.parseNestedTag(element, valueRegex, signatureElement, signatureAttributes, this.htmlSignatures[name]['nested_tags'], _tokenizer);
                        if(!(outerTag.detections == null && outerTag.innerTags == null) && !this.detectionExists(name, outerTag)){
                            this.htmlSignatures[name]["detections"].push(outerTag);
                        }
                    }
                }
                _tokenizer.next();
            }
        }

        //2: Extract all SCRIPT elements, all STYLE elements/attributes, and all CONDITIONAL COMMENTS
        let holdConditionalTag = null;
        let _tokenizer = new DOMTokenizer(this.__raw__);
        while(_tokenizer.hasNext()){
            if(_tokenizer.current.tokenType === DOMTokenType.SCRIPT){
                let scriptParser = new ScriptParser(_tokenizer.current);
                this.scripts.push(scriptParser.script);
            }else if(_tokenizer.current.tokenType === DOMTokenType.STYLE){
                let styleParser = new StyleParser(_tokenizer.current, "style");
                this.styleBlocks.push(styleParser.styleBlock);
            }else if((_tokenizer.current.tokenType === DOMTokenType.OPEN_TAG_DLH ||
                _tokenizer.current.tokenType === DOMTokenType.OPEN_TAG_DLR)
                && userSettings.getOption('conditionalComments')){
                let current = _tokenizer.current;
                holdConditionalTag = {
                    'type':(current.tokenType === DOMTokenType.OPEN_TAG_DLH)?"hidden":"revealed",
                    'condition':current.value
                };
            }else if((_tokenizer.current.tokenType === DOMTokenType.CONDITIONAL_HTML_DLH ||
                _tokenizer.current.tokenType === DOMTokenType.CONDITIONAL_HTML_DLR)
                && userSettings.getOption('conditionalComments')) {
                let current = _tokenizer.current;
                if(holdConditionalTag !== null && current.value.trim().length > 0){
                    this.conditionalHtml.push({
                        'type':holdConditionalTag['type'],
                        'condition':holdConditionalTag['condition'],
                        'html':current.value
                    });
                    holdConditionalTag = null;
                }else{
                    this.conditionalHtml.push({
                        'type':'unknown',
                        'condition':'unknown',
                        'html':current.value
                    });
                }
            }else if(_tokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME){
                let tagName = _tokenizer.current.value;
                let attributes = this.getCurrentAttributes(_tokenizer);
                if(attributes !== null && 'style' in attributes){
                    let styleParser = new StyleParser(new DOMToken(DOMTokenType.STYLE, attributes['style']), tagName);
                    this.styleBlocks.push(styleParser.styleBlock);
                }
            }
            _tokenizer.next();
        }
    }

    detectionExists(name, tag){
        let detections = this.htmlSignatures[name]['detections'];
        for(let i in detections) {
            if(detections[i].equals(tag)) {
                return true;
            }
        }
        return false;
    }

    parseNestedTag(element, valueRegex, tag, outerTagAttributes, nestedTags, tokenizer){
        let outerTag = new OuterTag(element, null, null);

        let allAttributes = this.getCurrentAttributes(tokenizer);
        let attributesOfInterest = {};
        for(let key in allAttributes){
            if((outerTagAttributes[0] === "*" || outerTagAttributes.includes(key)) && valueRegex.test(allAttributes[key])){
                valueRegex.lastIndex = 0;
                attributesOfInterest[key] = allAttributes[key];
            }
        }
        if(Object.keys(attributesOfInterest).length > 0){
            outerTag.detections = attributesOfInterest;
        }

        let sameTagNameNesting = 1;
        while(tokenizer.hasNext() && sameTagNameNesting > 0){
            if(tokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME && tokenizer.current.value in nestedTags){
                if(tokenizer.current.value === tag){
                    sameTagNameNesting++;
                }

                let t = tokenizer.current.value;
                let innerTag = new InnerTag(t, null);
                allAttributes = this.getCurrentAttributes(tokenizer);
                attributesOfInterest = {};
                for(let key in allAttributes){
                    if((nestedTags[t][0] === "*" || nestedTags[t].includes(key))){
                        attributesOfInterest[key] = allAttributes[key];
                    }
                }
                if(Object.keys(attributesOfInterest).length > 0){
                    innerTag.detections = attributesOfInterest;
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

    getCurrentAttributes(tokenizer){
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
    }

    extractUniqueDomains(){
        let domain;
        let urlLike = /http(s)?(:|%3A)\/\/.*\..*/g;
        //get url-like detections from html signatures
        if(this.hasHtmlDetections()){
            for(let name in this.htmlSignatures){
                for(let i in this.htmlSignatures[name]['detections']){
                    let outerTag = this.htmlSignatures[name]['detections'][i];
                    for(let key in outerTag.detections){
                        if(urlLike.test(outerTag.detections[key])){
                            urlLike.lastIndex = 0;
                            this.addDomain(outerTag.detections[key]);
                        }
                    }
                    if(outerTag.innerTags !== null){
                        for(let j in outerTag.innerTags){
                            for(let key in outerTag.innerTags[j]['detections']){
                                if(urlLike.test(outerTag.innerTags[j]['detections'][key])){
                                    urlLike.lastIndex = 0;
                                    this.addDomain(outerTag.innerTags[j]['detections'][key]);
                                }
                            }
                        }
                    }
                }
            }
        }

        //get url-like detections from javascript signatures
        if(this.hasJavaScriptDetections()){
            let jsDetections = getDetectedSignatures(this.scripts, 'detection');
            for(let name in jsDetections){
                for(let i in jsDetections[name]){
                    if(urlLike.test(jsDetections[name])){
                        urlLike.lastIndex = 0;
                        this.addDomain(jsDetections[name][i]);
                    }
                }
            }
        }

        //get url-like detections from css signatures
        if(this.hasCssDetections()){
            let cssDetections = getCssSignatureHits(this.styleBlocks);
            for(let name in cssDetections){
                for(let i in cssDetections[name]){
                    if(urlLike.test(cssDetections[name][i]['value'])){
                        urlLike.lastIndex = 0;
                        this.addDomain(cssDetections[name][i]['value']);
                    }
                }
            }
        }

        this.uniqueDomains['unique-domains'].sort();
    }

    addDomain(url){
        let domains = this.extractDomainsFromUrl(url);
        for(let i in domains){
            if(!(this.uniqueDomains['unique-domains'].includes(domains[i]))){
                this.uniqueDomains['unique-domains'].push(domains[i]);
            }
        }
    }

    extractDomainsFromUrl(url){
        let domains = [];
        let possibleDomains = url.split('http');
        for(let i=1; i<possibleDomains.length; i++){
            if(/^(s)?(:|%3A)\/\//g.test(possibleDomains[i])){
                let possibleDomain = possibleDomains[i].substring(possibleDomains[i].indexOf('//') + 2, possibleDomains[i].length);
                let endOfDomain = 0;
                while(endOfDomain < possibleDomain.length && /[a-zA-Z0-9\-\.]/.test(possibleDomain.charAt(endOfDomain))){
                    endOfDomain++;
                }
                possibleDomain = possibleDomain.substring(0, endOfDomain);
                if(possibleDomain.trim().length > 0){
                    domains.push(possibleDomain);
                }
            }
        }
        return domains;
    }

    hasDetections(){
        if(areJavaScriptSignatureHits(this.scripts, "deobfuscation") || areJavaScriptSignatureHits(this.scripts, "detection")){
            return true;
        }
        if(this.conditionalHtml.length > 0){
            return true;
        }
        if(areCssSignatureHits(this.styleBlocks)){
            return true;
        }
        for(let key in this.htmlSignatures){
            if(this.htmlSignatures[key]["detections"].length > 0){
                return true;
            }
        }
        return false;
    }

    hasHtmlDetections(){
        for(let name in this.htmlSignatures){
            if(this.htmlSignatures[name]['detections'].length > 0){
                return true;
            }
        }
        return false;
    }

    hasJavaScriptDetections(){
        return areJavaScriptSignatureHits(this.scripts, 'detection');
    }

    hasCssDetections(){
        return areCssSignatureHits(this.styleBlocks);
    }

    hasObfuscationDetections(){
        return areJavaScriptSignatureHits(this.scripts, 'deobfuscation')
    }

    hasConditionalHtmlDetections(){
        return this.conditionalHtml.length > 0;
    }

    groupConditionalHtmlDetectionsByCondition(){
        let detectionsByCondition = {};
        for(let i in this.conditionalHtml){
            if(this.conditionalHtml[i]['condition'] !== 'unknown'){ //ignore unknowns for the time being
                let condition = this.conditionalHtml[i]['condition'].trim().replace(/\s/g, '-');
                if(!(condition in detectionsByCondition)){
                    detectionsByCondition[condition] = [];
                }
                detectionsByCondition[condition].push({
                    'type':this.conditionalHtml[i]['type'],
                    'html':this.conditionalHtml[i]['html']
                });
            }
        }
        return detectionsByCondition;
    }
}

class OuterTag{
    constructor(tag, detections, innerTags){
        this.tag = tag;
        this.detections = detections; //{att1:val1,att2:val2...}
        this.innerTags = innerTags; //[InnerTag, InnerTag,...]
    }

    equals(outerTag){
        if(this.detections != null && outerTag.detections != null){
            for(let att in this.detections){
                if(!(att in outerTag.detections) || (att in outerTag.detections && outerTag.detections[att] !== this.detections[att])){
                    return false;
                }
            }
            for(let att in outerTag.detections){
                if(!(att in this.detections)){
                    return false;
                }
            }
        }else if((this.detections == null && outerTag.detections != null) || (this.detections != null && outerTag.detections == null)){
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
    constructor(tag, detections){
        this.tag = tag;
        this.detections = detections; //{att1:val1,att2:val2...}
    }

    equals(innerTag){
        if(this.detections != null && innerTag.detections != null) {
            for (let key in this.detections) {
                if(!(key in innerTag.detections) || (key in innerTag.detections && innerTag.detections[key] !== this.detections[key])){
                    return false;
                }
            }
            for(let key in innerTag.detections){
                if(!(key in this.detections) || (key in this.detections && this.detections[key] !== innerTag.detections[key])){
                    return false;
                }
            }
        }else if((this.detections != null && innerTag.detections == null) || (this.detections == null && innerTag.detections != null)){
            return false;
        }
        return true;
    }
}