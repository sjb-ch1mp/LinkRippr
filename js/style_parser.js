class StyleParser{
    constructor(styleBlock){
        if(styleBlock.tokenType !== DOMTokenType.STYLE){
            throw "ScriptParser cannot parse content of DOMTokenType." + styleBlock.tokenType;
        }
        this.styleBlock = new StyleBlock(styleBlock);
        this.parseStyleBlock();
    }

    parseStyleBlock(){
        for(let i in this.styleBlock.ruleSets){
            let ruleSet = this.styleBlock.ruleSets[i];
            for(let name in userSettings.cssSignatures){
                let cssSig = userSettings.cssSignatures[name];
                if(cssSig['selector'].test(ruleSet['selector'])){
                    cssSig['selector'].lastIndex = 0;
                    for(let attribute in ruleSet['attributes']){
                        if(cssSig['attribute'].test(attribute)){
                            cssSig['attribute'].lastIndex = 0;
                            for(let j in ruleSet['attributes'][attribute]){
                                if(cssSig['value'].test(ruleSet['attributes'][attribute][j])){
                                    cssSig['value'].lastIndex = 0;
                                    if(!this.alreadyExists(name, ruleSet['selector'], attribute, ruleSet['attributes'][attribute][j])){
                                        if(!(name in this.styleBlock.detections)){
                                            this.styleBlock.detections[name] = [];
                                        }
                                        this.styleBlock.detections[name].push({
                                            'selector': ruleSet['selector'],
                                            'attribute': attribute,
                                            'value': ruleSet['attributes'][attribute][j]
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    alreadyExists(name, selector, attribute, value){
        if(Object.keys(this.styleBlock.detections).length > 0){
            for(let key in this.styleBlock.detections){
                for(let i in this.styleBlock.detections[name]){
                    let detection = this.styleBlock.detections[name][i];
                    if(detection['selector'] === selector && detection['attribute'] === attribute && detection['value'] === value){
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

class StyleBlock{
    constructor(styleBlock){
        this._raw = styleBlock.value;
        this.ruleSets = this.breakIntoRuleSets();
        this.detections = {};
    }

    breakIntoRuleSets(){
        let ruleSetIdx = -1;
        let ruleSets = []; //[{selector:'',attributes:{key:[value, ..., value]}}, ...]
        let selector = "";
        let key = "";
        let value = "";
        let isSelector = true;
        let isKey = false;
        let isValue = false;
        let i = -1;
        let inComment = false;
        const PREV = 0;
        const CURRENT = 1;
        const NEXT = 2;

        while(i < this._raw.length){
            i++;
            let buffer = this.setBuffer(i);
            if(buffer[CURRENT] + buffer[NEXT] === this.styleToken('OPEN_COMMENT')){
                inComment = true;
            }else if(buffer[CURRENT] + buffer[NEXT] === this.styleToken('CLOSE_COMMENT') && inComment){
                inComment = false;
                i++;
            }else if(!inComment){
                if(buffer[CURRENT] === this.styleToken('OPEN_BRACE')){
                    selector = stripNewLines(selector).trim();
                    isSelector = false;
                    isKey = true;
                    ruleSets.push({'selector':selector,'attributes':{}});
                    ruleSetIdx++;
                    key = "";
                    value = "";
                }else if(buffer[CURRENT] === this.styleToken('CLOSE_BRACE')){
                    isValue = false;
                    isSelector = true;
                    selector = "";
                    key = "";
                    value = "";
                }else if(buffer[CURRENT] === this.styleToken('COLON')){
                    if(isSelector){
                        selector += buffer[CURRENT]; //conditional for pseudo-classes, e.g. a:link
                    }else{
                        key = stripNewLines(key).trim();
                        isKey = false;
                        isValue = true;
                        ruleSets[ruleSetIdx]['attributes'][key] = [];
                        value = "";
                    }
                }else if(buffer[CURRENT] === this.styleToken('TERMINATOR')){
                    value = stripNewLines(value).trim();
                    isValue = false;
                    isKey = true;
                    let values = value.split(" ");
                    if(values.length === 1){
                        ruleSets[ruleSetIdx]['attributes'][key].push(value);
                    }else{
                        for(let j in values){
                            let v = values[j].trim();
                            if(v.length !== 0){
                                if(v.endsWith(",")){
                                    v = v.substring(0, v.length - 1);
                                }
                                ruleSets[ruleSetIdx]['attributes'][key].push(v);
                            }
                        }
                    }
                    value = "";
                    key = "";
                }else if(!(buffer[PREV] === " " && buffer[CURRENT] === " ") && !inComment){ //remove multiple spaces
                    if(isSelector){
                        selector += buffer[CURRENT];
                    }else if(isKey){
                        key += buffer[CURRENT];
                    }else if(isValue){
                        value += buffer[CURRENT];
                    }
                }
            }
        }

        return ruleSets;
    }

    setBuffer(currentIdx){
        return [
            (currentIdx > 0)?this._raw.charAt(currentIdx - 1):null,
            this._raw.charAt(currentIdx),
            (currentIdx < this._raw.length - 1)?this._raw.charAt(currentIdx + 1):null
        ];
    }

    styleToken(name){
        switch(name){
            case 'OPEN_BRACE': return '{';
            case 'CLOSE_BRACE': return '}';
            case 'COLON': return ':';
            case 'TERMINATOR': return ';';
            case 'OPEN_PAREN': return '(';
            case 'CLOSE_PAREN': return ')';
            case 'OPEN_COMMENT': return '/*';
            case 'CLOSE_COMMENT': return '*/';
            case 'FALLBACK_SEPARATOR': return ',';
        }
    }
}

function areCssSignatureHits(styleBlocks){
    if(styleBlocks.length > 0){
        for(let i in styleBlocks){
            if(Object.keys(styleBlocks[i].detections).length > 0){
                return true;
            }
        }
    }
    return false;
}

function getCssSignatureHits(styleBlocks){
    let cssSignatureHits = {};
    for(let i in styleBlocks){
        for(let name in styleBlocks[i].detections){
            if(!(name in cssSignatureHits)){
                cssSignatureHits[name] = [];
            }
            for(let j in styleBlocks[i].detections[name]){
                cssSignatureHits[name].push(styleBlocks[i].detections[name][j])
            }
        }
    }
    return cssSignatureHits;
}