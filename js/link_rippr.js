
//Global variables
let file = null;
let chatterBox = null;
let results = null;
let userSettings = null;
let settingsVisible = false;
let previousResults = null;
let menuShowing = false;

function ripLinks(fileName){
    try{
        if(file !== null && file !== undefined){

            let resultString = "";
            let parser = new DomParser(new DOMTokenizer(file.toString()));
            if(parser.hasIocs()){
                let iocs = parser.unnested_iocs;
                for(let key in iocs){
                    if(iocs[key]["extractions"] != null){
                        resultString += buildHeader(key, iocs[key]["attributes"], null);
                        for(let i=0; i<iocs[key]["extractions"].length; i++){
                            for(let att in iocs[key]["extractions"][i]){
                                let tmpStr = "| " + padNumber(i + 1) + " | "
                                tmpStr += ((iocs[key]["attributes"].length === 1)?" ":" (" + att + ") ");
                                tmpStr += stripNewLines(iocs[key]["extractions"][i][att]) + "\n";
                                resultString += checkLength(tmpStr);
                            }
                            resultString += (iocs[key]["attributes"].length > 1)?"|" + getDivider("-", 99) + "\n":"";
                        }
                        resultString += (iocs[key]["attributes"].length === 1)?"|" + getDivider("-", 99) + "\n":"\n";
                    }
                }
                iocs = parser.nested_iocs;
                for(let key in iocs){
                    if(iocs[key]["extractions"] != null){
                        resultString += buildHeader(key, iocs[key]["attributes"], iocs[key]["nested_tags"]);
                        for(let i=0; i<iocs[key]["extractions"].length; i++){
                            if(iocs[key]["extractions"][i].extractions != null){
                                for(let att in iocs[key]["extractions"][i].extractions){
                                    let tmpStr = "| " + padNumber(i + 1) + " | ";
                                    tmpStr += ((iocs[key]["attributes"].length === 1)?" ":" (" + att + ") ");
                                    tmpStr += stripNewLines(iocs[key]["extractions"][i].extractions[att]) + "\n";
                                    resultString += checkLength(tmpStr);
                                }
                            }
                            if(iocs[key]["extractions"][i].innerTags != null){
                                let innerTagCount = 1;
                                for(let j=0; j<iocs[key]["extractions"][i].innerTags.length; j++){
                                    if(iocs[key]["extractions"][i].innerTags[j].extractions != null){
                                        for(let att in iocs[key]["extractions"][i].innerTags[j].extractions){
                                            let tmpStr = "| " + padNumber(i + 1) + " | -> (";
                                            tmpStr += iocs[key]["extractions"][i].innerTags[j].tag.toUpperCase() + " " + padNumber(innerTagCount);
                                            tmpStr += ((iocs[key]["nested_tags"][iocs[key]["extractions"][i].innerTags[j].tag].length === 1)?") ":":" + att + ") ");
                                            tmpStr += stripNewLines(iocs[key]["extractions"][i].innerTags[j].extractions[att]) + "\n";
                                            resultString += checkLength(tmpStr);
                                        }
                                    }
                                    innerTagCount += 1;
                                }
                            }
                            resultString += "|" + getDivider("-", 99) + "\n";
                        }
                    }
                }
                //REMOVED
            }else{
                resultString = "\n\n" + stylize("NOTHING FOUND IN DOM");
            }

            if(parser.scripts.length > 0){
                for(let i in parser.scripts){
                    resultString += "\n\n| " + stylize("SCRIPT: statement") + "\n|" + getDivider("=", 99) + "\n";
                    let idx = 0;
                    if(parser.scripts[i].statements != null){
                        for(let j in parser.scripts[i].statements){
                            idx++;
                            let tmpStr = "| " + padNumber(idx) + " | " + stripNewLines(parser.scripts[i].statements[j]._raw) + "\n";
                            resultString += checkLength(tmpStr);
                        }
                    }
                }
            }

            results.innerText = resultString;
            chatter(stylize(fileName));
            previousResults = new PreviousResults(fileName, resultString);
            padContent();
        }else{
            throwError("Error importing file");
        }
    }catch(err){
        throwError(err);

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
            results.innerText = resultString;
            padContent();
            chatter("Done");
        }else{
            throwError("Error importing file");
        }
    }catch(err){
        throwError(err);
    }
}

function setUpGlobalVariables(msg){
    chatterBox = document.getElementById("chatter_box");
    results = document.getElementById("results");
    if(userSettings == null){
        userSettings = new UserSettings();
    }
    chatter(msg);
    padContent();
}

function dropHandler(event){
    halt(event);
    hideSettings();

    if(event.dataTransfer.items){
    //items have been dropped
        if(Object.keys(userSettings.extractions).length === 0 && userSettings.mode === LRMode.NORMAL){
            throwError("LinkRippr currently has no extractions defined.")
            return;
        }
        if(event.dataTransfer.items.length === 1){
            let fileInfo = event.dataTransfer.files[0];
            if((fileInfo.type === "text/html")){
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
    halt(event);
    hideSettings();
    chatter("File detected. Bombs away!");
}

function halt(event){
    event.preventDefault() ? event.preventDefault() : event.returnValue = false;
    event.stopPropagation();
}

function dragExitHandler(){
    if(previousResults != null){
        chatter(stylize(previousResults.fileName));
    }else{
        chatter("Drop an HTML File");
    }
}

function uploadHandler(input){
    try{
        let file = input.files[0];
        if(file == undefined){
            throw "File didn't upload correctly";
        }else if(file.type !== "text/html"){
            throw "LinkRippr can only process .html files";
        }else{
            hideSettings();
            loadFile(file);
        }
    }catch(err){
        throwError(err);
    }
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
            ripLinks(fileInfo.name);
        }else if(userSettings.mode === LRMode.DEBUG_TOKENIZER){
            chatter("Disassembling DOM...");
            dumpTokens();
        }
    };
    reader.onerror = function () {
        throwError("Error importing file");
    }
}

function throwError(err){
    if(err instanceof Error){
        chatterBox.innerText = "There was an error";
        results.innerText = err.message.toUpperCase() + "\n\n" + err.stack;
        padContent();
    }else{
        chatterBox.innerText = err;
    }
    chatterBox.setAttribute("style","color: #8E0000; font-weight: bold");
}

function chatter(message){
    chatterBox.removeAttribute("style");
    chatterBox.innerText = message;
}

class PreviousResults{
    constructor(fileName, resultString){
        this.fileName = fileName;
        this.resultString = resultString;
    }
}