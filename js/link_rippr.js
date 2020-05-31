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

        let resultString = "== TOKENIZED DOM ==\n";

        let tokenizer = new DOMTokenizer(file.toString());
        while(tokenizer.hasNext()){
            resultString += "\n" + tokenizer.current.tokenType + ": " + tokenizer.current.value;
            tokenizer.next();
        }

        tokenizer = new DOMTokenizer(file.toString());
        let parser = new DOMParser(tokenizer);
        let dom = parser.parseDOM();
        results.innerText = resultString + "\n\n== PARSED DOM ==\n\n" + dom.print();
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
