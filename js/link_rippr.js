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
    if(file != null && file != undefined){
        let tokenizer = new DOMTokenizer(file.toString());
        let tokenizedString = '';
        while(tokenizer.hasNext()){
            if(tokenizer.current.tokenType == DOMTokenType.TAG_NAME){
                tokenizedString += tokenizer.current.tokenType + ': ' + tokenizer.current.value + ' (is_void = ' + getElementFeature(tokenizer.current.value, Feature.IS_VOID) + ', is_deprecated = ' + getElementFeature(tokenizer.current.value, Feature.IS_DEPRECATED) + ')\n';
            }else{
                tokenizedString += tokenizer.current.tokenType + ': ' + tokenizer.current.value + '\n';
            }
            tokenizer.next();
        }
        results.innerText = "== TOKENIZED DOM ==\n\n" + tokenizedString;
        padContent();
        chatter("Done");
    }else{
        throwError("Error importing file");
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
