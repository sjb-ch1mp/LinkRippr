function safeEscape(value){
    return value.replace(/[<]/g, "<span class='escape'>_</span>");
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
        if(str.length <= maxLength){
            return str;
        }else{
            return str.substring(0, maxLength - 3) + "...";
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

class DetectionFormatter{
    constructor(detections, signatureType){
        this.detections = detections;
        this.signatureType = signatureType;
    }

    print(){
        let toPrint = "";
        for(let name in this.detections){
            if((this.signatureType === "html")?this.detections[name]['detections'].length > 0:(this.detections[name].length > 0 || this.signatureType === "jsraw")){
                let formattedHeader;
                let formattedDetections;
                switch(this.signatureType){
                    case "html":
                        formattedDetections = new HtmlDetections(this.detections[name]['detections']);
                        formattedHeader = new DetectionHeader("HTML", name, this.detections[name]['detections'].length);
                        break;
                    case "js":
                        formattedDetections = new JavaScriptDetections(this.detections[name]);
                        formattedHeader = new DetectionHeader("JAVASCRIPT", name, this.detections[name].length);
                        break;
                    case "css":
                        formattedDetections = new CssDetections(this.detections[name]);
                        formattedHeader = new DetectionHeader("CSS", name, this.detections[name].length);
                        break;
                    case "obf":
                        formattedDetections = new DeobfuscationDetections(this.detections[name]);
                        formattedHeader = new DetectionHeader("DEOBFUSCATION", name, this.detections[name].length);
                        break;
                    case "chtml":
                        formattedDetections = new ConditionalCommentDetections(this.detections[name]);
                        formattedHeader = new DetectionHeader("CONDITIONAL COMMENTS", name, this.detections[name].length);
                        break;
                    case "domains":
                        formattedDetections = new UniqueDomainsDetections(this.detections[name]);
                        formattedHeader = new DetectionHeader("DOMAINS", name, this.detections[name].length);
                        break;
                    case "dom":
                        formattedDetections = new RawDom(this.detections);
                        formattedHeader = new DetectionHeader("RAW", "full dom", "-");
                        break;
                    case "jsraw":
                        let idx = name;
                        idx++;
                        formattedDetections = new RawJavaScript(this.detections[name]);
                        formattedHeader = new DetectionHeader("RAW", "script-" + padNumber(idx), this.detections[name].statements.length);
                }
                let detectionSummary = new DetectionSummary(formattedHeader, formattedDetections);
                toPrint += detectionSummary.print();
                if(this.signatureType === "dom"){
                    break;
                }
            }
        }
        return toPrint;
    }
}

class DetectionSummary{
    constructor(header, detections){
        this.header = header;
        this.detections = detections;
    }
    print(){
        let toPrint = this.header.print();
        toPrint += "<div class='detection-summary' id='" + this.header.signatureType.toLowerCase() + "-" + this.header.signatureName.toLowerCase() + "-content'>";
        toPrint += this.detections.print() + "</div>";
        return toPrint;
    }
}

class DetectionHeader{
    constructor(signatureType, signatureName, numDetections){
        this.signatureType = signatureType;
        this.signatureName = signatureName;
        this.numDetections = numDetections;
    }
    print(){
        let toPrint = "<button type='button' class='detection-header' id='" + this.signatureType.toLowerCase() + "-" + this.signatureName.toLowerCase() + "' onclick='toggleDetectionSummary(this)' data-content='"+ this.numDetections + "'>";
        toPrint += "<b>" + this.signatureType.toUpperCase() + "</b><span class='highlight'> || </span>" + this.signatureName.toLowerCase() + "</button>";
        return toPrint;
    }
}

class UniqueDomainsDetections{
    constructor(domains){
        this.domains = domains;
    }
    print(){
        let toPrint = "<table class='detection-table'><tr><th class='dh'>#</th><th class='dh'>DOMAIN</th></tr>";
        let idx = 0;
        for(let i in this.domains){
            idx++;
            toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td>";
            toPrint += "<td>" + this.domains[i].toLowerCase() + "</td></tr>"
        }
        return toPrint + "</table>";
    }
}

class HtmlDetections{
    constructor(detections){
        this.detections = detections;
    }
    print(){
        let toPrint = "<table class='detection-table'><tr><th class='dh'>#</th><th class='dh'>ELEMENT</th><th class='dh'>ATTRIBUTE</th><th class='dh'>VALUE</th></tr>";
        let idx = 0;
        for(let i in this.detections){
            idx++;
            for(let key in this.detections[i].detections){
                toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td>";
                toPrint += "<td>" + this.detections[i].tag.toUpperCase() + "</td>";
                toPrint += "<td>" + key.toLowerCase() + "</td>";
                toPrint += "<td>" + safeEscape(checkLength(stripNewLines(this.detections[i].detections[key]), 100)) + "</td></tr>";
            }
            if(this.detections[i].innerTags !== null){
                for(let j in this.detections[i].innerTags){
                    for(let key in this.detections[i].innerTags[j].detections){
                        toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td>";
                        toPrint += "<td>" + this.detections[i].tag.toUpperCase() + " -> ";
                        toPrint += this.detections[i].innerTags[j].tag.toUpperCase() + "</td>";
                        toPrint += "<td>" + key + "</td>";
                        toPrint += "<td>" + safeEscape(checkLength(stripNewLines(this.detections[i].innerTags[j].detections[key]), 100)) + "</td></tr>";
                    }
                }
            }
        }
        return toPrint + "</table>";
    }
}

class JavaScriptDetections{
    constructor(detections){
        this.detections = detections;
    }
    print(){
        let toPrint = "<table class='detection-table'><tr><th class='dh'>#</th><th class='dh'>VALUE</th></tr>";
        let idx = 0;
        for(let i in this.detections){
            idx++;
            toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td>";
            toPrint += "<td>" + safeEscape(checkLength(stripNewLines(this.detections[i]), 200)) + "</td></tr>";
        }
        return toPrint + "</table>";
    }
}

class CssDetections{
    constructor(detections){
        this.detections = detections;
    }
    print(){
        let toPrint = "<table class='detection-table'><tr><th class='dh'>#</th><th class='dh'>QUERY</th><th class='dh'>SELECTOR</th><th class='dh'>PROPERTY</th><th class='dh'>VALUE</th></tr>";
        let idx = 0;
        for(let i in this.detections){
            idx++;
            toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td>";
            toPrint += "<td>" + ((this.detections[i]['condition'] == null) ? "-" : this.detections[i]['condition']) + "</td>";
            toPrint += "<td>" + this.detections[i]['selector'] + "</td>";
            toPrint += "<td>" + this.detections[i]['attribute'] + "</td>";
            toPrint += "<td>" + safeEscape(checkLength(stripNewLines(this.detections[i]['value']), 100)) + "</td></tr>";
        }
        return toPrint + "</table>";
    }
}

class DeobfuscationDetections{
    constructor(detections){
        this.detections = detections;
    }
    print(){
        let toPrint = "<table class='detection-table'><tr><th class='dh'>#</th><th class='dh'>STATUS</th><th class='dh'>SIGNATURE</th><th class='dh'>VALUE</th></tr>";
        let idx = 0;
        for(let i in this.detections){
            idx++;
            if(typeof(this.detections[i]) === 'string'){
                let result = (this.detections[i].startsWith("[FAIL]")) ? "FAIL" : "SUCCESS";
                let raw = this.detections[i].substring(this.detections[i].indexOf("]") + 1, this.detections[i].length);
                toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td><td>" + result + '</td><td>-</td>';
                toPrint += "<td>" + safeEscape(checkLength(stripNewLines(raw), 200)) + "</td></tr>";
            }else if(typeof(this.detections[i] === 'object') && this.detections[i] !== null){
                //check for html detections
                if(this.detections[i].hasHtmlDetections()){
                    for(let name in this.detections[i].htmlSignatures){
                        let detectionsByName = this.detections[i].htmlSignatures[name]['detections'];
                        for(let j in detectionsByName){
                            for(let key in detectionsByName[j].detections){
                                toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td><td>SUCCESS</td><td>HTML : " + name + "</td>"
                                let valueStr = "[" + detectionsByName[j].tag.toUpperCase() + " : " + key.toLowerCase() + "] ";
                                valueStr += detectionsByName[j].detections[key];
                                toPrint += "<td>" + safeEscape(checkLength(stripNewLines(valueStr), 100)) + "</td></tr>";
                            }
                            if(detectionsByName[j].innerTags !== null){
                                for(let k in detectionsByName[j].innerTags){
                                    for(let key in detectionsByName[j].innerTags[k].detections){
                                        toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td><td>SUCCESS</td><td>HTML : " + name + "</td>"
                                        let valueStr = "[" + detectionsByName[j].tag.toUpperCase() + " -> ";
                                        valueStr += detectionsByName[j].innerTags[k].tag.toUpperCase() + " : ";
                                        valueStr += key + "] ";
                                        valueStr += detectionsByName[j].innerTags[k].detections[key];
                                        toPrint += "<td>" + safeEscape(checkLength(stripNewLines(valueStr), 100)) + "</td></tr>";
                                    }
                                }
                            }
                        }
                    }
                }

                //check for signature detections
                if(this.detections[i].hasJavaScriptDetections()){
                    let detectionsByName = getDetectedSignatures(this.detections[i].scripts, 'detected');
                    for(let name in detectionsByName){
                        for(let j in detectionsByName[name]){
                            toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td><td>SUCCESS</td><td>JAVASCRIPT : " + name + "</td>"
                            toPrint += "<td>" + safeEscape(checkLength(stripNewLines(detectionsByName[name][j]), 100)) + "</td></tr>";
                        }
                    }
                }

                //check for css detections
                if(this.detections[i].hasCssDetections()){
                    let detectionsByName = getCssSignatureHits(this.detections[i].styleBlocks);
                    for(let name in detectionsByName){
                        for(let j in detectionsByName[name]){
                            toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td><td>SUCCESS</td><td>CSS : " + name + "</td>"
                            let valueStr = (detectionsByName[name][j]['condition'] == null) ? "" : this.detections[j]['condition'] + " { ";
                            valueStr += detectionsByName[name][j]['selector'] + " { ";
                            valueStr += detectionsByName[name][j]['attribute'] + " : ";
                            valueStr += detectionsByName[name][j]['value'] + "; } ";
                            valueStr += (detectionsByName[name][j]['condition'] == null) ? "" : this.detections[j]['condition'] + "}";
                            toPrint += "<td>" + safeEscape(checkLength(stripNewLines(valueStr), 100)) + "</td></tr>";
                        }
                    }
                }

                //check for cond comments
                if(this.detections[i].hasConditionalHtmlDetections()){
                    let detectionsByIndex = this.detections[i].conditionalHtml;
                    for(let j in detectionsByIndex){
                        toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td><td>SUCCESS</td><td>CONDITIONAL COMMENTS : " + detectionsByIndex[j]['type'] + "</td>"
                        let valueStr = "[" + detectionsByIndex[j]['condition'] + "] " + detectionsByIndex[j]['html'];
                        toPrint += "<td>" + safeEscape(checkLength(stripNewLines(valueStr), 100)) + "</td></tr>";
                    }
                }
            }
        }
        return toPrint + "</table>";
    }
}

class ConditionalCommentDetections{
    constructor(detections){
        this.detections = detections;
    }
    print(){
        let toPrint = "<table class='detection-table'><tr><th class='dh'>#</th><th class='dh'>HTML</th></tr>";
        let idx = 0;
        for(let i in this.detections){
            idx++;
            toPrint += "<tr class='detection-row-" + ((idx%2===0)?"even":"odd") + "'><td>" + padNumber(idx) + "</td>";
            toPrint += "<td>" + safeEscape(checkLength(stripNewLines(this.detections[i]['html']), 100)) + "</td></tr>";
        }
        return toPrint + "</table>";
    }
}

class RawDom{
    constructor(dom){
        this.dom = dom.split("\n");
    }
    print(){
        let toPrint = "<table class='detection-table'><tr><th class='dh'>#</th><th class='dh'>LINE</th></tr>";
        let idx = 0;
        for(let i in this.dom){
            if(this.dom[i].trim().length > 0){
                idx++;
                toPrint += "<tr class='detection-row-odd'><td>" + padNumber(idx) + "</td>";
                toPrint += "<td>" + safeEscape(checkLength(stripNewLines(this.dom[i].trim()), 100)) + "</td></tr>";
            }
        }
        return toPrint + "</table>";
    }
}

class RawJavaScript{
    constructor(script){
        console.log(script);
        this.script = script;
    }
    print(){
        let toPrint = "<table class='detection-table'><tr><th class='dh'>#</th><th class='dh'>STATEMENT</th></tr>";
        let idx = 0;
        for(let i in this.script.statements){
            console.log(this.script.statements[i]);
            idx++;
            toPrint += "<tr class='detection-row-odd'><td>" + padNumber(idx) + "</td>";
            toPrint += "<td>" + safeEscape(checkLength(stripNewLines(this.script.statements[i]._raw), 100)) + "</td></tr>";
        }
        return toPrint + "</table>";
    }
}