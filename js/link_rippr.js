let file = null;
let chatterBox = null;
let results = null;

function setUpGlobalVariables(){
    chatterBox = document.getElementById("chatter_box");
    results = document.getElementById("results");
}

function dropHandler(event){
    event.preventDefault() ? event.preventDefault() : event.returnValue = false;
    event.stopPropagation();
    setUpGlobalVariables();
    document.getElementById("results").removeAttribute("style");

    if(event.dataTransfer.items){
    //items have been dropped
        if(event.dataTransfer.items.length == 1){
            let fileInfo = event.dataTransfer.files[0];
            if((fileInfo.type == "text/html")){
                loadFile(fileInfo);
            }else{
                throwError("LinkRippr can only process .html files");
            }
        }else{
        //more than 1 file has been dropped
            throwError("LinkRippr can only process 1 file at a time");
        }

    }
}

function dragOverHandler(event){
    event.preventDefault() ? event.preventDefault() : event.returnValue = false;
    event.stopPropagation();
    setUpGlobalVariables();

}

function loadFile(fileInfo) {
    //load file
    const reader = new FileReader();
    reader.readAsText(fileInfo);
    reader.onprogress = function () {
        chatter("Importing file...");
    };
    reader.onload = function () {
        file = reader.result;
        chatter("Ripping links...");
        ripLinks();
    };
    reader.onerror = function () {
        throwError("Error importing file");
    }
}

function ripLinks(){
    try{
        if(file !== null && file !== undefined){

            let resultString = ""
            let tokenizer = new DOMTokenizer(file.toString());

            let parser = new Parser(tokenizer);
            if(parser.hasIocs()){
                if(parser.iocs["base"] != null){
                    resultString += "=== DOM CONTAINS BASE ELEMENT ===\n\n";
                    resultString += "1: " + parser.iocs["base"] + "\n\n";
                }
                if(parser.iocs["form"].length > 0){
                    resultString += "=== DOM CONTAINS FORM ELEMENTS ===\n\n";
                    for(let i=0; i<parser.iocs["form"].length; i++){
                        resultString += (i + 1) + ": " + parser.iocs["form"][i].method.toUpperCase() + " to " + parser.iocs["form"][i].action + "\n";
                        if(parser.iocs["form"][i].inputs.length > 0){
                            for(let j=0; j<parser.iocs["form"][i].inputs.length; j++){
                                let input = parser.iocs["form"][i].inputs[j];
                                resultString += "--> " + ((input.name === "")?"unnamed":"\"" + input.name + "\"") + " (" + ((input.type === "")?"untyped":input.type) + ")\n"
                            }
                            resultString += "\n";
                        }
                    }
                    resultString += "\n";
                }
                if(parser.iocs["iframe"].length > 0){
                    resultString += "=== DOM CONTAINS IFRAMES ===\n\n";
                    for(let i=0; i<parser.iocs["iframe"].length; i++){
                        resultString += (i + 1) + ": " + parser.iocs["iframe"][i] + "\n";
                    }
                    resultString += "\n";
                }
                if(parser.iocs["a"].length > 0){
                    resultString += "=== DOM CONTAINS HYPERLINKS ===\n\n";
                    for(let i=0; i<parser.iocs["a"].length; i++){
                        resultString += (i + 1) + ": " + parser.iocs["a"][i] + "\n";
                    }
                    resultString += "\n";
                }
                if(parser.iocs["script"].length > 0){
                    resultString += "=== DOM REFERENCES SCRIPTS ===\n\n";
                    for(let i=0; i<parser.iocs["script"].length; i++){
                        resultString += (i + 1) + ": " + parser.iocs["script"][i] + "\n";
                    }
                    resultString += "\n";
                }
            }else{
                resultString = "=== NOTHING OF INTEREST IN DOM ===";
            }
            /* DEBUGGING PARSER
            let scripts = [];
            while(tokenizer.hasNext()){
                if(tokenizer.current.tokenType === DOMTokenType.SCRIPT){
                    scripts.push(tokenizer.current.value);
                }
                resultString += "\n" + tokenizer.current.tokenType + ": " + tokenizer.current.value;
                tokenizer.next();
            }

            if(scripts.length > 0){
                resultString += "\n\n== TOKENIZED SCRIPTS ==";
                for(let i=0; i<scripts.length; i++){
                    let sTokenizer = new ScriptTokenizer(scripts[i]);
                    resultString += "\n\n ++ SCRIPT " + (i+1) + ": ";
                    while(sTokenizer.hasNext()){
                        resultString += "\n" + sTokenizer.current.tokenType + ": " + sTokenizer.current.value;
                        sTokenizer.next();
                    }
                }
            }
            */
            results.innerText = resultString;
            padContent();
            chatter("Done");
        }else{
            throwError("Error importing file");
        }
    }catch(err){
        throwError("There was an error");
        results.innerText = err.message.toUpperCase() + "\n\n" + err.stack;
        padContent();
    }
}

function throwError(message){
    chatterBox.setAttribute("style","background-color: #8E0000; color: black; font-weight: bold");
    chatterBox.innerText = message;
}

function chatter(message){
    chatterBox.removeAttribute("style");
    chatterBox.innerText = message;
}