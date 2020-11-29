function padContent(){
    let headerHeight = document.getElementById("banner").clientHeight +
        document.getElementById("chatter_box").clientHeight;
    let footerHeight = document.getElementById("footer").clientHeight;
    let content = document.getElementById("content");
    let totalHeight = document.documentElement.scrollHeight;
    let redoButton = document.getElementById('button-redo');

    //Below code thanks to: https://stackoverflow.com/questions/4210798/how-to-scroll-to-top-of-page-with-javascript-jquery
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0,0);
    //Above code thanks to: https://stackoverflow.com/questions/4210798/how-to-scroll-to-top-of-page-with-javascript-jquery

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

function toggleDetectionSummary(header){
    if(header.id !== "info-no-signatures-detected"){
        let div = document.getElementById(header.id + "-content");
        div.classList.toggle("show");
    }
}

function showSettings(section){

    let settingsPanel = document.getElementById("results");
    let settingsHtml = "<br><br><div align='left'>";
    settingsHtml += "<button class='close-button' onclick='hideSettings()'>CLOSE</button>";
    settingsHtml += "</div>";
    settingsHtml += "<hr style='color: #54001C'>";

    switch(section){
        case 'settings':
            settingsHtml += buildSettingsMenu();
            break;
        case 'html':
            settingsHtml += buildHtmlSignaturesMenu();
            break;
        case 'javascript':
            settingsHtml += buildJavaScriptSignaturesMenu();
            break;
        case 'css':
            settingsHtml += buildCssSignaturesMenu();
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
    let settingsHtml = "<h2>< Analyze /></h2>";
    settingsHtml += "<table class='settings'><th>UPLOAD HTML FILE</th>"
    settingsHtml += "<tr><td><input class='settings' id='upload-file' type='file' accept='text/html' onchange='uploadHandler(this)'></td></tr></table>";
    settingsHtml += "<br><hr style='color: #54001C'>";
    settingsHtml += "<h2>< Options /></h2>";
    settingsHtml += "<table class='settings'><tr><td><input id='truncate' type='checkbox' onchange='toggleOption(this.id)'></td><td><label class='settings' for='truncate'>Truncate Output</label></td></tr>";
    settingsHtml += "<tr><td><input id='simpleDeob' type='checkbox' onchange='toggleOption(this.id)'></td><td><label class='settings' for='simpleDeob'>Attempt Simple Deobfuscation</label></td></tr>";
    settingsHtml += "<tr><td><input id='conditionalComments' type='checkbox' onchange='toggleOption(this.id)'></td><td><label class='settings' for='conditionalComments'>Extract Conditional HTML</label></td></tr>";
    settingsHtml += "<tr><td><input id='debugTokenizer' type='checkbox' onchange='toggleOption(this.id)'></td><td><label class='settings' for='debugTokenizer'>Debug Mode</label></td></tr></table>";
    settingsHtml += "<br><hr style='color: #54001C'>";
    settingsHtml += "<h2>< Save /></h2>";
    settingsHtml += "<table class='settings'><th width='50%'>LOAD SETTINGS</th><th width='50%'>SAVE SETTINGS</th>"
    settingsHtml += "<tr><td><input class='settings' type='file' id='import-settings' accept='text/plain' onchange='uploadHandler(this)'></td><td><button class='settings' onclick='exportCurrentSettings()'>SAVE AS...</button></td></tr></table>";
    return settingsHtml;
}

function buildHtmlSignaturesMenu(){
    let settingsHtml = "<h2>< HTML Signatures /></h2>";
    settingsHtml += "<table class='settings'><tr><td align='center'><button class='settings' onclick='resetHtmlSignatureDefaults()'>RESET DEFAULTS</button></td>";
    settingsHtml += "<td align='center'><button class='settings' onclick='clearHtmlSignatures()'>CLEAR SIGNATURES</button></td></tr></table>";
    if(Object.keys(userSettings.htmlSignatures).length > 0){
        settingsHtml += "<p class='settings'>LinkRippr is currently searching for the following HTML Signatures.</p>";
        settingsHtml += "<table class='settings'><tr><th>NAME</th><th>ELEMENT</th><th>ATTRIBUTES</th><th colspan='2'>VALUE</th></tr>";
        for(let key in userSettings.htmlSignatures){
            settingsHtml += "<tr><td>" + key + "</td><td>" + userSettings.htmlSignatures[key]["element"] + "</td>";
            settingsHtml += "<td>" + userSettings.htmlSignatures[key]["attributes"].join(",") + "</td><td>" + userSettings.htmlSignatures[key]['value-user-view'] + "</td>"
            settingsHtml += "<td><button id='" + key + "' class='settings' onclick='changeHtmlSignature(this.id)'>DEL</button></td></tr>";
        }
        settingsHtml += "<tr><td><input type='text' placeholder='NEW HTML SIGNATURE' id='newName'></td>";
        settingsHtml += "<td><input type='text' id='newElement'></td><td><input type='text' id='newAttributes'></td>";
        settingsHtml += "<td><input type='text' id='newHtmlValue'></td>"
        settingsHtml += "<td><button class='settings' onclick='changeHtmlSignature(null)'>ADD</button></td></tr>";
    }else {
        settingsHtml += "<p class='settings'>LinkRippr is not searching for any HTML signatures.</p>";
        settingsHtml += "<table class='settings'><tr><th>NAME</th><th>ELEMENT</th><th>ATTRIBUTES</th><th colspan='2'>VALUE</th></tr>";
        settingsHtml += "<tr><td><input type='text' placeholder='NEW HTML SIGNATURE' id='newName'></td>";
        settingsHtml += "<td><input type='text' id='newElement'></td><td><input type='text' id='newAttributes'></td>";
        settingsHtml += "<td><input type='text' id='newHtmlValue'></td>"
        settingsHtml += "<td><button class='settings' onclick='changeHtmlSignature(null)'>ADD</button></td></tr>";
    }
    return settingsHtml;
}

function buildJavaScriptSignaturesMenu(){
    //Write Script Signatures Section
    let settingsHtml = "<h2>< JavaScript Signatures ></h2>";
    settingsHtml += "<table class='settings'><tr><td align='center'><button class='settings' onclick='resetJavaScriptSignatureDefaults()'>RESET DEFAULTS</button></td>";
    settingsHtml += "<td align='center'><button class='settings' onclick='clearJavaScriptSignatures()'>CLEAR SIGNATURES</button></td></tr></table>";
    if(Object.keys(userSettings.javaScriptSignatures).length > 0){
        settingsHtml += "<p class='settings'>LinkRippr is currently searching for the following JavaScript signatures in script elements.</p>";
        settingsHtml += "<table class='settings'><tr><th>NAME</th><th colspan='2'>SIGNATURE</th></tr>";
        for(let key in userSettings.javaScriptSignatures){
            settingsHtml += "<tr><td>" + key + "</td><td>" + userSettings.javaScriptSignatures[key]["user_view"] + "</td>";
            settingsHtml += "<td><button id='" + key + "' class='settings' onclick='changeJavaScriptSignature(this.id)'>DEL</button></td></tr>";
        }
        settingsHtml += "<tr><td><input type='text' placeholder='NEW JS SIGNATURE' id='newFunction'></td>";
        settingsHtml += "<td><input type='text' id='newPattern'></td><td><button class='settings' onclick='changeJavaScriptSignature(null)'>ADD</button></td></tr>";
    }else{
        settingsHtml += "<p class='settings'>LinkRippr is not searching for JavaScript signatures in script elements.</p>";
        settingsHtml += "<table class='settings'><tr><th>NAME</th><th colspan='2'>SIGNATURE</th></tr>";
        settingsHtml += "<tr><td><input type='text' placeholder='NEW JS SIGNATURE' id='newFunction'></td>";
        settingsHtml += "<td><input type='text' id='newPattern'></td><td><button class='settings' onclick='changeJavaScriptSignature(null)'>ADD</button></td></tr>";
    }
    return settingsHtml;
}

function buildCssSignaturesMenu(){
    let settingsHtml = "<h2>< CSS Signatures ></h2>";
    settingsHtml += "<table class='settings'><tr><td align='center'><button class='settings' onclick='resetCssSignatureDefaults()'>RESET DEFAULTS</button></td>";
    settingsHtml += "<td align='center'><button class='settings' onclick='clearCssSignatures()'>CLEAR SIGNATURES</button></td></tr></table>";
    if(Object.keys(userSettings.cssSignatures).length > 0){
        settingsHtml += "<p class='settings'>LinkRippr is currently searching for the following CSS signatures in style elements.</p>";
        settingsHtml += "<table class='settings'><tr><th>NAME</th><th>SELECTOR</th><th>PROPERTY</th><th colspan='2'>VALUE</th></tr>";
        for(let key in userSettings.cssSignatures){
            settingsHtml += "<tr><td>" + key + "</td><td>" + userSettings.cssSignatures[key]['selector_user_view'] + "</td>";
            settingsHtml += "<td>" + userSettings.cssSignatures[key]['attribute_user_view'] + "</td><td>" + userSettings.cssSignatures[key]['value_user_view'] + "</td>";
            settingsHtml += "<td><button id='" + key + "' class='settings' onclick='changeCssSignatures(this.id)'>DEL</button></td></tr>";
        }
        settingsHtml += "<tr><td><input type='text' placeholder='NEW CSS SIGNATURE' id='newName'></td><td><input type='text' id='newSelector'></td>";
        settingsHtml += "<td><input type='text' id='newAttribute'></td><td><input type='text' id='newValue'></td>";
        settingsHtml += "<td><button class='settings' onclick='changeCssSignatures(null)'>ADD</button></td></tr>";
    }else{
        settingsHtml += "<p class='settings'>LinkRippr is not searching for CSS Signatures in style elements.</p>";
        settingsHtml += "<table class='settings'><tr><th>NAME</th><th>SELECTOR</th><th>PROPERTY</th><th colspan='2'>VALUE</th></tr>";
        settingsHtml += "<tr><td><input type='text' placeholder='NEW CSS SIGNATURE' id='newName'></td><td><input type='text' id='newSelector'></td>";
        settingsHtml += "<td><input type='text' id='newAttribute'></td><td><input type='text' id='newValue'></td>";
        settingsHtml += "<td><button class='settings' onclick='changeCssSignatures(null)'>ADD</button></td></tr>";
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
    document.getElementById("content").innerHTML = "<br><button style='display:none;' id='button-redo' class='close-button' onclick='redo()'>&#11153;</button><p id='results'></p>";
    if(previousResults !== null){
        if(previousResults.debug){
            document.getElementById("results").innerText = previousResults.resultString;
        }else{
            document.getElementById("results").innerHTML = previousResults.resultString;
        }
        setUpGlobalVariables(stylize(previousResults.fileName).toUpperCase());
    }else{
        setUpGlobalVariables( "Drop an HTML file");
    }
}

function redo(){
    if(userSettings.getOption("debugTokenizer")){
        dumpTokens();
    }else{
        ripLinks();
    }
}

