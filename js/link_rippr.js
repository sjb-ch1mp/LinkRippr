let file = null;
let chatterBox = null;
let results = null;
let userSettings = null;
let settingsVisible = false;

function setUpGlobalVariables(){

    chatterBox = document.getElementById("chatter_box");
    chatter("Drop an HTML file");
    results = document.getElementById("results");

    if(userSettings == null){
        userSettings = new UserSettings();
    }

    padContent();
}

function dropHandler(event){
    event.preventDefault() ? event.preventDefault() : event.returnValue = false;
    event.stopPropagation();
    hideSettings();

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
    hideSettings();
    chatter("File detected. Bombs away!");
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
        if(userSettings.mode === LRMode.NORMAL){
            chatter("Ripping links...");
            ripLinks();
        }else if(userSettings.mode === LRMode.DEBUG_TOKENIZER){
            chatter("Disassembling DOM...");
            dumpTokens();
        }
    };
    reader.onerror = function () {
        throwError("Error importing file");
    }
}

function ripLinks(){
    try{
        if(file !== null && file !== undefined){

            let resultString = ""
            let parser = new Parser(new DOMTokenizer(file.toString()));

            if(parser.hasIocs()){
                for(let key in parser.unnested_iocs){
                    resultString += buildHeader(key, parser.unnested_iocs[key]["attributes"], null);
                    for(let i=0; i<parser.unnested_iocs[key]["extractions"].length; i++){
                        resultString += (i + 1) + ": (" + parser.unnested_iocs[key]["extractions"][i]["att"] + ") \"" + parser.unnested_iocs[key]["extractions"][i]["value"] + "\"\n";
                    }
                    resultString += "\n";
                }
                for(let key in parser.nested_iocs){
                    resultString += buildHeader(key, parser.nested_iocs[key]["attributes"], parser.nested_iocs[key]["nested_tags"]);

                    resultString += "\n";
                }
                //REMOVED

            }else{
                resultString = buildHeader("NOTHING OF INTEREST", null);
            }
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

function dumpTokens(){
    try{
        if(file !== null && file !== undefined){

            let resultString = "== TOKENIZED DOM ==\n";
            let tokenizer = new DOMTokenizer(file.toString());
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

function buildHeader(tagName, attributeNames, nestedTags){
    let headerText = ".| TAG: " + tagName;

    let border = "";
    for(let i=0; i<100; i++){
        border += "=";
    }

    let attributes = "";
    for(let i=0; i<attributeNames.length; i++){
        attributes += ".| ATT_" + (i + 1) + ": " + attributeNames[i].toLowerCase() + "\n";
    }
    if(nestedTags != null){
        for(let key in nestedTags){
            attributes += ".| --> " + key.toUpperCase() + ": " + nestedTags[key].join(",") + "\n";
        }
    }

    return border + "\n" + headerText + "\n" + attributes + "\\/\n\n";
}

function throwError(message){
    chatterBox.setAttribute("style","color: #8E0000; font-weight: bold");
    chatterBox.innerText = message;
}

function chatter(message){
    chatterBox.removeAttribute("style");
    chatterBox.innerText = message;
}
/*
*
                if(parser.iocs["base"] != null){
                    resultString += buildHeader("base", null);
                    resultString += "1: " + parser.iocs["base"] + "\n\n";
                }
                if(parser.iocs["iframe"].length > 0){
                    resultString += buildHeader("iframe", null);
                    for(let i=0; i<parser.iocs["iframe"].length; i++){
                        resultString += (i + 1) + ": " + parser.iocs["iframe"][i] + "\n";
                    }
                    resultString += "\n";
                }
                if(parser.iocs["a"].length > 0){
                    resultString += buildHeader("a", null);
                    for(let i=0; i<parser.iocs["a"].length; i++){
                        resultString += (i + 1) + ": " + parser.iocs["a"][i] + "\n";
                    }
                    resultString += "\n";
                }
                if(parser.iocs["script"].length > 0){
                    resultString += buildHeader("script", null);
                    for(let i=0; i<parser.iocs["script"].length; i++){
                        resultString += (i + 1) + ": " + parser.iocs["script"][i] + "\n";
                    }
                    resultString += "\n";
                }
                if(userSettings.userExtractions != null){
                    for(let key in userSettings.userExtractions){
                        let accountedFor = [];
                        if(parser.iocs[key].length > 0){
                            resultString += buildHeader(key, userSettings.userExtractions[key]);
                            for(let i=0; i<parser.iocs[key].length; i++){
                                for(let innerKey in parser.iocs[key][i]){
                                    let att = "(" + innerKey.toUpperCase() + ") \"" + (parser.iocs[key][i][innerKey] + "\"").replace(/\r?\n|\r/g, "");
                                    if(!accountedFor.includes(att)){
                                        resultString += (i + 1) + ": " + att + "\n";
                                        accountedFor.push(att);
                                    }
                                }
                            }
                            resultString += "\n";
                        }
                    }
                }

                //form is the unique extraction
                if(parser.iocs["form"].length > 0){
                    resultString += buildHeader("form", null);
                    for(let i=0; i<parser.iocs["form"].length; i++){

                        if(parser.iocs["form"][i].method === "no-method" && parser.iocs["form"][i].action === "no-action"){
                            resultString += (i + 1) + ": No METHOD and no ACTION.\n";
                        }else if(parser.iocs["form"][i].method === "no-method"){
                            resultString += (i + 1) + ": Has ACTION to \"" + parser.iocs["form"][i].action + "\"";
                        }else if(parser.iocs["form"][i].action === "no-action"){
                            resultString += (i + 1) + ": Uses METHOD \"" + parser.iocs["form"][i].method.toUpperCase() + "\"";
                        }else{
                            resultString += (i + 1) + ": " + parser.iocs["form"][i].method.toUpperCase() + " to " + parser.iocs["form"][i].action + "\n";
                        }

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
* */