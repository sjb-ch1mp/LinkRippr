function getDivider(char, len){
    let divider = "";
    for(let i=0; i<=len; i++){
        divider += char
    }
    return divider;
}

function buildHeader(tagName, attributeNames, nestedTags){

    let headerText = "| " + stylize(tagName.toUpperCase() + ": " + attributeNames.join(","));

    let divider = getDivider("=", 99);

    let nestedTagList = "";
    if(nestedTags != null){
        for(let key in nestedTags){
            nestedTagList += "| + " + stylize(key.toUpperCase() + ": " + nestedTags[key].join(",")) + "\n";
        }
    }

    return "\n\n" + headerText + "\n" + nestedTagList + "|" + divider + "\n";
}

function padNumber(number){
    let numStr = number + "";
    while(numStr.length < 3){
        numStr = "0" + numStr;
    }
    return numStr;
}

function checkLength(str, maxLength){
    if(userSettings.getOption('truncate')){
        if(str.length <= maxLength || (str.length === (maxLength + 1) && str.charAt(maxLength + 1) === "\n")){
            return str;
        }else{
            return str.substring(0, maxLength - 3) + "...\n";
        }
    }
    return str;
}

function stripNewLines(str){
    if(typeof str === "string"){
        return str.replace(new RegExp("[\n|\r]", "g"),'');
    }
}

function stylize(str){
    return "< " + str + " />";
}