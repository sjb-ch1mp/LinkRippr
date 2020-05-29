class DOMTokenizer{

    constructor(buffer){
        this.buffer = buffer.replace(new RegExp("(\\r\\n|\\n|\\r)", "g"), "");
        this.previous = null;
        this.current = null;
        this.next();
    }

    next(){
        this.buffer = this.buffer.trimStart();
        let firstChar = this.buffer.charAt(0);
        let secondChar = this.buffer.length > 1 ? this.buffer.charAt(1) : null;

        if(this.buffer.length == 0){
            this.current = null;
            return;
        }

        if(firstChar == '<' && secondChar != null && secondChar == '/'){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.CLOSE_TAG_START, '</');
        }else if(firstChar == '<' && secondChar != null && secondChar == '!') {
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.IGNORE_TAG, '<!');
        }else if(firstChar == '<'){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.OPEN_TAG_START, '<');
        }else if(firstChar == '/' && secondChar != null && secondChar == '>'){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.OPEN_TAG_CLOSE, '/>');
        }else if(firstChar == '>'){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.TAG_FINISH, '>');
        }else if(firstChar == '='){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.EQUALS, '=');
        }else if(firstChar == '\"'){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.QUOTE, "\"");
        }else if(this.current.tokenType == DOMTokenType.OPEN_TAG_START || this.current.tokenType == DOMTokenType.CLOSE_TAG_START){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.TAG_NAME, this.buffer.substring(0, this.getTokenEnd([' ', '>', '/>'])));
        }else if(this.current.tokenType == DOMTokenType.QUOTE && this.previous.tokenType == DOMTokenType.EQUALS){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.ATT_VALUE, this.buffer.substring(0, this.getTokenEnd(['\"'])));
        }else if(this.current.tokenType == DOMTokenType.TAG_NAME || this.current.tokenType == DOMTokenType.QUOTE){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.ATT_KEY, this.buffer.substring(0, this.getTokenEnd(['='])));
        }else if(this.current.tokenType == DOMTokenType.IGNORE_TAG){
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

class ScriptTokenizer{

    constructor(buffer){
        this.buffer = buffer.trim();
        this.current = null;
        this.next();
    }

    next(){
        this.buffer.trim();
    }

    hasNext(){
        return this.current != null;
    }
}
