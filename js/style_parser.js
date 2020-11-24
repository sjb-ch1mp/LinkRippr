class StyleParser{
    constructor(styleBlock, source){
        if(styleBlock.tokenType !== DOMTokenType.STYLE){
            throw "StyleParser cannot parse content of DOMTokenType." + styleBlock.tokenType;
        }
        this.styleBlock = new StyleBlock(styleBlock, source);
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
                            if(cssSig['value'].test(ruleSet['attributes'][attribute])){
                                cssSig['value'].lastIndex = 0;
                                if(!this.alreadyExists(name, ruleSet['selector'], attribute, ruleSet['attributes'][attribute])){
                                    if(!(name in this.styleBlock.detections)){
                                        this.styleBlock.detections[name] = [];
                                    }
                                    this.styleBlock.detections[name].push({
                                        'selector': ruleSet['selector'],
                                        'attribute': attribute,
                                        'value': ruleSet['attributes'][attribute],
                                        'condition':ruleSet['condition']
                                    });
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
    constructor(styleBlock, source){
        this.source = source;
        this._raw = styleBlock.value;
        this.ruleSets = this.processRuleSets(this.breakIntoRuleSets());
        this.detections = {};
    }

    breakIntoRuleSets(){
        let ruleSets = []; //[{'ruleSet':'','nested':true}, ..., {}]
        let start = 0;
        let rawRuleSets = [];

        //separate out all ruleSets
        while(start < this._raw.length){
            let nested = false;
            let braceNesting = 0;
            let finish = start;
            while(finish < this._raw.length){
                if(this._raw.charAt(finish) === '}'){
                    braceNesting--;
                    if(braceNesting === 0){
                        finish++;
                        break;
                    }
                }else if(this._raw.charAt(finish) === '{'){
                    braceNesting++;
                    if(braceNesting > 1){
                        nested = true;
                    }
                }
                finish++;
            }
            rawRuleSets.push({'ruleSet':this._raw.substring(start, finish),'nested':nested});
            start = finish;
        }

        //remove comments
        for(let i in rawRuleSets){
            let containsComments = false;
            let cleanRuleSetAry = [];
            let rawRuleSet = rawRuleSets[i]['ruleSet'];
            if(/(\/\*|\*\/)/.test(rawRuleSet)){
                containsComments = true;
                let rawRuleSetAry = rawRuleSet.split(/\//g);
                for(let j in rawRuleSetAry){
                    if(rawRuleSetAry[j].trim().length > 0 && !(rawRuleSetAry[j].startsWith('*') || rawRuleSetAry[j].endsWith('*'))){
                        cleanRuleSetAry.push(rawRuleSetAry[j]);
                    }
                }
            }
            let uncommentedRuleSet = stripNewLines(((containsComments)?cleanRuleSetAry.join(" "):rawRuleSet)).trim();
            if(uncommentedRuleSet.length > 0){
                ruleSets.push({'ruleSet':uncommentedRuleSet,'nested':rawRuleSets[i]['nested']});
            }
        }
        return ruleSets;
    }

    processRuleSets(ruleSets){ //ruleSets = [{'ruleSet':'','nested':true}, ..., {}]
        let ruleSetIdx = -1;
        let processedRuleSets = [] //[{selector:'',attributes:{key:'value', ..., key:'value'}, conditional:true}, ...]
        for(let i in ruleSets){
            let container = [];
            let condition = null;
            if(ruleSets[i]['nested']){
                if(ruleSets[i]['ruleSet'].startsWith("@")){
                    condition = ruleSets[i]['ruleSet'].split("{")[0].trim();
                    container = this.unwrapDeclarations(ruleSets[i]['ruleSet']);
                }
            }else{
                container.push(ruleSets[i]['ruleSet']);
            }

            for(let j in container){
                let ruleSet = container[j];
                try{
                    processedRuleSets.push({
                        'selector':(this.source === "style") ? ruleSet.split("{")[0].trim() : stylize(this.source),
                        'attributes':{},
                        'condition':condition
                    });
                    ruleSetIdx++;
                    let declarationString = (this.source === "style") ? ruleSet.split("{")[1].split("}")[0] : ruleSet;
                    let declarations = [];
                    if(declarationString.includes(";")) {
                        declarations = declarationString.split(";");
                    }else{
                        declarations.push(declarationString);
                    }
                    for(let k in declarations){
                        if(declarations[k].trim().length > 0){
                            let firstColon = declarations[k].indexOf(":");
                            let attribute = declarations[k].substring(0, firstColon).trim();
                            let value = declarations[k].substring(firstColon + 1, declarations[k].length).trim();
                            processedRuleSets[ruleSetIdx]['attributes'][attribute] = value;
                        }
                    }
                }catch(e){
                    console.log('[ERROR EXTRACTING RULESET] : "' + ruleSet + '"');
                }
            }
        }
        return processedRuleSets;
    }

    unwrapDeclarations(ruleSet){
        let unwrappedDeclarations = [];
        let declarations = ruleSet.substring(
            ruleSet.indexOf('{') + 1,
            ruleSet.lastIndexOf('}')
        ).trim().split('}');
        for(let i in declarations){
            if(declarations[i].trim().length > 0){
                unwrappedDeclarations.push(declarations[i] + "}");
            }
        }
        return unwrappedDeclarations;
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
                if(!alreadyIncludedInOutput(styleBlocks[i].detections[name][j], cssSignatureHits[name])){
                    cssSignatureHits[name].push(styleBlocks[i].detections[name][j]);
                }
            }
        }
    }
    return cssSignatureHits;
}

function alreadyIncludedInOutput(detection, sigHits){
    for(let i in sigHits){
        if(sigHits[i]['selector'] === detection['selector']
        && sigHits[i]['attribute'] === detection['attribute']
        && sigHits[i]['value'] === detection['value']
        && sigHits[i]['condition'] === detection['condition']){
            return true;
        }
    }
    return false;
}