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
                let iocs = parser.unnested_iocs;
                for(let key in iocs){
                    if(iocs[key]["extractions"] != null){
                        resultString += buildHeader(key, iocs[key]["attributes"], null);
                        for(let i=0; i<iocs[key]["extractions"].length; i++){
                            for(let att in iocs[key]["extractions"][i]){
                                resultString += "| " + padNumber(i + 1) + ":" + ((iocs[key]["attributes"].length === 1)?" ":" (" + att + ") ") + iocs[key]["extractions"][i][att] + "\n";
                            }
                            resultString += (iocs[key]["attributes"].length > 1)?"|" + getDivider() + "\n":"";
                        }
                        resultString += (iocs[key]["attributes"].length === 1)?"|" + getDivider() + "\n":"\n";
                    }
                }
                iocs = parser.nested_iocs;
                for(let key in iocs){
                    if(iocs[key]["extractions"] != null){
                        resultString += buildHeader(key, iocs[key]["attributes"], iocs[key]["nested_tags"]);
                        for(let i=0; i<iocs[key]["extractions"].length; i++){
                            if(iocs[key]["extractions"][i].extractions != null){
                                for(let att in iocs[key]["extractions"][i].extractions){
                                    resultString += "| " + padNumber(i + 1) + ":" + ((iocs[key]["attributes"].length === 1)?" ":" (" + att + ") ") + iocs[key]["extractions"][i].extractions[att] + "\n";
                                }
                            }
                            if(iocs[key]["extractions"][i].innerTags != null){
                                let innerTagCount = 1;
                                for(let j=0; j<iocs[key]["extractions"][i].innerTags.length; j++){
                                    if(iocs[key]["extractions"][i].innerTags[j].extractions != null){
                                        for(let att in iocs[key]["extractions"][i].innerTags[j].extractions){
                                            resultString += "| " + padNumber(i + 1) + ": -> (" + iocs[key]["extractions"][i].innerTags[j].tag.toUpperCase() + " " + padNumber(innerTagCount);
                                            resultString += ((iocs[key]["nested_tags"][iocs[key]["extractions"][i].innerTags[j].tag].length === 1)?") ":":" + att + ") ") + iocs[key]["extractions"][i].innerTags[j].extractions[att] + "\n";
                                        }
                                    }
                                    innerTagCount += 1;
                                }
                            }
                            resultString += "|" + getDivider() + "\n";
                        }
                    }
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

function getDivider(){
    let divider = "";
    for(let i=0; i<99; i++){
        divider += "-"
    }
    return divider;
}

function buildHeader(tagName, attributeNames, nestedTags){
    let headerText = "| < " + tagName.toUpperCase() + ((attributeNames.length > 0)?": " + attributeNames.join(","):"") + " />";

    let upperBorder = "=";
    let lowerBorder = "";
    for(let i=0; i<99; i++){
        upperBorder += "=";
        lowerBorder += "-";
    }

    let nestedTagList = "";
    if(nestedTags != null){
        for(let key in nestedTags){
            nestedTagList += "| + < " + key.toUpperCase() + ": " + nestedTags[key].join(",") + " />\n";
        }
    }

    return "\n\n" + upperBorder + "\n" + headerText + "\n" + nestedTagList + "|" + lowerBorder + "\n";
}

function padNumber(number){
    let numStr = number + "";
    while(numStr.length < 3){
        numStr = "0" + numStr;
    }
    return numStr;
}

function throwError(message){
    chatterBox.setAttribute("style","color: #8E0000; font-weight: bold");
    chatterBox.innerText = message;
}

function chatter(message){
    chatterBox.removeAttribute("style");
    chatterBox.innerText = message;
}