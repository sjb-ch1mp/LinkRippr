function padContent(){
    let headerHeight = document.getElementById("banner").clientHeight +
        document.getElementById("chatter_box").clientHeight;
    let footerHeight = document.getElementById("footer").clientHeight;
    let content = document.getElementById("content");
    let totalHeight = document.documentElement.scrollHeight;
    if(document.getElementById("results") == null || document.getElementById("results").innerText == ""){
        content.setAttribute("style", "padding-left: 5%; padding-right: 5%; padding-top: " + (headerHeight*1.05) + "px; padding-bottom: " + (footerHeight*1.15) + "px; height: " + totalHeight + "px;");
        document.getElementById("body").setAttribute("style", "overflow: hidden; height: 100%;");
    }else{
        content.setAttribute("style", "padding-left: 5%; padding-right: 5%; padding-top: " + (headerHeight*1.05) + "px; padding-bottom: " + (footerHeight*1.15) + "px;");
        document.getElementById("body").removeAttribute("style");
    }

}

function showSettings(buttonClicked){
    if(buttonClicked){
        if(settingsVisible){
            hideSettings();
            return;
        }else{
            settingsVisible = true;
        }
    }

    let extractionsPanel = document.getElementById("content");
    let extractionsHtml = "<h2>< Mode /></h2>";
    extractionsHtml += "<button class='settings' onclick='changeMode()'>TOGGLE MODE</button><br/>";
    extractionsHtml += "<p id='settings-text'>LinkRippr is currently in " + userSettings.mode + " mode.</p>";
    extractionsHtml += "<hr style='color: #54001C'>";
    extractionsHtml += "<h2>< Extractions /></h2>";
    extractionsHtml += "<button class='settings' onclick='reset()'>RESET DEFAULTS</button>";
    if(Object.keys(userSettings.extractions).length > 0){
        extractionsHtml += "<p id='settings-text'>LinkRippr is currently extracting the following elements and attributes.</p>";
        extractionsHtml += "<table class='settings'><tr><th>TAG</th><th colspan='2'>ATTRIBUTES</th></tr>";
        for(let key in userSettings.extractions){
            extractionsHtml += "<tr><td>" + key + "</td><td>" + userSettings.extractions[key]["attributes"].join(",") + "</td>"
            extractionsHtml += "<td><button id='" + key + "' class='settings' onclick='changeExtractions(this.id)'>DEL</button></td></tr>";
        }
        extractionsHtml += "<tr><td><input type='text' placeholder='NEW TAG' id='newTag'></td><td><input type='text' id='newAttributes'></td><td><button class='settings' onclick='changeExtractions(null)'>ADD</button></td></tr>";
    }else {
        extractionsHtml += "<p id='settings-text'>LinkRippr is not extracting any elements.</p>";
        extractionsHtml += "<table class='settings'><tr><th>TAG</th><th colspan='2'>ATTRIBUTES</th></tr>";
        extractionsHtml += "<tr><td><input type='text' placeholder='NEW TAG' id='newTag'></td><td><input type='text' id='newAttributes'></td><td><button class='settings' onclick='changeExtractions(null)'>ADD</button></td></tr>";
    }

    extractionsPanel.innerHTML = extractionsHtml;
    extractionsPanel.style.color = "#54001C";
    setUpGlobalVariables();
}

function hideSettings(){
    settingsVisible = false;
    document.getElementById("content").innerHTML = "<p id='results'></p>";
    setUpGlobalVariables();
}

function changeMode(){
    if(userSettings != null){
        userSettings.mode = (userSettings.mode === LRMode.NORMAL) ? LRMode.DEBUG_TOKENIZER : LRMode.NORMAL;
        showSettings();
    }
}

function changeExtractions(key){
    if(key!=null){
        userSettings.removeExtraction(key);
        showSettings(false);
    }else{
        let newTag = document.getElementById("newTag");
        let newAttributes = document.getElementById("newAttributes");
        try{
            if(newTag.value === undefined || newTag.value === ""){
                throw "Tag name required";
            }
            if(newAttributes.value === undefined || newAttributes.value === ""){
                throw "Attributes required";
            }
            userSettings.addExtraction(newTag.value, newAttributes.value);
            showSettings(false);
        }catch(err){
            throwError(err);
        }
    }
}

function reset(){
    userSettings.resetDefaults();
    showSettings(false);
}

class UserSettings{

    constructor(){
        this.extractions = {};
        this.resetDefaults();
        this.mode = LRMode.NORMAL;
    }

    resetDefaults(){
        this.extractions = {
            "base":{"attributes":["href"],"hasNested":false},
            "a":{"attributes":["href"],"hasNested":false},
            "iframe":{"attributes":["href"],"hasNested":false},
            "script":{"attributes":["src"],"hasNested":false},
            "form":{"attributes":["method", "action"],"hasNested":false}
        };
    }

    addExtraction(tag, attributes){

        //check if tag is already being extracted
        if(tag in this.extractions){
            throw "Tag \'" + tag + "\' is already being extracted."
        }

        if(attributes.includes(",") || attributes.includes("[") || attributes.includes("]")){
            try{
                attributes = this.processAttributes(attributes);
            }catch(err){
                throw err;
            }
        }else{
            attributes = {"attributes":[attributes.replace(" ", "")], "hasNested":false};
        }

        //check if tag is for a void element and is nested - this is impossible
        if(getElementFeature(tag, Feature.IS_VOID) && attributes["hasNested"]){
            throw "\"" + tag.toUpperCase() + "\" is a void element and can therefore not contain nested elements.";
        }

        this.extractions[tag] = attributes;
    }

    removeExtraction(tag){
        if(this.extractions == null || !(tag in this.extractions)){
            return;
        }

        if(tag in this.extractions) {
            delete this.extractions[tag];
        }
    }

    processAttributes(attString){

        let hasNested = false;
        let attributes = [];
        let buffer = "";
        let nested = false;
        let errChars = ["]", ":"];

        //general check for bad characters
        attString = attString.toLowerCase();
        if(!(attString.match(new RegExp("^[,\\[\\]:a-z0-9\-]+$")))){
            throw "Attribute string contains illegal values.";
        }

        //use pseudo parser to extract nested and unnested attributes
        for(let i=0; i<attString.length; i++){
            if(nested){
                hasNested = true;
                buffer += attString.charAt(i);
                if(attString.charAt(i) === "]"){
                    nested = false;
                    attributes.push(buffer);
                    buffer = "";
                }else if(attString.charAt(i) === "["){
                    throw "LinkRipper can only handle nesting to a depth of 1."
                }
            }else if(attString.charAt(i) === "["){
                if(buffer.trim() !== ""){
                    attributes.push(buffer);
                }
                buffer = "[";
                nested = true;
            }else if(attString.charAt(i) === ","){
                if(buffer.trim() !== ""){
                    attributes.push(buffer);
                    buffer = "";
                }
            }else if(i === attString.length - 1){
                if(errChars.includes(attString.charAt(i))){
                    buffer = "err";
                    break;
                }
                if(buffer.trim() != ""){
                    if(attString.charAt(i) !== ","){
                        attributes.push(buffer + attString.charAt(i));
                    }
                    buffer = "";
                }
            }else{
                if(errChars.includes(attString.charAt(i))){
                    console.log(attString.charAt(i))
                    buffer = "err";
                    break;
                }
                buffer += attString.charAt(i);
            }
        }

        //check for errors
        if(buffer !== ""){
            console.log(buffer);
            throw "Incorrect syntax for nested extraction";
        }

        //clean up attributes
        for(let idx in attributes){
            attributes[idx] = attributes[idx].replace(" ","");
        }
        return {"attributes":attributes, "hasNested":hasNested};
    }
}

const LRMode = {
    NORMAL:"NORMAL",
    DEBUG_TOKENIZER:"DEBUG_TOKENIZER"
}