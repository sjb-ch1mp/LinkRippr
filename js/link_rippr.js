
//Global variables
let file = null;
let fileName = null;
let chatterBox = null;
let results = null;
let userSettings = null;
let settingsVisible = false;
let previousResults = null;

function ripLinks(){
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
                                tmpStr += ((iocs[key]["attributes"].length === 1 && iocs[key]["attributes"][0] !== "*")?" ":" (" + att + ") ");
                                tmpStr += stripNewLines(iocs[key]["extractions"][i][att]) + "\n";
                                resultString += checkLength(tmpStr, 100);
                            }
                            resultString += (iocs[key]["attributes"].length > 1 || iocs[key]["attributes"][0] === "*")?"|" + getDivider("-", 99) + "\n":"";
                        }
                        resultString += (iocs[key]["attributes"].length === 1 && iocs[key]["attributes"][0] !== "*")?"|" + getDivider("-", 99) + "\n":"\n";
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
                                    tmpStr += ((iocs[key]["attributes"].length === 1 && iocs[key]["attributes"][0] !== "*")?" ":" (" + att + ") ");
                                    tmpStr += stripNewLines(iocs[key]["extractions"][i].extractions[att]) + "\n";
                                    resultString += checkLength(tmpStr, 100);
                                }
                            }
                            if(iocs[key]["extractions"][i].innerTags != null){
                                let innerTagCount = 1;
                                for(let j=0; j<iocs[key]["extractions"][i].innerTags.length; j++){
                                    if(iocs[key]["extractions"][i].innerTags[j].extractions != null){
                                        for(let att in iocs[key]["extractions"][i].innerTags[j].extractions){
                                            let tmpStr = "| " + padNumber(i + 1) + " | -> (";
                                            tmpStr += iocs[key]["extractions"][i].innerTags[j].tag.toUpperCase() + " " + padNumber(innerTagCount);
                                            tmpStr += ((iocs[key]["nested_tags"][iocs[key]["extractions"][i].innerTags[j].tag].length === 1
                                                && iocs[key]["nested_tags"][iocs[key]["extractions"][i].innerTags[j].tag][0] !== "*")?") ":":" + att + ") ");
                                            tmpStr += stripNewLines(iocs[key]["extractions"][i].innerTags[j].extractions[att]) + "\n";
                                            resultString += checkLength(tmpStr, 100);
                                        }
                                    }
                                    innerTagCount += 1;
                                }
                            }
                            resultString += "|" + getDivider("-", 99) + "\n";
                        }
                    }
                }
            }

            if(parser.scripts.length > 0 && areSignatureHits(parser.scripts, 'detection')){
                let detectedSignatures = getDetectedSignatures(parser.scripts, 'detection');
                for(let key in detectedSignatures){
                    let idx = 0;
                    resultString += "\n\n| " + stylize("JAVASCRIPT SIGNATURE: " + key) + "\n|" + getDivider("=", 99) + "\n";
                    for(let i in detectedSignatures[key]){
                        idx++;
                        let tmpStr = "| " + padNumber(idx) + " | " + stripNewLines(detectedSignatures[key][i]) + "\n";
                        resultString += checkLength(tmpStr, 100);
                    }
                }
            }

            if(parser.scripts.length > 0 && areSignatureHits(parser.scripts, 'deobfuscation')){
                let detectedSignatures = getDetectedSignatures(parser.scripts, 'deobfuscation');
                for(let key in detectedSignatures){
                    let idx = 0;
                    resultString += "\n\n| " + stylize("DEOBFUSCATION: " + key) + "\n|" + getDivider("=", 99) + "\n";
                    for(let i in detectedSignatures[key]){
                        idx++;
                        let tag = detectedSignatures[key][i];
                        if(typeof(tag) === "object" && tag.hasIocs()){
                            let unnestedIocs = tag.unnested_iocs;
                            let nestedIocs = tag.nested_iocs;
                            let extractions = null;

                            //get unnestedIocs
                            if(unnestedIocs !== null){
                                for(let key in unnestedIocs){
                                    if(unnestedIocs[key]['extractions'] !== null && unnestedIocs[key]['extractions'].length > 0){
                                        extractions = unnestedIocs[key]['extractions'];
                                        for(let j=0; j<extractions.length; j++){
                                            for(let att in extractions[j]){
                                                resultString += checkLength(
                                                    "| " + padNumber(idx) + " | (" + key.toUpperCase() + " : " + att.toLowerCase() + ") " + extractions[j][att] + "\n",
                                                    100
                                                );
                                            }
                                        }
                                    }
                                }
                            }

                            //get nestedIocs
                            if(nestedIocs !== null){
                                for(let key in nestedIocs){
                                    if(nestedIocs[key]['extractions'] !== null && nestedIocs[key]['extractions'].length > 0){
                                        extractions = nestedIocs[key]['extractions'];
                                        for(let j=0; j<extractions.length; j++){
                                            if(extractions[j].extractions !== null){
                                                for(let att in extractions[j].extractions){
                                                    resultString += checkLength(
                                                        "| " + padNumber(idx) + " | (" + key.toUpperCase() + " : " + att.toLowerCase() + ") " + extractions[j].extractions[att] + "\n",
                                                        100
                                                    );
                                                }
                                            }
                                            if(extractions[j].innerTags !== null){
                                                for(let k=0; k<extractions[j].innerTags.length; k++){
                                                    if(extractions[j].innerTags[k].extractions !== null){
                                                        for(let att in extractions[j].innerTags[k].extractions){
                                                            resultString += checkLength(
                                                                "| " + padNumber(idx) + " | (" + key.toUpperCase() + " -> " + extractions[j].innerTags[k].tag.toUpperCase() + " : " + att.toLowerCase() + ") " + extractions[j].innerTags[k].extractions[att] + "\n",
                                                                100
                                                            );
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            //get script detections
                            if(tag.scripts.length > 0 && areSignatureHits(tag.scripts, 'detection')){
                                let detectedSignatures = getDetectedSignatures(tag.scripts, 'detection');
                                for(let key in detectedSignatures){
                                    for(let j in detectedSignatures[key]){
                                        resultString += checkLength(
                                            "| " + padNumber(idx) + " | (SIGNATURE : " + key + ") " + detectedSignatures[key][j] + "\n",
                                            100
                                        );
                                    }
                                }
                            }
                        }else{
                            if(tag.startsWith("[SUCCESS]")){
                                resultString += "| " + padNumber(idx) + " | [SUCCESS : NO DETECTIONS]\n";
                                resultString += checkLength("| " + padNumber(idx) + " | " + tag.replace(/^\[SUCCESS\]/g,'') + "\n", 100);
                            }else{
                                resultString += "| " + padNumber(idx) + " | [FAIL]\n";
                                resultString += checkLength("| " + padNumber(idx) + " | " + tag.replace(/^\[FAIL\]/g,'') + "\n", 100);
                            }
                        }
                        resultString += "|" + getDivider("-", 99) + "\n";
                    }
                }
            }

            if(areCssSignatureHits(parser.styleBlocks)){
                let cssSignatureHits = getCssSignatureHits(parser.styleBlocks);
                for(let name in cssSignatureHits){
                    let idx = 0;
                    resultString += "\n\n| " + stylize("CSS SIGNATURE: " + name) + "\n|" + getDivider("=", 99) + "\n";
                    for(let i in cssSignatureHits[name]){
                        idx++;
                        let tmpStr = "| " + padNumber(idx) + " | " + ((cssSignatureHits[name][i]['conditional'])?"*CONDITIONAL* ":"") + cssSignatureHits[name][i]['selector'] + " { " + cssSignatureHits[name][i]['attribute'] + " : " + cssSignatureHits[name][i]['value'] + "; }\n";
                        resultString += checkLength(tmpStr, 100);
                    }
                }
            }

            if(parser.conditionalHtml.length > 0){
                let types = ['hidden', 'revealed', 'unknown'];
                for(let i=0; i<2; i++){
                    if(parser.hasConditionalHtml(types[i])){
                        let idx = 0;
                        resultString += "\n\n| " + stylize("CONDITIONAL HTML : " + types[i].toLowerCase()) + "\n|" + getDivider("=", 99) + "\n";
                        for(let j=0; j<parser.conditionalHtml.length; j++){
                            if(parser.conditionalHtml[j]['type'] === types[i]){
                                idx++;
                                let tmpStr =
                                resultString += checkLength("| " + padNumber(idx) + " | [" + parser.conditionalHtml[j]['condition'] + "]\n", 100);
                                resultString += checkLength("| " + padNumber(idx) + " | " + stripNewLines(parser.conditionalHtml[j]['html']) + "\n", 100);
                                resultString += "|" + getDivider("-", 99) + "\n";
                            }
                        }
                    }
                }
            }

            if(resultString.length === 0){
                resultString = "\n\nNOTHING FOUND";
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

            let resultString = "\n\n== TOKENIZED DOM ==\n\n";
            let tokenizer = new DOMTokenizer(file.toString());
            while(tokenizer.hasNext()){
                resultString += stripNewLines(checkLength(tokenizer.current.tokenType + ": " + tokenizer.current.value, 100)) + "\n";
                tokenizer.next();
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
        if(Object.keys(userSettings.extractions).length === 0 && userSettings.getOption('mode') === LRMode.EXTRACTION){
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
        if(file === undefined){
            throw "File didn't upload correctly";
        }else{
            if(input.id === 'import-settings'){
                if(file.type !== "text/plain"){
                    throw "LinkRippr settings files must be plain text";
                }else{
                    loadSettingsFile(file);
                }
            }else{
                if(file.type !== "text/html"){
                    throw "LinkRippr can only process .html files";
                }else{
                    hideSettings();
                    loadFile(file);
                }
            }
        }
    }catch(err){
        throwError(err);
    }
}

function loadSettingsFile(fileInfo){
    const reader = new FileReader();
    reader.readAsText(fileInfo);
    reader.onprogress = function () {
        chatter("Importing settings file...");
    }
    reader.onload = function () {
        let settingsFile = reader.result;
        loadSettingsFromFile(settingsFile);
        hideSettings();
        chatter("Settings successfully imported!");
    }
    reader.onerror = function () {
        throwError("Error importing settings file");
    }
}

function loadFile(fileInfo) {
    //load file
    fileName = fileInfo.name;
    const reader = new FileReader();
    reader.readAsText(fileInfo);
    reader.onprogress = function () {
        chatter("Importing file...");
    };
    reader.onload = function () {
        file = reader.result;
        if(userSettings.getOption('debugTokenizer')){
            chatter("Disassembling DOM...");
            dumpTokens();
        }else{
            chatter("Ripping links...");
            ripLinks();
        }
    };
    reader.onerror = function () {
        throwError("Error importing file");
    }
}
function throwError(err){
    if(err instanceof Error){
        chatterBox.innerText = "There was an error";
        results.innerText = "\n\n" + err.message.toUpperCase() + "\n\n" + err.stack;
        padContent();
    }else{
        chatterBox.innerText = err;
        padContent();
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