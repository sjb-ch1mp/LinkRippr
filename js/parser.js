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
                        let form = this.parseForm();
                        if(!form.alreadyParsed(this.iocs["form"])){
                            this.iocs["form"].push(form);
                        }
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
        //get form attributes
        while(this.domTokenizer.hasNext() && this.domTokenizer.current.tokenType !== DOMTokenType.DEFAULT_TAG_FINISH){
            if(this.domTokenizer.current.tokenType === DOMTokenType.ATT_KEY){
                if(this.domTokenizer.current.value === "method" || this.domTokenizer.current.value === "action"){
                    let att_key = this.domTokenizer.current.value;
                    this.domTokenizer.next(); //EQUALS
                    this.domTokenizer.next(); //QUOTE
                    this.domTokenizer.next(); //ATT_VALUE or QUOTE if empty
                    switch(att_key){
                        case "method":
                            form.method = (this.domTokenizer.current.tokenType === DOMTokenType.QUOTE) ? "" : this.domTokenizer.current.value;
                            break;
                        default:
                            form.action = (this.domTokenizer.current.tokenType === DOMTokenType.QUOTE) ? "/" : this.domTokenizer.current.value;
                    }
                }
            }
            this.domTokenizer.next();
        }

        //get form inputs
        while(this.domTokenizer.hasNext() &&
            !(this.domTokenizer.current.tokenType === DOMTokenType.CLOSE_TAG_NAME &&
                this.domTokenizer.current.value === "form")){
            if(this.domTokenizer.current.tokenType === DOMTokenType.OPEN_TAG_NAME &&
                this.domTokenizer.current.value === "input"){
                let inputAttributes = this.getAttribute("*");
                if("name" in inputAttributes || "type" in inputAttributes){
                    form.inputs.push(new Input(
                        ("name" in inputAttributes) ? inputAttributes["name"]:"",
                        ("type" in inputAttributes) ? inputAttributes["type"]:""
                    ));
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
                this.domTokenizer.current.tokenType !== DOMTokenType.DEFAULT_TAG_FINISH &&
                this.domTokenizer.current.tokenType !== DOMTokenType.VOID_TAG_FINISH){
                if(this.domTokenizer.current.tokenType === DOMTokenType.ATT_KEY){
                    if(attributes == null){
                        attributes = {};
                    }
                    let att_key = this.domTokenizer.current.value;
                    this.domTokenizer.next(); //EQUALS
                    this.domTokenizer.next(); //QUOTE
                    this.domTokenizer.next(); //QUOTE or ATT_VALUE
                    if(this.domTokenizer.current.tokenType === DOMTokenType.QUOTE){
                        attributes[att_key] = "";
                    }else{
                        attributes[att_key] = this.domTokenizer.current.value;
                    }
                }else if(this.domTokenizer.current.tokenType === DOMTokenType.BOOL_ATT){
                    if(attributes == null){
                        attributes = {};
                    }
                    attributes[this.domTokenizer.current.value] = "True";
                }
                this.domTokenizer.next();
            }
            return attributes;
        }else{
            while(this.domTokenizer.hasNext() &&
                this.domTokenizer.current.tokenType !== DOMTokenType.DEFAULT_TAG_FINISH &&
                this.domTokenizer.current.tokenType !== DOMTokenType.VOID_TAG_FINISH){
                if(this.domTokenizer.current.tokenType === DOMTokenType.ATT_KEY &&
                    this.domTokenizer.current.value === attributeName){
                    this.domTokenizer.next(); //EQUALS
                    this.domTokenizer.next(); //QUOTE
                    this.domTokenizer.next(); //QUOTE or ATT_VALUE
                    if(this.domTokenizer.current.tokenType === DOMTokenType.QUOTE){
                        return "";
                    }else{
                        return this.domTokenizer.current.value;
                    }
                }else if(this.domTokenizer.current.tokenType === DOMTokenType.BOOL_ATT){
                    return "True";
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
        this.inputs = [];
    }

    equals(form){
        if(this.method !== form.method) return false;
        if(this.action !== form.action) return false;
        for(let i=0; i<this.inputs.length; i++){
            if(!this.inputs[i].existsInArray(form.inputs)) return false;
        }
        return true;
    }

    alreadyParsed(formList){
        for(let i=0; i<formList.length; i++){
            if(formList[i].equals(this)) return true;
        }
        return false;
    }
}

class Input{
    constructor(name, type){
        this.name = name;
        this.type = type;
    }

    equals(input){
        if(this.name !== input.name) return false;
        if(this.type !== input.type) return false;
        return true;
    }

    existsInArray(inputList){
        for(let i=0; i<inputList.length; i++){
            if(inputList[i].equals(this)) return true;
        }
        return false;
    }
}