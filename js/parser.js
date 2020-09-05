class Parser{
    constructor(domTokenizer) {
        this.domTokenizer = domTokenizer;
        this.__raw__ = this.domTokenizer.buffer;
        this.iocs = {
            "base":null,
            "a":[],
            "iframe":[],
            "form":[],
            "script":[]
        };
        this.parseDom();
    }

    hasIocs(){
        return this.iocs["base"] != null ||
            this.iocs["a"].length > 0 ||
            this.iocs["iframe"].length > 0 ||
            this.iocs["form"].length > 0 ||
            this.iocs["script"].length > 0;
    }

    parseDom(){
        while(this.domTokenizer.hasNext()){
            if(this.domTokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME &&
                this.domTokenizer.current.value in this.iocs){
                switch(this.domTokenizer.current.value) {
                    case "base":
                        this.iocs["base"] = this.getAttribute("href");
                        break;
                    case "a":
                        let url = (this.iocs["base"] == null) ? "" : this.iocs["base"];
                        url += this.getAttribute("href");
                        if(!this.iocs["a"].includes(url)){
                            this.iocs["a"].push(url);
                        }
                        break;
                    case "iframe":
                        this.iocs["iframe"].push(this.getAttribute("href"));
                        break;
                    case "form":
                        this.iocs["form"].push(this.parseForm());
                        break;
                    case "script":
                        this.parseScript();
                }
            }

            this.domTokenizer.next();
        }
    }

    parseScript(){
        //check if the script is being imported from elsewhere
        let attributes = this.getAttribute("*");
        if(attributes != null && "src" in attributes){
            this.iocs["script"].push(attributes["src"]);
            return;
        }

        //if not, parse the contents of the script element
        this.domTokenizer.next();
        if(this.domTokenizer.current.tokenType === DOMTokenType.SCRIPT){
            let script = this.domTokenizer.current.value;
            //then parse script and deobfuscate where necessary
        }
    }

    parseForm(){
        let form = new Form("", "");
        while(this.domTokenizer.hasNext() && this.domTokenizer.current.tokenType !== DOMTokenType.CLOSE_TAG_START){
            if(this.domTokenizer.current.tokenType === DOMTokenType.ATT_KEY){
                if(this.domTokenizer.current.value === "method" || this.domTokenizer.current.value === "action"){
                    let att_key = this.domTokenizer.current.value;
                    while(this.domTokenizer.current.tokenType !== DOMTokenType.ATT_VALUE){
                        this.domTokenizer.next();
                    }
                    switch(att_key){
                        case "method":
                            form.method = this.domTokenizer.current.value;
                            break;
                        default:
                            form.action = this.domTokenizer.current.value;
                    }
                }
            }
            this.domTokenizer.next();
        }
        return form;
    }

    getAttribute(attributeName){
        if(attributeName === "*"){ //get all attributes
            let attributes = null;
            while(this.domTokenizer.hasNext() &&
                this.domTokenizer.current.tokenType !== DOMTokenType.CLOSE_TAG_START &&
                this.domTokenizer.current.tokenType !== DOMTokenType.VOID_TAG_FINISH){
                if(this.domTokenizer.current.tokenType === DOMTokenType.ATT_KEY){
                    if(attributes == null){
                        attributes = {};
                    }
                    let att_key = this.domTokenizer.current.value;
                    this.domTokenizer.next();
                    if(this.domTokenizer.current.tokenType === DOMTokenType.EQUALS){
                        while(this.domTokenizer.current.tokenType != DOMTokenType.ATT_VALUE){
                            this.domTokenizer.next();
                        }
                        attributes[att_key] = this.domTokenizer.current.value;
                    }else{
                        attributes[att_key] = "True";
                    }
                }
                this.domTokenizer.next();
            }
            return attributes;
        }else{
            while(this.domTokenizer.hasNext() &&
                this.domTokenizer.current.tokenType !== DOMTokenType.CLOSE_TAG_START &&
                this.domTokenizer.current.tokenType !== DOMTokenType.VOID_TAG_FINISH){
                if(this.domTokenizer.current.tokenType === DOMTokenType.ATT_KEY &&
                    this.domTokenizer.current.value === attributeName){
                    this.domTokenizer.next();
                    if(this.domTokenizer.current.tokenType === DOMTokenType.EQUALS){
                        while(this.domTokenizer.current.tokenType != DOMTokenType.ATT_VALUE){
                            this.domTokenizer.next();
                        }
                        return this.domTokenizer.current.value;
                    }else{
                        return "True";
                    }
                }
                this.domTokenizer.next();
            }
        }
    }
}

class Form{
    constructor(method, action){
        this.method = method;
        this.action = action;
    }
}