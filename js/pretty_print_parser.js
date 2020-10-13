class PrettyPrintParser{

    constructor(domTokenizer) {
        this.domTokenizer = domTokenizer;
        this.scripts = [];
        this.parseDom();
    }

    parseDom(){
        while(this.domTokenizer.hasNext()){
            if(this.domTokenizer.current.tokenType === DOMTokenType.SCRIPT){
                this.scripts.push(new Script(this.domTokenizer.current.value));
            }
            this.domTokenizer.next();
        }
    }

    hasScripts(){
        return this.scripts.length > 0;
    }
}