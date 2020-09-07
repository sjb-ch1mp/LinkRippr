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
    let extractionsHtml = "<h2>< Extractions /></h2>";
    extractionsHtml += "<button style='background-color: #0A1926; color: whitesmoke; font-family: Roboto; border-color: #0A1926;' onclick='clearUserExtractions()'>RESET TO DEFAULT</button><br/>";
    extractionsHtml += "<table class='settings'><tr><th>TAG NAME</th><th>ATTRIBUTE NAMES</th><th>EXTRACTION TYPE</th></tr>";
    extractionsHtml += "<tr><td>base</td><td>href</td><td>default</td></tr>";
    extractionsHtml += "<tr><td>a</td><td>href</td><td>default</td></tr>";
    extractionsHtml += "<tr><td>iframe</td><td>href</td><td>default</td></tr>";
    extractionsHtml += "<tr><td>form</td><td>method,action</td><td>default</td></tr>";
    extractionsHtml += "<tr><td>input</td><td>name,type</td><td>default</td></tr>";
    extractionsHtml += "<tr><td>script</td><td>data-src,src</td><td>default</td></tr>";
    if(userSettings.userExtractions != null){
        for(let key in userSettings.userExtractions){
            extractionsHtml += "<tr><td>" + key + "</td><td>" + userSettings.userExtractions[key].join(",") + "</td><td>user-defined</td></tr>";
        }
    }
    extractionsHtml += "<tr><td><input type='text' name='newTag' id='newTag' placeholder='New <tag>'/></td>";
    extractionsHtml += "<td><input type='text' name='newAttributes' id='newAttributes'/></td>";
    extractionsHtml += "<td><button style='background-color: #0A1926; color: whitesmoke; font-family: Roboto; border-color: #0A1926;' onclick='addUserExtraction()'>ADD</button></td></tr>";
    extractionsHtml += "</table>";
    extractionsHtml += "<hr style='color: #54001C'>";
    extractionsHtml += "<h2>< Mode /></h2>";
    extractionsHtml += "<button style='background-color: #0A1926; color: whitesmoke; font-family: Roboto; border-color: #0A1926;' onclick='changeMode()'>TOGGLE MODE</button><br/>";
    extractionsHtml += "<p id='settings-text'>LinkRippr is currently in " + userSettings.mode + " mode.</p>";
    extractionsHtml += "<hr style='color: #54001C'>";

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

function addUserExtraction(){
    let newTag = document.getElementById("newTag");
    let newAttributes = document.getElementById("newAttributes");
    let extractionsPanel = document.getElementById("content");

    try{
        if(newTag.value === undefined || newTag.value === ""){
            throw "Tag name required";
        }
        if(newAttributes.value === undefined || newAttributes.value === ""){
            throw "Attributes required";
        }
        userSettings.addUserExtraction(newTag.value, newAttributes.value);
        showSettings(false);
    }catch(err){
        throwError(err);
    }

}

function clearUserExtractions(){
    userSettings.userExtractions = {};
    showSettings(false);
}

class UserSettings{

    constructor(){
        this.userExtractions = null;
        this.mode = LRMode.NORMAL;
    }

    addUserExtraction(tag, attributes){

        //initialise userExtractions
        if(this.userExtractions == null){
            this.userExtractions = {};
        }

        //check if tag is already being extracted
        if(tag in this.userExtractions || defaultTags.includes(tag)){
            throw "Tag \'" + tag + "\' is already being extracted."
        }

        if(attributes.includes(",")){
            this.userExtractions[tag] = attributes.split(",");
        }else{
            this.userExtractions[tag] = [attributes];
        }
    }
}

const LRMode = {
    NORMAL:"NORMAL",
    DEBUG_TOKENIZER:"DEBUG_TOKENIZER"
}