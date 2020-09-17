class DOMTokenizer{

    constructor(buffer){
        this.buffer = buffer;
        this.previous = null;
        this.current = null;
        this.isScript = false;
        this.holdQuoteType = null;
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
        }else if(firstChar === '\"' || firstChar === '\''){
            this.holdQuoteType = firstChar;
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.QUOTE, firstChar);
        }else if (this.current !== null && this.current.tokenType === DOMTokenType.OPEN_TAG_START){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.OPEN_TAG_NAME, this.buffer.substring(0, this.getTokenEnd([' ', '>', '/>'])).toLowerCase());
            if(this.current.value === "script"){
                this.isScript = true;
            }
        }else if(this.current !== null && this.current.tokenType === DOMTokenType.CLOSE_TAG_START){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.CLOSE_TAG_NAME, this.buffer.substring(0, this.getTokenEnd([' ', '>', '/>'])).toLowerCase());
            if(this.current.value === "script"){
                    this.isScript = false;
            }
        }else if(this.current !== null && this.current.tokenType === DOMTokenType.QUOTE && this.previous.tokenType === DOMTokenType.EQUALS){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.ATT_VALUE, this.buffer.substring(0, this.getTokenEnd([this.holdQuoteType])));
            this.holdQuoteType = null;
        }else if(this.current !== null && this.current.tokenType === DOMTokenType.EQUALS){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.ATT_VALUE, this.buffer.substring(0, this.getTokenEnd([' ', '/>', '>'])));
        }else if(this.current !== null && this.current.tokenType === DOMTokenType.IGNORE_TAG){
            this.previous = this.current;
            this.current = new DOMToken(DOMTokenType.IGNORE, this.buffer.substring(0, this.getTokenEnd(['>'])));
        }else if(this.current !== null && (this.current.tokenType === DOMTokenType.OPEN_TAG_NAME ||
            this.current.tokenType === DOMTokenType.BOOL_ATT ||
            this.current.tokenType === DOMTokenType.ATT_VALUE ||
            (this.current.tokenType === DOMTokenType.QUOTE && this.previous.tokenType !== DOMTokenType.DEFAULT_TAG_FINISH))){
            this.previous = this.current;
            if(this.isBooleanAttribute()){
                this.current = new DOMToken(DOMTokenType.BOOL_ATT, this.buffer.substring(0, this.getTokenEnd([' ', '>'])).toLowerCase());
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