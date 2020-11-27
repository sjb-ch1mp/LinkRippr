function safeEscape(value){
    return value.replace(/</g, "<span class='escape'>_lt_</span>");
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
            return str.substring(0, maxLength);
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
        if(this.signatureType === "js"){
            console.log(this.detections);
        }
        let toPrint = "";
        for(let name in this.detections){
            if((this.signatureType === "html") ? this.detections[name]['detections'].length > 0 : this.detections[name].length > 0){
                let formattedHeader;
                let formattedDetections;
                switch(this.signatureType){
                    case "html":
                        formattedHeader = new DetectionHeader("HTML", name);
                        formattedDetections = new HtmlDetections(this.detections[name]['detections']);
                        break;
                    case "js":
                        formattedHeader = new DetectionHeader("JAVASCRIPT", name);
                        formattedDetections = new JavaScriptDetections(this.detections[name]);
                        break;
                    case "css":
                        formattedHeader = new DetectionHeader("CSS", name);
                        formattedDetections = new CssDetections(this.detections[name]);
                        break;
                    case "obf":
                        formattedHeader = new DetectionHeader("DEOBFUSCATION", name);
                        formattedDetections = new DeobfuscationDetections(this.detections[name]);
                        break;
                    case "chtml":
                        formattedHeader = new DetectionHeader("CONDITIONAL COMMENTS", this.detections[name]['type']);
                        formattedDetections = new ConditionalCommentDetection(this.detections[name]);
                }
                let detectionSummary = new DetectionSummary(formattedHeader, formattedDetections);
                toPrint += detectionSummary.print();
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
        toPrint += "<p class='detections'>" + this.detections.print() + "</p></div>"
        return toPrint;
    }
}

class DetectionHeader{
    constructor(signatureType, signatureName){
        this.signatureType = signatureType;
        this.signatureName = signatureName;
    }
    print(){
        let toPrint = "<button type='button' class='detection-header' id='" + this.signatureType.toLowerCase() + "-" + this.signatureName.toLowerCase() + "' onclick='expandDetectionSummary(this)'>";
        toPrint += "<b>[" + this.signatureType.toUpperCase() + "]</b> " + this.signatureName.toLowerCase() + "</button>";
        return toPrint;
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
                toPrint += "<td>" + checkLength(safeEscape(stripNewLines(this.detections[i].detections[key])), 100) + "</td></tr>";
            }
            if(this.detections[i].innerTags !== null){
                for(let j in this.detections[i].innerTags){
                    for(let key in this.detections[i].innerTags[j].detections){
                        toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td>";
                        toPrint += "<td>" + this.detections[i].tag.toUpperCase() + " -> ";
                        toPrint += this.detections[i].innerTags[j].tag.toUpperCase() + "</td>";
                        toPrint += "<td>" + key + "</td>";
                        toPrint += "<td>" + checkLength(safeEscape(stripNewLines(this.detections[i].innerTags[j].detections[key])), 100) + "</td></tr>";
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
        console.log(this.detections);
        let toPrint = "<table class='detection-table'><tr><th class='dh'>#</th><th class='dh'>VALUE</th></tr>";
        let idx = 0;
        for(let i in this.detections){
            idx++;
            toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td>";
            toPrint += "<td>" + checkLength(safeEscape(stripNewLines(this.detections[i])), 100) + "</td></tr>";
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
            toPrint += "<td>" + checkLength(safeEscape(stripNewLines(this.detections[i]['value'])), 100) + "</td></tr>";
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
                toPrint += "<td>" + checkLength(safeEscape(stripNewLines(raw)), 100) + "</td></tr>";
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
                                toPrint += "<td>" + checkLength(safeEscape(stripNewLines(valueStr)), 100) + "</td></tr>";
                            }
                            if(detectionsByName[j].innerTags !== null){
                                for(let k in detectionsByName[j].innerTags){
                                    for(let key in detectionsByName[j].innerTags[k].detections){
                                        toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td><td>SUCCESS</td><td>HTML : " + name + "</td>"
                                        let valueStr = "[" + detectionsByName[j].tag.toUpperCase() + " -> ";
                                        valueStr += detectionsByName[j].innerTags[k].tag.toUpperCase() + " : ";
                                        valueStr += key + "] ";
                                        valueStr += detectionsByName[j].innerTags[k].detections[key];
                                        toPrint += "<td>" + checkLength(safeEscape(stripNewLines(valueStr)), 100) + "</td></tr>";
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
                            toPrint += "<td>" + checkLength(safeEscape(stripNewLines(detectionsByName[name][j])), 100) + "</td></tr>";
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
                            toPrint += "<td>" + checkLength(safeEscape(stripNewLines(valueStr)), 100) + "</td></tr>";
                        }
                    }
                }

                //check for cond comments
                if(this.detections[i].hasConditionalHtmlDetections()){
                    let detectionsByIndex = this.detections[i].conditionalHtml;
                    for(let j in detectionsByIndex){
                        toPrint += "<tr class='" + ((idx%2===0)?"detection-row-even":"detection-row-odd") + "'><td>" + padNumber(idx) + "</td><td>SUCCESS</td><td>CONDITIONAL COMMENTS : " + detectionsByIndex[j]['type'] + "</td>"
                        let valueStr = "[" + detectionsByIndex[j]['condition'] + "] " + detectionsByIndex[j]['html'];
                        toPrint += "<td>" + checkLength(safeEscape(stripNewLines(valueStr)), 100) + "</td></tr>";
                    }
                }
            }
        }
        return toPrint + "</table>";
    }
}

class ConditionalCommentDetection{
    constructor(detection){
        this.detection = detection;
    }
    print(){
        let toPrint = "<table class='detection-table'><tr><th class='dh'>CONDITION</th><th class='dh'>HTML</th></tr>";
        toPrint += "<tr class='detection-row-even'><td>" + this.detection['condition'] + "</td>";
        toPrint += "<td>" + checkLength(safeEscape(stripNewLines(this.detection['html'])) + '\n', 100) + "</td></tr>";
        return toPrint + "</table>";
    }
}