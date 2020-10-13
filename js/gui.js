function padContent(){
    let headerHeight = document.getElementById("banner").clientHeight +
        document.getElementById("chatter_box").clientHeight;
    let footerHeight = document.getElementById("footer").clientHeight;
    let content = document.getElementById("content");
    let totalHeight = document.documentElement.scrollHeight;
    if(settingsVisible || document.getElementById("results") == null || document.getElementById("results").innerText == ""){
        content.setAttribute("style", "padding-left: 5%; padding-right: 5%; padding-top: " + (headerHeight*1.05) + "px; padding-bottom: " + (footerHeight*1.15) + "px; height: " + totalHeight + "px;");
        document.getElementById("body").setAttribute("style", "overflow: hidden; height: 100%;");
    }else{
        content.setAttribute("style", "padding-left: 5%; padding-right: 5%; padding-top: " + (headerHeight*1.05) + "px; padding-bottom: " + (footerHeight*1.15) + "px;");
        document.getElementById("body").removeAttribute("style");
    }

}

function showSettings(section){

    let settingsPanel = document.getElementById("content");
    let settingsHtml = "<br><br><div align='right'>";
    settingsHtml += "<button class='close-button' onclick='hideSettings()'>X</button>";
    settingsHtml += "</div>";
    settingsHtml += "<hr style='color: #54001C'>";

    switch(section){
        case 'settings':
            settingsHtml += buildSettingsMenu();
            break;
        case 'extractions':
            settingsHtml += buildExtractionsMenu();
            break;
        case 'signatures':
            settingsHtml += buildSignaturesMenu();
    }
    settingsPanel.innerHTML = settingsHtml;
    showUserSettings(section);
    setUpGlobalVariables(stylize(section.toUpperCase()));
}

function showUserSettings(section){
    if(section !== "settings"){
        return;
    }

    let options = document.getElementsByTagName('input');
    for(let i in options){
        if(options[i].type === "checkbox"){
            options[i].checked = userSettings.getOption(options[i].id);
        }
    }
}

function buildSettingsMenu(){
    let settingsHtml = "<h2>< Upload /></h2>";
    settingsHtml += "<p class='settings'>Manually upload an HTML file.</p>"
    settingsHtml += "<input class='settings' id='upload-file' type='file' accept='text/html' onchange='uploadHandler(this)'>";
    settingsHtml += "<br><br><hr style='color: #54001C'>";
    settingsHtml += "<h2>< Mode /></h2>";
    settingsHtml += "<button class='settings' onclick='changeMode()'>TOGGLE MODE</button><br/>";
    settingsHtml += "<p class='settings'>::: " + userSettings.getOption('mode') + "_MODE :::<\p>";
    switch(userSettings.getOption('mode')){
        case LRMode.EXTRACTION:
            settingsHtml += "<p class='settings'><i>LinkRippr will conduct DOM extractions and search for Script signatures</i></p>";
            break;
        case LRMode.URL_SEARCH:
            settingsHtml += "<p class='settings'><i>LinkRippr will search for URLs in the document</i></p>";
            break;
        case LRMode.PRETTY_PRINT:
            settingsHtml += "<p class='settings'><i>LinkRippr will pretty print script blocks in full</i></p>";
            break;
        case LRMode.DEBUG_TOKENIZER:
            settingsHtml += "<p class='settings'><i>LinkRippr will dump tokenizer output for debugging purposes</i></p>";
    }
    settingsHtml += "<br><br><hr style='color: #54001C'>";
    settingsHtml += "<h2>< Options /></h2>";
    settingsHtml += "<table class='settings'><tr><td><input id='truncate' type='checkbox' onchange='toggleOption(this.id)'></td><td><label class='settings' for='truncate'>Truncate Output</label></td>></tr>";
    settingsHtml += "<tr><td><input id='simpleDeob' type='checkbox' onchange='toggleOption(this.id)'></td><td><label class='settings' for='simpleDeob'>Attempt Simple Deobfuscation</label></td></tr></table>";
    return settingsHtml;
}

function buildExtractionsMenu(){
    let settingsHtml = "<h2>< DOM Extractions /></h2>";
    settingsHtml += "<button class='settings' onclick='resetDomExtractionDefaults()'>RESET DEFAULTS</button>";
    if(Object.keys(userSettings.extractions).length > 0){
        settingsHtml += "<p class='settings'>LinkRippr is currently extracting the following elements and attributes.</p>";
        settingsHtml += "<table class='settings'><tr><th>TAG</th><th colspan='2'>ATTRIBUTES</th></tr>";
        for(let key in userSettings.extractions){
            settingsHtml += "<tr><td>" + key + "</td><td>" + userSettings.extractions[key]["attributes"].join(",") + "</td>"
            settingsHtml += "<td><button id='" + key + "' class='settings' onclick='changeExtractions(this.id)'>DEL</button></td></tr>";
        }
        settingsHtml += "<tr><td><input type='text' placeholder='NEW EXTRACTION' id='newTag'></td><td><input type='text' id='newAttributes'></td><td><button class='settings' onclick='changeExtractions(null)'>ADD</button></td></tr>";
    }else {
        settingsHtml += "<p class='settings'>LinkRippr is not extracting any elements.</p>";
        settingsHtml += "<table class='settings'><tr><th>TAG</th><th colspan='2'>ATTRIBUTES</th></tr>";
        settingsHtml += "<tr><td><input type='text' placeholder='NEW TAG' id='newTag'></td><td><input type='text' id='newAttributes'></td><td><button class='settings' onclick='changeExtractions(null)'>ADD</button></td></tr>";
    }
    return settingsHtml;
}

function buildSignaturesMenu(){
    //Write Script Signatures Section
    let settingsHtml = "<h2>< Script Signatures ></h2>";
    settingsHtml += "<button class='settings' onclick='resetScriptSignatureDefaults()'>RESET DEFAULTS</button>";
    if(Object.keys(userSettings.signatures).length > 0){
        settingsHtml += "<p class='settings'>LinkRippr is currently searching for the following signatures.</p>";
        settingsHtml += "<table class='settings'><tr><th>NAME</th><th colspan='2'>PATTERN</th></tr>";
        for(let key in userSettings.signatures){
            settingsHtml += "<tr><td>" + key + "</td><td>" + userSettings.signatures[key]["user_view"] + "</td>";
            settingsHtml += "<td><button id='" + key + "' class='settings' onclick='changeSignatures(this.id)'>DEL</button></td></tr>";
        }
        settingsHtml += "<tr><td><input type='text' placeholder='NEW SIGNATURE' id='newFunction'></td><td><input type='text' id='newPattern'></td><td><button class='settings' onclick='changeSignatures(null)'>ADD</button></td></tr>";
    }else{
        settingsHtml += "<p class='settings'>LinkRippr is not searching for any script signatures.</p>";
        settingsHtml += "<table class='settings'><tr><th>NAME</th><th colspan='2'>PATTERN</th></tr>";
        settingsHtml += "<tr><td><input type='text' placeholder='NEW SIGNATURE' id='newFunction'></td><td><input type='text' id='newPattern'></td><td><button class='settings' onclick='changeSignatures(null)'>ADD</button></td></tr>";
    }
    return settingsHtml;
}

function toggleMenu(){
    document.getElementById("settings-menu").classList.toggle("show");
}

function toggleOption(id){
    userSettings.setOption(id, !(userSettings.getOption(id)));
    showUserSettings('section');
}

function hideSettings(){
    settingsVisible = false;
    document.getElementById("content").innerHTML = "<p id='results'></p>";
    if(previousResults !== null){
        document.getElementById("results").innerText = previousResults.resultString;
        setUpGlobalVariables(stylize(previousResults.fileName));
    }else{
        setUpGlobalVariables( "Drop an HTML file");
    }
}

