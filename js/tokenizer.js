class Tokenizer{
    constructor(buffer){
        this.buffer = buffer.replace(new RegExp("(\\r\\n|\\n|\\r)", "g"), "");
        this.previous = null;
        this.current = null;
    }
}

class DOMTokenizer extends Tokenizer{

    constructor(buffer){
        super(buffer);
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

        if(firstChar === '<' && secondChar != null && secondChar === '/'){
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
        }else if(this.current.tokenType === DOMTokenType.OPEN_TAG_START || this.current.tokenType === DOMTokenType.CLOSE_TAG_START){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.TAG_NAME, this.buffer.substring(0, this.getTokenEnd([' ', '>', '/>'])).toLowerCase());
        }else if(this.current.tokenType === DOMTokenType.QUOTE && this.previous.tokenType === DOMTokenType.EQUALS){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.ATT_VALUE, this.buffer.substring(0, this.getTokenEnd(['\"'])).toLowerCase());
        }else if(this.current.tokenType === DOMTokenType.TAG_NAME || this.current.tokenType === DOMTokenType.QUOTE){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.ATT_KEY, this.buffer.substring(0, this.getTokenEnd(['='])));
        }else if(this.current.tokenType === DOMTokenType.IGNORE_TAG){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.CONTENT, this.buffer.substring(0, this.getTokenEnd(['>'])));
        }else{
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.CONTENT, this.buffer.substring(0, this.getTokenEnd(['<'])));
        }
        this.buffer = this.buffer.substring(this.current.value.length);
    }

    getTokenEnd(markers){
        let idx = 0;
        let len = this.buffer.length;
        while(idx < len){
            for(let i=0; i<markers.length; i++){
                if(markers[i].length > 1){
                    if(idx < len + 1 && markers.includes(this.buffer.substring(idx, idx + 2))){
                        return idx;
                    }
                }else{
                    if(markers.includes(this.buffer.charAt(idx))){
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
        this.next();
    }

    next(){
        this.buffer.trimStart();
        if(this.buffer.length == 0){
        	this.current = null;
        	return;
        }
        
        let firstChar = this.buffer.charAt(0);
        let secondChar = this.buffer.length > 1 ? this.buffer.charAt(1) : null;
        
        if(firstChar == ';'){
        	this.previous = this.current;
        	this.current = new ScriptToken(ScriptTokenType.END_OF_STATEMENT, ';');
        }else if(firstChar == '.'){
           	this.previous = this.current;
        	this.current = new ScriptToken(ScriptTokenType.QUALIFIER, '.');
        }else if(firstChar == '('){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.LEFT_PARENTHESIS, '(');
        }else if(firstChar == ')'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.RIGHT_PARENTHESIS, ')');
        }else if(firstChar == '{'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.LEFT_BRACE, '{');
        }else if(firstChar == '}'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.RIGHT_BRACE, '}');
        }else if(firstChar == '['){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.LEFT_BRACKET, '[');
        }else if(firstChar == ']'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.RIGHT_BRACKET, ']');
        }else if(firstChar == '\''){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.SINGLE_QUOTE, '\'');
        }else if(firstChar == '\"'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.DOUBLE_QUOTE, '\"');
        }else if(firstChar == ','){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.COMMA, ',');
        }else if(firstChar == ':'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.COLON, ':');
        }else if(firstChar == '&'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.AND, '&');
        }else if(firstChar == '|'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.OR, '|');
        }else if(firstChar == '>'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.GREATER_THEN, '>');
        }else if(firstChar == '<'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.LESS_THAN, '<');
        }else if(firstChar == '='){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.EQUAL, '=');
        }else if(firstChar == '!'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.NOT, '!');
        }else if(firstChar == '+'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.ADD, '+');
        }else if(firstChar == '-'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.MINUS, '-');
        }else if(firstChar == '/'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.DIVIDE, '/');
        }else if(firstChar == '*'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.MULTIPLY, '*');
        }else if(firstChar == '%'){
           	this.previous = this.current;        
        	this.current = new ScriptToken(ScriptTokenType.MODULUS, '%');
        }else{
        	if(this.previous.tokenType === ScriptTokenType.SINGLE_QUOTE || this.previous.tokenType === ScriptTokenType.DOUBLE_QUOTE){ //STRING
        		let idx = 0;
        		while(idx < this.buffer.length && this.buffer.charAt(idx) != this.previous.value){
        			idx++;
        		}
        		this.previous = this.current;
        		this.current = new ScriptToken(ScriptTokenType.STRING, this.buffer.substring(0, idx));
        	}else if(firstChar.matches(/[a-zA-Z\$_]/g).length > 0){
    			let idx = 0;
    			while(idx < this.buffer.length && this.buffer.charAt(idx).matches(/[a-zA-Z0-9_\-]/g).length > 0){
    				idx++;
    			}
    			this.previous = this.current;
    			this.current = new ScriptToken(ScriptTokenType.WORD, this.buffer.substring(0, idx));
        	}else{
        		let idx = 0; 
        		while(idx < this.buffer.length && this.buffer.charAt(idx) != ' '){
        			idx++;
        		}
        		this.previous = this.current;
        		this.current = new ScriptToken(ScriptTokenType.OTHER, this.buffer.substring(0, idx));
        	}
        }
        this.buffer = this.buffer.substring(this.current.value.length);
    }

    hasNext(){
        return this.current != null;
    }
}
