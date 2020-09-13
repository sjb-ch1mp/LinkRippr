class ScriptParser{

    constructor(script){
        if(script.tokenType !== DOMTokenType.SCRIPT){
            throw "ScriptParser cannot parse content of DOMTokenType." + script.tokenType;
        }
        this.script = new Script(script.value);
        this.parseScript();
    }

    parseScript(){
        this.breakIntoStatements();

    }

    breakIntoStatements(){
        let _raw = this.script.raw;
        if(_raw <= 3){
            this.script.statements[0] = cleanString(_raw);
            return;
        }

        let quoteType = null;

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
        const FUNCTION_TAG = 'fun';
        const SINGLE_QUOTE = '\'';
        const DOUBLE_QUOTE = '"';

        //in conditionals
        let inMLComment = false;
        let inSingleComment = false;
        let inFunction = false;
        let inString = false;

        //depth counters
        let depthCodeBlock = 0;
        let depthFunction = 0;

        let statement = '';
        for(let i=0; i<_raw.length; i++){
            let buffer = this.setBuffer(i);

            if(i === _raw.length - 1){ //Check for the end of _raw
                statement += buffer[CURRENT];
                if(statement.trim() !== ""){
                    this.script.statements.push(statement.trim());
                }
            }else if(inString){
                statement += buffer[CURRENT];
                if(buffer[PREVIOUS] !== ESCAPE && ((buffer[CURRENT] === DOUBLE_QUOTE && quoteType === DOUBLE_QUOTE) ||
                        (buffer[CURRENT] === SINGLE_QUOTE && quoteType === SINGLE_QUOTE))){
                        inString = false;
                        quoteType = null;
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
                    inString = true;
                    statement += buffer[CURRENT];
                    quoteType = SINGLE_QUOTE;
                }else if(buffer[CURRENT] === SINGLE_QUOTE){
                    inString = true;
                    statement += buffer[CURRENT];
                    quoteType = DOUBLE_QUOTE;
                }else if(buffer[CURRENT] === CODE_BLOCK_OPEN){
                    depthCodeBlock++;
                    if(inFunction){
                        depthFunction++;
                    }
                    statement += buffer[CURRENT];
                }else if(buffer[CURRENT] === CODE_BLOCK_CLOSE){
                    depthCodeBlock--;
                    if(inFunction){
                        depthFunction--;
                        if(depthFunction === 0){
                            inFunction = false;
                        }
                    }
                    statement += buffer[CURRENT];
                }else if(buffer.join("") === FUNCTION_TAG && this.isFunction(i)){
                    inFunction = true;
                    statement += buffer[CURRENT];
                }else if(buffer[CURRENT] + buffer[NEXT] === SINGLE_LINE_COMMENT){
                    if(statement.trim() !== ""){
                        this.script.statements.push(statement.trim());
                    }
                    statement = '';
                    inSingleComment = true;
                }else if(buffer[CURRENT] + buffer[NEXT] === ML_COMMENT_OPEN){
                    if(statement.trim() !== ""){
                        this.script.statements.push(statement.trim());
                    }
                    statement = '';
                    inMLComment = true;
                }else if(buffer[CURRENT] === NEW_LINE){
                    if(statement.trim().length > 0 && depthCodeBlock === 0 && !inFunction){
                        this.script.statements.push(statement.trim());
                        statement = '';
                    }
                }else if(buffer[CURRENT] === END_STATEMENT){
                    if(statement.trim().length > 0 && depthCodeBlock === 0 && !inFunction){
                        this.script.statements.push((statement + END_STATEMENT).trim());
                        statement = '';
                    }else{
                        statement += buffer[CURRENT];
                    }
                }else{
                    statement += buffer[CURRENT];
                }
            }else{ //Interpret everything in this block as if a string literal
                statement += buffer[CURRENT];
            }
        }
    }

    isFunction(currentIdx){
        return currentIdx + 7 < this.script.raw.length && this.script.raw.substring(currentIdx - 1, currentIdx + 7) === "function ";
    }

    setBuffer(currentIdx){
        return [
            (currentIdx > 0)?this.script.raw.charAt(currentIdx - 1):null,
            this.script.raw.charAt(currentIdx),
            (currentIdx < this.script.raw.length - 1)?this.script.raw.charAt(currentIdx + 1):null
        ];
    }

}

class Script{
    constructor(raw) {
        this.raw = raw;
        this.statements = [];
        this.obfuscationTechniques = [];
    }

    prettyPrint(){
        return "Script.prettyPrint()";
    }
}

const OBFUSCATION_TECHNIQUE = {
    EVAL:"EVAL",
    ATOB:"ATOB",
    UNESCAPE:"UNESCAPE",
    DOC_WRITE:"DOC_WRITE"
}