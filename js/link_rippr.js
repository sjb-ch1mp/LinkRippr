
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
            let resultPanel = document.getElementById("results");
            let parser = new DomParser(file.toString());
            let detections = []; //[DetectionFormatter, DetectionFormatter, ...]
            if(userSettings.getOption("extractDomains")){
                parser.extractUniqueDomains();
                if(parser.uniqueDomains['unique-domains'].length > 0){
                    detections.push(new DetectionFormatter(parser.uniqueDomains, "domains"));
                }
            }
            if(parser.hasHtmlDetections()){
                detections.push(new DetectionFormatter(parser.htmlSignatures, "html"));
            }
            if(parser.hasJavaScriptDetections()){
                detections.push(new DetectionFormatter(getDetectedSignatures(parser.scripts, 'detection'), "js"));
            }
            if(parser.hasCssDetections()){
                detections.push(new DetectionFormatter(getCssSignatureHits(parser.styleBlocks), "css"));
            }
            if(userSettings.getOption("simpleDeob") && parser.hasObfuscationDetections()){
                detections.push(new DetectionFormatter(getDetectedSignatures(parser.scripts, 'deobfuscation'), "obf"));
            }
            if(userSettings.getOption("conditionalComments") && parser.hasConditionalHtmlDetections()){
                detections.push(new DetectionFormatter(parser.groupConditionalHtmlDetectionsByCondition(), "chtml"));
            }
            if(parser.scripts.length > 0 && userSettings.getOption("includeJS")){
                detections.push(new DetectionFormatter(parser.scripts, "jsraw"));
            }

            let summary = "";
            chatter(stylize(fileName).toUpperCase());
            if(detections.length === 0){
                summary += new DetectionHeader("INFO", "no-signatures-detected", 0).print();
                summary += new DetectionFormatter(file.toString(), "dom").print();
            }else{
                for(let i in detections){
                    summary += detections[i].print();
                }
                if(userSettings.getOption("includeDOM")){
                    summary += new DetectionFormatter(file.toString(), "dom").print();
                }
            }
            resultPanel.innerHTML = summary;
            previousResults = new PreviousResults(fileName, summary, false);
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
            chatter(stylize(fileName).toUpperCase());
            previousResults = new PreviousResults(fileName, resultString, true);
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
        try{
            loadSettingsFromFile(settingsFile);
            hideSettings();
            chatter("Settings successfully imported!");
        }catch(e){
            throwError(e);
        }
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
    constructor(fileName, resultString, debug){
        this.fileName = fileName;
        this.resultString = resultString;
        this.debug = debug;
    }
}