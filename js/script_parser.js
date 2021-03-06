class ScriptParser{

    constructor(script){
        if(script.tokenType !== DOMTokenType.SCRIPT){
            throw "ScriptParser cannot parse content of DOMTokenType." + script.tokenType;
        }
        this.signatures = userSettings.javaScriptSignatures;
        this.script = new Script(script.value);
        this.parseScript();
    }

    parseScript(){
        if(this.script.statements != null){
            let statements = this.script.statements;
            for(let i in statements){
                statements[i].checkForSignatures(this.signatures, false);
                if(userSettings.getOption('simpleDeob')){
                    statements[i].checkForSignatures(userSettings.getOption('deobSignatures'), true);
                }
            }
        }
    }

}

class Script{
    constructor(raw) {
        this._raw = raw;
        this.statements = null;
        this.breakIntoStatements();
    }

    breakIntoStatements(){

        if(this._raw.trim().length === 0){
            return;
        }else{
            this.statements = [];
        }

        //pseudo-tokens
        const PREVIOUS = 0;
        const CURRENT = 1;
        const NEXT = 2;
        const NEW_LINE = '\n';
        const END_STATEMENT = ';';
        const ESCAPE = '\\';
        const CODE_BLOCK_OPEN = '{';
        const CODE_BLOCK_CLOSE = '}';
        const SINGLE_LINE_COMMENT = '//';
        const ML_COMMENT_OPEN = '/*';
        const ML_COMMENT_CLOSE = '*/';
        const SINGLE_QUOTE = '\'';
        const DOUBLE_QUOTE = "\"";
        const OPEN_PAREN = "(";
        const CLOSE_PAREN = ")";

        //in conditionals
        let inMLComment = false;
        let inSingleComment = false;
        let inString = false;

        //depth counters
        let depthParen = 0;
        let depthCodeBlock = 0;

        let quoteType = SINGLE_QUOTE;
        let statement = '';
        for(let i=0; i<this._raw.length; i++){
            let buffer = this.setBuffer(i);

            if(i === this._raw.length - 1){ //Check for the end of _raw
                statement += buffer[CURRENT];
                if(statement.trim().length > 0){
                    this.statements.push(new Statement(stripNewLines(statement.trim())));
                }
            }else if(inString){
                statement += buffer[CURRENT];
                if(buffer[PREVIOUS] !== ESCAPE && ((buffer[CURRENT] === DOUBLE_QUOTE && quoteType === DOUBLE_QUOTE) ||
                    (buffer[CURRENT] === SINGLE_QUOTE && quoteType === SINGLE_QUOTE))){
                    quoteType = null;
                    inString = false;
                }
            }else if(inSingleComment){ //Check for single line comment exit
                if(buffer[CURRENT] === NEW_LINE){
                    inSingleComment = false;
                }
            }else if(inMLComment){ //Check for multi-line comment exit
                if(buffer[PREVIOUS] + buffer[CURRENT] === ML_COMMENT_CLOSE){
                    inMLComment = false;
                }
            }else if(buffer[PREVIOUS] !== ESCAPE){ //Interpret everything in this block as if NOT a string literal
                if(buffer[CURRENT] === DOUBLE_QUOTE){
                    statement += buffer[CURRENT];
                    quoteType = DOUBLE_QUOTE;
                    inString = true;
                }else if(buffer[CURRENT] === SINGLE_QUOTE){
                    statement += buffer[CURRENT];
                    quoteType = SINGLE_QUOTE;
                    inString = true;
                }else if(buffer[CURRENT] === CODE_BLOCK_OPEN){
                    statement += buffer[CURRENT];
                    depthCodeBlock++;
                }else if(buffer[CURRENT] === CODE_BLOCK_CLOSE){
                    statement += buffer[CURRENT];
                    depthCodeBlock--;
                }else if(buffer[CURRENT] === OPEN_PAREN){
                    statement += buffer[CURRENT];
                    depthParen++;
                }else if(buffer[CURRENT] === CLOSE_PAREN){
                    statement += buffer[CURRENT];
                    depthParen--;
                }else if(buffer[CURRENT] + buffer[NEXT] === SINGLE_LINE_COMMENT && buffer[PREVIOUS] !== ":"/*this should exclude urls*/){
                    inSingleComment = true;
                }else if(buffer[CURRENT] + buffer[NEXT] === ML_COMMENT_OPEN){
                    inMLComment = true;
                }else if(buffer[CURRENT] === NEW_LINE){
                    if(statement.trim().length > 0 && depthCodeBlock === 0 && depthParen === 0){
                        if(statement.trim().length > 0){
                            this.statements.push(new Statement(stripNewLines(statement.trim() + END_STATEMENT)));
                            statement = '';
                        }
                    }
                }else if(buffer[CURRENT] === END_STATEMENT){
                    if(statement.trim().length > 0 && depthCodeBlock === 0 && depthParen === 0){
                        if(statement.trim().length > 0){
                            this.statements.push(new Statement(stripNewLines(statement.trim() + END_STATEMENT)));
                            statement = '';
                        }
                    }else{
                        statement += buffer[CURRENT];
                    }
                }else{
                    statement += buffer[CURRENT];
                }
            }else{
                statement += buffer[CURRENT];
            }
        }
    }

    setBuffer(currentIdx){
        return [
            (currentIdx > 0)?this._raw.charAt(currentIdx - 1):null,
            this._raw.charAt(currentIdx),
            (currentIdx < this._raw.length - 1)?this._raw.charAt(currentIdx + 1):null
        ];
    }
}

class Statement{
    constructor(raw){
        this._raw = raw;
        this.detections = [];
        this.deobfuscationHits = [];
    }

    checkForSignatures(signatures, attemptDeobfuscation){
        for(let key in signatures){
            let lengthExceeded = false;
            let global = signatures[key]["global"];
            if(global.test(this._raw)){
                global.lastIndex = 0;
                //signature exists in the statement
                if(this._raw.length <= 100 && !attemptDeobfuscation){
                    if(!(this.alreadyExists(key, this._raw))){
                        this.detections.push({
                            "signature":key,
                            "tag":this._raw
                        });
                    }
                }else{
                    let sticky = signatures[key]["sticky"];
                    let stickyIdx = -1;
                    while(stickyIdx < this._raw.length){
                        //search the entire statement
                        stickyIdx++;
                        sticky.lastIndex = stickyIdx;
                        if(sticky.test(this._raw)){
                            //this is the first character of a match
                            let breakIdx = stickyIdx;
                            while(breakIdx < this._raw.length){
                                breakIdx++;
                                if(breakIdx >= 20000){
                                    lengthExceeded = true;
                                    let tag = this._raw.substring(stickyIdx, breakIdx);
                                    if(!(this.alreadyExists(key, tag))){
                                        this.detections.push({
                                            "signature":key,
                                            "tag":tag
                                        });
                                    }
                                    break;
                                }else if(global.test(this._raw.substring(stickyIdx, breakIdx))){
                                    global.lastIndex = 0;
                                    //this is the last character of a match
                                    if(attemptDeobfuscation){
                                        let tag = attemptToDeobfuscate(key, this._raw.substring(stickyIdx, breakIdx), signatures[key]["unwrap"]);
                                        this.deobfuscationHits.push({
                                            "signature":key,
                                            "tag":(tag !== undefined)?tag:"[FAIL]" + this._raw.substring(stickyIdx, breakIdx)
                                        });
                                    }else{
                                        let tag = this._raw.substring(stickyIdx, breakIdx);
                                        if(!(this.alreadyExists(key, tag))){
                                            this.detections.push({
                                                "signature":key,
                                                "tag":tag
                                            });
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        if(lengthExceeded){
                            break;
                        }
                    }
                }
            }
            if(lengthExceeded){
                break;
            }
        }
    }

    alreadyExists(key, tag){
        for(let i in this.detections){
            if(this.detections[i]["signature"] === key && this.detections[i]["tag"].includes(tag)){
                return true;
            }
        }
        return false;
    }

}

function areJavaScriptSignatureHits(scripts, type){
    for(let i in scripts){
        for(let j in scripts[i].statements){
            let hits = (type === 'deobfuscation') ? scripts[i].statements[j].deobfuscationHits : scripts[i].statements[j].detections;
            if(hits.length > 0){
                return true;
            }
        }
    }
    return false;
}

function getDetectedSignatures(scripts, type){
    let signatures = {};
    for(let i in scripts){
        for(let j in scripts[i].statements){
            let detections = (type === 'deobfuscation') ? scripts[i].statements[j].deobfuscationHits : scripts[i].statements[j].detections;
            if(detections.length > 0){
                for(let k in detections){
                    let signature = detections[k]["signature"];
                    if(!(signature in signatures)){
                        signatures[signature] = [];
                    }
                    if(!signatures[signature].includes(detections[k]["tag"])){
                        signatures[signature].push(detections[k]["tag"]);
                    }
                }
            }
        }
    }
    return signatures;
}

function attemptToDeobfuscate(key, tag, unwrap){
    try{
        let dom = unescape(tag.replace(unwrap, '').trim());
        let domParser = new DomParser(dom);
        if(domParser.hasDetections()){
            return domParser;
        }else{
            return checkLength('[SUCCESS]' + dom, 100);
        }

    }catch(err){
        return checkLength('[FAIL]' + tag);
    }
}