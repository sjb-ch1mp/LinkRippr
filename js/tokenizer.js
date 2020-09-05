class Tokenizer{
    constructor(buffer){
        this.buffer = buffer;
        this.previous = null;
        this.current = null;
    }
}

class DOMTokenizer extends Tokenizer{

    constructor(buffer){
        super(buffer);
        //this.buffer = this.buffer.replace(new RegExp("(\\r\\n|\\n|\\r)", "g"), "");
        this.isScript = false;
        this.next();
    }

    next(){
        this.buffer = this.buffer.trimStart();
        if(this.buffer.length === 0){
            this.current = null;
            return;
        }

        let firstChar = this.buffer.charAt(0);
        let secondChar = this.buffer.length > 1 ? this.buffer.charAt(1) : null;

        if(this.current !== null && this.current.tokenType === DOMTokenType.DEFAULT_TAG_FINISH && this.isScript && firstChar !== '<'){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.SCRIPT, this.buffer.substring(0, this.getTokenEnd(['</script'])).trim());
        }else if(firstChar === '<' && secondChar != null && secondChar === '/'){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.CLOSE_TAG_START, '</');
        }else if(firstChar === '<' && secondChar != null && secondChar === '!') {
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.IGNORE_TAG, '<!');
        }else if(firstChar === '<'){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.OPEN_TAG_START, '<');
        }else if(firstChar === '/' && secondChar != null && secondChar === '>'){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.VOID_TAG_FINISH, '/>');
        }else if(firstChar === '>'){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.DEFAULT_TAG_FINISH, '>');
        }else if(firstChar === '='){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.EQUALS, '=');
        }else if(firstChar === '\"'){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.QUOTE, "\"");
        }else if (this.current.tokenType === DOMTokenType.OPEN_TAG_START){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.OPEN_TAG_NAME, this.buffer.substring(0, this.getTokenEnd([' ', '>', '/>'])).toLowerCase());
            if(this.current.value === "script"){
                this.isScript = true;
            }
        }else if(this.current.tokenType === DOMTokenType.CLOSE_TAG_START){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.CLOSE_TAG_NAME, this.buffer.substring(0, this.getTokenEnd([' ', '>', '/>'])).toLowerCase());
            if(this.current.value === "script"){
                    this.isScript = false;
            }
        }else if(this.current.tokenType === DOMTokenType.QUOTE && this.previous.tokenType === DOMTokenType.EQUALS){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.ATT_VALUE, this.buffer.substring(0, this.getTokenEnd(['\"'])));
        }else if(this.current.tokenType === DOMTokenType.IGNORE_TAG){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.IGNORE, this.buffer.substring(0, this.getTokenEnd(['>'])));
        }else if(this.current.tokenType === DOMTokenType.OPEN_TAG_NAME || this.current.tokenType === DOMTokenType.BOOL_ATT ||
            (this.current.tokenType === DOMTokenType.QUOTE && this.previous.tokenType !== DOMTokenType.DEFAULT_TAG_FINISH)){
            this.previous = this.current;
            if(this.isBooleanAttribute()){
                this.current = new DOMToken(DOMTokenType.BOOL_ATT, this.buffer.substring(0, this.getTokenEnd([' '])).toLowerCase());
            }else{
                this.current = new DOMToken(DOMTokenType.ATT_KEY, this.buffer.substring(0, this.getTokenEnd(['='])).toLowerCase());
            }
        }else{
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.CONTENT, this.buffer.substring(0, this.getTokenEnd(['<'])).trim().replace(new RegExp("[\n\r]", "g"), " "));
        }
        this.buffer = this.buffer.substring(this.current.value.length);
    }

    isBooleanAttribute(){
        let idx = 0;
        let idxEquals = 0;
        let idxSpace = 0;
        while(idx < this.buffer.length){
            if(idxSpace === 0 && this.buffer.charAt(idx) === ' '){
                idxSpace = idx;
                if(idxEquals > 0){ break; }
            }else if(idxEquals === 0 && this.buffer.charAt(idx) === '='){
                idxEquals = idx;
                if(idxSpace > 0){ break; }
            }
            idx++;
        }
        if(idxSpace === 0 && idxEquals > 0){
            return false;
        }else return idxSpace < idxEquals;
    }

    getTokenEnd(markers){
        let idx = 0;
        let len = this.buffer.length;
        while(idx < len){
            for(let i=0; i<markers.length; i++){
                if(markers[i].length > 1){
                    if(idx < len + 1 && markers.includes(this.buffer.substring(idx, idx + markers[i].length).toLowerCase())){
                        return idx;
                    }
                }else{
                    if(markers.includes(this.buffer.charAt(idx).toLowerCase())){
                        return idx;
                    }
                }
            }
            idx++;
        }
        return idx;
    }

    hasNext(){
        return this.current != null;
    }
}

class ScriptTokenizer extends Tokenizer{

    constructor(buffer){
        super(buffer);
        this.stringOpenSingle = false;
        this.stringOpenDouble = false;
        this.next();
    }

    next(){
        this.buffer = this.buffer.trimStart();
        if(this.buffer.length === 0){
        	this.current = null;
        	return;
        }
        
        let firstChar = this.buffer.charAt(0);
        let secondChar = this.buffer.length > 1 ? this.buffer.charAt(1) : null;

        if(this.current != null && this.current.tokenType === ScriptTokenType.SINGLE_QUOTE && this.stringOpenSingle){
            let idx = 0;
            while(idx < this.buffer.length && this.buffer.charAt(idx) !== this.current.value){
                idx++;
            }
            this.previous = this.current;
            this.current = new ScriptToken(ScriptTokenType.STRING, this.buffer.substring(0, idx));
        }else if(this.current != null && this.current.tokenType === ScriptTokenType.DOUBLE_QUOTE && this.stringOpenDouble){
            let idx = 0;
            while(idx < this.buffer.length && this.buffer.charAt(idx) !== this.current.value){
                idx++;
            }
            this.previous = this.current;
            this.current = new ScriptToken(ScriptTokenType.STRING, this.buffer.substring(0, idx));
        }else if(this.current != null && this.current.tokenType === ScriptTokenType.SINGLE_LINE_COMMENT_START){
            let idx = 0;
            while(idx < this.buffer.length && this.buffer.charAt(idx).match(/[\n\r]+/) == null){
                idx++;
            }
            this.previous = this.current;
            this.current = new ScriptToken(ScriptTokenType.COMMENT, this.buffer.substring(0, idx).trim());
        }else if(this.current != null && this.current.tokenType === ScriptTokenType.MULTI_LINE_COMMENT_START){
            let idx = 0;
            while(idx < this.buffer.length - 1 && this.buffer.substring(idx, idx + 2) !== "*/"){
                idx++;
            }
            this.previous = this.current;
            this.current = new ScriptToken(ScriptTokenType.COMMENT, this.buffer.substring(0, idx).trim().replace(/\\r\\n|\\n|\\r/g, " "));
        }else if(firstChar === ';'){
        	this.previous = this.current;
        	this.current = new ScriptToken(ScriptTokenType.END_OF_STATEMENT, ';');
        }else if(firstChar === '.'){
           	this.previous = this.current;
        	this.current = new ScriptToken(ScriptTokenType.QUALIFIER, '.');
        }else if(firstChar === '('){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.LEFT_PARENTHESIS, '(');
        }else if(firstChar === ')'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.RIGHT_PARENTHESIS, ')');
        }else if(firstChar === '{'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.LEFT_BRACE, '{');
        }else if(firstChar === '}'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.RIGHT_BRACE, '}');
        }else if(firstChar === '['){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.LEFT_BRACKET, '[');
        }else if(firstChar === '?'){
            this.previous = this.current;
            this.current = new ScriptToken(ScriptTokenType.TERNARY, '?');
        }else if(firstChar === ']'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.RIGHT_BRACKET, ']');
        }else if(firstChar === '~'){
            this.previous = this.current;
            this.current = new ScriptToken(ScriptTokenType.BITWISE_NOT, '~');
        }else if(firstChar === '^'){
            this.previous = this.current;
            this.current = new ScriptToken(ScriptTokenType.BITWISE_XOR, '^');
        }else if(firstChar === '\''){
            this.previous = this.current;
            if(secondChar != null && secondChar === '\''){
                this.current = new ScriptToken(ScriptTokenType.EMPTY_STRING_SINGLE_QUOTE, '\'\'');
            }else if(secondChar != null && secondChar === " "){
                let thirdChar = this.buffer.length > 2 ? this.buffer.charAt(2) : null;
                if(thirdChar != null && thirdChar === "\'"){
                    this.current = new ScriptToken(ScriptTokenType.SPACE_SINGLE_QUOTE, '\' \'');
                }else{
                    this.stringOpenDouble = !this.stringOpenDouble;
                    this.current = new ScriptToken(ScriptTokenType.DOUBLE_QUOTE, '\"');
                }
            }else{
                this.stringOpenSingle = !this.stringOpenSingle;
                this.current = new ScriptToken(ScriptTokenType.SINGLE_QUOTE, '\'');
            }
        }else if(firstChar === '\"'){
            this.previous = this.current;
            if(secondChar != null && secondChar === "\""){
                this.current = new ScriptToken(ScriptTokenType.EMPTY_STRING_DOUBLE_QUOTE, '\"\"');
            }else if(secondChar != null && secondChar === " "){
                let thirdChar = this.buffer.length > 2 ? this.buffer.charAt(2) : null;
                if(thirdChar != null && thirdChar === "\""){
                    this.current = new ScriptToken(ScriptTokenType.SPACE_DOUBLE_QUOTE, '\" \"');
                }else{
                    this.stringOpenDouble = !this.stringOpenDouble;
                    this.current = new ScriptToken(ScriptTokenType.DOUBLE_QUOTE, '\"');
                }
            }else{
                this.stringOpenDouble = !this.stringOpenDouble;
                this.current = new ScriptToken(ScriptTokenType.DOUBLE_QUOTE, '\"');
            }
        }else if(firstChar === ','){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.COMMA, ',');
        }else if(firstChar === ':'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.COLON, ':');
        }else if(firstChar === '&'){
           	this.previous = this.current;
           	if(secondChar != null && secondChar === '&'){
                this.current = new ScriptToken(ScriptTokenType.DOUBLE_AND, '&&');
            }else{
                this.current = new ScriptToken(ScriptTokenType.AND, '&');
            }
        }else if(firstChar === '|'){
           	this.previous = this.current;
           	if(secondChar != null && secondChar === '|'){
                this.current = new ScriptToken(ScriptTokenType.DOUBLE_OR, '||');
            }else{
                this.current = new ScriptToken(ScriptTokenType.OR, '|');
            }
        }else if(firstChar === '>'){
           	this.previous = this.current;
           	if(secondChar != null && secondChar === "="){
                this.current = new ScriptToken(ScriptTokenType.GREATER_THAN_EQUAL_TO, '>=');
            }else if(secondChar != null && secondChar === ">"){
                this.current = new ScriptToken(ScriptTokenType.RIGHT_SHIFT, '>>');
            }else{
                this.current = new ScriptToken(ScriptTokenType.GREATER_THAN, '>');
            }
        }else if(firstChar === '<'){
           	this.previous = this.current;
           	if(secondChar != null && secondChar === "="){
                this.current = new ScriptToken(ScriptTokenType.LESS_THAN_EQUAL_TO, '<=');
            }else if(secondChar != null && secondChar === "<"){
                this.current = new ScriptToken(ScriptTokenType.LEFT_SHIFT, '<<');
            }else{
                this.current = new ScriptToken(ScriptTokenType.LESS_THAN, '<');
            }
        }else if(firstChar === '='){
           	this.previous = this.current;
           	if(secondChar != null && secondChar === "="){
                let thirdChar = this.buffer.length > 2 ? this.buffer.charAt(2) : null;
           	    if(thirdChar != null && thirdChar === "="){
           	        this.current = new ScriptToken(ScriptTokenType.DOUBLE_EQUAL, '==');
                }else{
           	        this.current = new ScriptToken(ScriptTokenType.TRIPLE_EQUAL, '===');
                }
            }else{
                this.current = new ScriptToken(ScriptTokenType.EQUAL, '=');
            }
        }else if(firstChar === '!'){
           	this.previous = this.current;
           	if(secondChar != null && secondChar === "=") {
                let thirdChar = this.buffer.length > 2 ? this.buffer.charAt(2) : null;
                if(thirdChar != null && thirdChar === "="){
                    this.current = new ScriptToken(ScriptTokenType.NOT_DOUBLE_EQUAL, '!==');
                }else{
                    this.current = new ScriptToken(ScriptTokenType.NOT_EQUAL, '!=');
                }
            }else{
                this.current = new ScriptToken(ScriptTokenType.NOT, '!');
            }
        }else if(firstChar === '+'){
           	this.previous = this.current;
           	if(secondChar != null && secondChar === "+"){
                this.current = new ScriptToken(ScriptTokenType.INCREMENT, '++');
            }else if(secondChar != null && secondChar === "="){
                this.current = new ScriptToken(ScriptTokenType.PLUS_EQUAL, '+=');
            }else{
                this.current = new ScriptToken(ScriptTokenType.PLUS, '+');
            }
        }else if(firstChar === '-'){ //this is a comment
            this.previous = this.current;
            if(secondChar != null && secondChar === "-"){
                this.current = new ScriptToken(ScriptTokenType.DECREMENT, '--');
            }else if(secondChar != null && secondChar === "="){
                this.current = new ScriptToken(ScriptTokenType.MINUS_EQUAL, '-=');
            }else{
                this.current = new ScriptToken(ScriptTokenType.MINUS, '-');
            }

        }else if(firstChar === '/') {
            this.previous = this.current;
            if(secondChar != null && secondChar === '/'){
                this.current = new ScriptToken(ScriptTokenType.SINGLE_LINE_COMMENT_START, '//');
            }else if(secondChar != null && secondChar === '*'){
                this.current = new ScriptToken(ScriptTokenType.MULTI_LINE_COMMENT_START, "/*");
            }else if(secondChar != null && secondChar === '='){
                this.current = new ScriptToken(ScriptTokenType.DIVIDE_EQUAL, "/=");
            }else{
                this.current = new ScriptToken(ScriptTokenType.DIVIDE, '/');
            }
        }else if(firstChar === '*'){
            this.previous = this.current;
            if(secondChar != null && secondChar === '/'){
                this.current = new ScriptToken(ScriptTokenType.MULTI_LINE_COMMENT_END, '*/');
            }else if(secondChar != null && secondChar === '='){
                this.current = new ScriptToken(ScriptTokenType.MULTIPLY_EQUAL, '*=');
            }else{
                this.current = new ScriptToken(ScriptTokenType.MULTIPLY, '*');
            }
        }else if(firstChar === '%'){
           	this.previous = this.current;
           	if(secondChar != null && secondChar === "="){
                this.current = new ScriptToken(ScriptTokenType.MODULUS_EQUAL, '%=');
            }else{
                this.current = new ScriptToken(ScriptTokenType.MODULUS, '%');
            }
        }else{
            if(firstChar.match(/[a-zA-Z$_]/g) != null){
    			let idx = 0;
    			while(idx < this.buffer.length && this.buffer.charAt(idx).match(/[a-zA-Z0-9_\-]/g) != null){
    				idx++;
    			}
    			this.previous = this.current;
    			let word = this.buffer.substring(0, idx);
    			this.current = isReserved(word) ? new ScriptToken(ScriptTokenType.RESERVED_WORD, word) : new ScriptToken(ScriptTokenType.WORD, word);
        	}else if(firstChar.match(/[0-9]/) != null){
                let idx = 0;
                while(idx < this.buffer.length && this.buffer.charAt(idx).match(/[0-9]/) != null){
                    idx++;
                }
                this.previous = this.current;
                this.current = new ScriptToken(ScriptTokenType.INTEGER, this.buffer.substring(0, idx));
            }else{
        		let idx = 0; 
        		while(idx < this.buffer.length && this.buffer.charAt(idx) !== ' '){
        			idx++;
        		}
        		this.previous = this.current;
        		this.current = new ScriptToken(ScriptTokenType.OTHER, this.buffer.substring(0, idx));
        	}
        }

        if(this.current.value.length > 0){ //for those funky others that have zero length
            this.buffer = this.buffer.substring(this.current.value.length);
        }else{
            this.buffer = this.buffer.substring(this.current.value.length + 1);
        }
    }

    hasNext(){
        return this.current != null;
    }
}
/*
* FIXME: Issues
*
* DIVIDE: /
* OTHER: \.js$/.test(e)}(r)?function(e,r){var
*
* This should be a regexp
*
* */