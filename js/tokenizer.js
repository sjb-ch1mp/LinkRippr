class Tokenizer{

    constructor(buffer) {
        this.buffer = buffer.trim();
    }

    next(){
        this.buffer.trim();
        let firstChar = this.buffer.charAt(0);
        let secondChar = this.buffer.length > 1 ? this.buffer.charAt(1) : null;

        if(firstChar == '<' && secondChar != null && secondChar == '/'){
            //return a close_tag token (</)

        }else if(firstChar == '<') {
            //return an open_tag token

        }else{
            //return content

        }
    }
}