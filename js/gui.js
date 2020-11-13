function padContent(){
    let headerHeight = document.getElementById("banner").clientHeight +
        document.getElementById("chatter_box").clientHeight;
    let footerHeight = document.getElementById("footer").clientHeight;
    let content = document.getElementById("content");
    let totalHeight = document.documentElement.scrollHeight;
    let redoButton = document.getElementById('button-redo');
    if(settingsVisible || document.getElementById("results") == null || document.getElementById("results").innerText == ""){
        redoButton.setAttribute("style","display: none;");
        content.setAttribute("style", "padding-left: 5%; padding-right: 5%; padding-top: " + (headerHeight*1.05) + "px; padding-bottom: " + (footerHeight*1.15) + "px; height: " + totalHeight + "px;");
        document.getElementById("body").setAttribute("style", "overflow: hidden; height: 100%;");
    }else{
        redoButton.setAttribute("style","display: inline;");
        headerHeight += redoButton.clientHeight;
        content.setAttribute("style", "padding-left: 5%; padding-right: 5%; padding-top: " + (headerHeight*1.05) + "px; padding-bottom: " + (footerHeight*1.15) + "px;");
        document.getElementById("body").removeAttribute("style");
    }

}

function showSettings(section){

    let settingsPanel = document.getElementById("results");
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
    settingsVisible = true;
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
    settingsHtml += "<table class='settings'><tr><td><p class='settings'>Manually upload an HTML file.</p></td></tr>"
    settingsHtml += "<tr><td><input class='settings' id='upload-file' type='file' accept='text/html' onchange='uploadHandler(this)'></td></tr></table>";
    settingsHtml += "<br><hr style='color: #54001C'>";
    settingsHtml += "<h2>< Options /></h2>";
    settingsHtml += "<table class='settings'><tr><td><input id='truncate' type='checkbox' onchange='toggleOption(this.id)'></td><td><label class='settings' for='truncate'>Truncate Output</label></td></tr>";
    settingsHtml += "<tr><td><input id='simpleDeob' type='checkbox' onchange='toggleOption(this.id)'></td><td><label class='settings' for='simpleDeob'>Attempt Simple Deobfuscation</label></td></tr>";
    settingsHtml += "<tr><td><input id='debugTokenizer' type='checkbox' onchange='toggleOption(this.id)'></td><td><label class='settings' for='debugTokenizer'>Debug Mode</label></td></tr></table>";
    settingsHtml += "<br><hr style='color: #54001C'>";
    settingsHtml += "<h2>< Settings /></h2>";
    settingsHtml += "<table class='settings'><tr><td><p class='settings'>Import a LinkRippr settings file.</p></td></tr>"
    settingsHtml += "<tr><td><input class='settings' type='file' id='import-settings' accept='text/plain' onchange='uploadHandler(this)'></td></tr></table>";
    settingsHtml += "<br><table class='settings'><tr><td><p class='settings'>Export the current settings to a LinkRippr settings file.</p></td></tr>"
    settingsHtml += "<tr><td><button class='settings' onclick='exportCurrentSettings()'>EXPORT SETTINGS</button></td></tr></table>";
    return settingsHtml;
}

function buildExtractionsMenu(){
    let settingsHtml = "<h2>< DOM Extractions /></h2>";
    settingsHtml += "<table class='settings'><tr><td align='center'><button class='settings' onclick='resetDomExtractionDefaults()'>RESET DEFAULTS</button></td>";
    settingsHtml += "<td align='center'><button class='settings' onclick='clearExtractions()'>CLEAR EXTRACTIONS</button></td></tr></table>";
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
    settingsHtml += "<table class='settings'><tr><td align='center'><button class='settings' onclick='resetScriptSignatureDefaults()'>RESET DEFAULTS</button></td>";
    settingsHtml += "<td align='center'><button class='settings' onclick='clearSignatures()'>CLEAR SIGNATURES</button></td></tr></table>";
    if(Object.keys(userSettings.signatures).length > 0){
        settingsHtml += "<p class='settings'>LinkRippr is currently searching for the following signatures in script blocks.</p>";
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
    document.getElementById("content").innerHTML = "<button style='display:none;' id='button-redo' class='close-button' onclick='ripLinks()'>&#11153;</button><p id='results'></p>";
    if(previousResults !== null){
        document.getElementById("results").innerText = previousResults.resultString;
        setUpGlobalVariables(stylize(previousResults.fileName));
    }else{
        setUpGlobalVariables( "Drop an HTML file");
    }
}

