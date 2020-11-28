function changeHtmlSignature(key){
    if(key!=null){
        userSettings.removeSignature(key, 'html');
        showSettings('html');
    }else{
        let name = document.getElementById("newName").value;
        let element = document.getElementById("newElement").value;
        let attributes = document.getElementById("newAttributes").value;
        let val = document.getElementById('newHtmlValue').value;
        try{
            if(name === undefined || name.trim().length === 0){
                throw "HTML signature name is required";
            }
            if(element === undefined || element.trim().length === 0){
                element = "*";
            }
            if(attributes === undefined || attributes.trim().length === 0){
                attributes = "*";
            }
            if(val === undefined || val.trim().length === 0){
                val = ".*";
            }
            userSettings.addHtmlSignature(name, element, attributes, val);
            showSettings('html');
        }catch(err){
            throwError(err);
        }
    }
}

function changeJavaScriptSignature(key){
    if(key!=null){
        userSettings.removeSignature(key, 'javascript');
        showSettings('javascript');
    }else{
        let name = document.getElementById("newFunction").value;
        let signature = document.getElementById("newPattern").value;
        try{
            if(name === undefined || name.trim().length === 0){
                throw "JavaScript signature name required";
            }
            if(signature === undefined || signature.trim().length === 0){
                throw "JavaScript signature required";
            }else if(signature === ".*"){
                throw "Illegal JavaScript signature"
            }
            userSettings.addJavaScriptSignature(name, signature);
            showSettings('javascript');
        }catch(err){
            throwError(err);
        }
    }
}

function changeCssSignatures(key){
    if(key!=null){
        userSettings.removeSignature(key, 'css');
        showSettings('css');
    }else{
        let name = document.getElementById('newName').value;
        let selector = document.getElementById('newSelector').value;
        let attribute = document.getElementById('newAttribute').value;
        let val = document.getElementById('newValue').value;
        try{
            if(name === undefined || name.trim().length === 0){
                throw "CSS signature name is required";
            }
            if(selector === undefined || selector.trim().length === 0){
                selector = ".*";
            }
            if(attribute === undefined || attribute.trim().length === 0){
                attribute = ".*";
            }
            if(val === undefined || val.trim().length === 0){
                val = ".*";
            }
            userSettings.addCssSignature(name, selector, attribute, val);
            showSettings('css');
        }catch(err){
            throwError(err);
        }
    }
}

function clearHtmlSignatures(){
    userSettings.htmlSignatures = {};
    showSettings('html');
}

function resetHtmlSignatureDefaults(){
    userSettings.htmlSignatures = getDefaultHtmlSignatures();
    showSettings('html');
}

function clearJavaScriptSignatures(){
    userSettings.javaScriptSignatures = {};
    showSettings('javascript');
}

function resetJavaScriptSignatureDefaults(){
    userSettings.javaScriptSignatures = getDefaultJavaScriptSignatures();
    showSettings('javascript');
}

function clearCssSignatures(){
    userSettings.cssSignatures = {};
    showSettings('css');
}

function resetCssSignatureDefaults(){
    userSettings.cssSignatures = getDefaultCssSignatures();
    showSettings('css');
}

function exportCurrentSettings(){
    downloadFile(userSettings.export(), 'linkrippr_settings.txt');
}

function downloadFile(contents, fileName){
    let blob = new Blob([contents], {type:'text/plain'});
    if(window.navigator.msSaveOrOpenBlob){
        window.navigator.msSaveOrOpenBlob(blob, fileName);
    }else{
        let element = window.document.createElement('a');
        element.href = window.URL.createObjectURL(blob);
        element.download = fileName;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
}

function loadSettingsFromFile(settingsFile){
    clearHtmlSignatures();
    clearJavaScriptSignatures();
    clearCssSignatures();
    userSettings.import(JSON.parse(settingsFile));
}

class UserSettings{

    constructor(){
        this.htmlSignatures = getDefaultHtmlSignatures();
        this.javaScriptSignatures = getDefaultJavaScriptSignatures();
        this.cssSignatures = getDefaultCssSignatures();
        this.options = {
            'debugTokenizer': false,
            'truncate':false,
            'simpleDeob':true,
            'conditionalComments':true,
            'deobSignatures':getDefaultObfuscationSignatures()
        };
    }

    export(){
        let settings = this.options;
        delete settings['deobSignatures'];

        settings['htmlSignatures'] = {};
        for(let key in this.htmlSignatures){
            settings['htmlSignatures'][key] = {};
            settings['htmlSignatures'][key]['element'] = this.htmlSignatures[key]['element'];
            settings['htmlSignatures'][key]['attributes'] = this.htmlSignatures[key]['attributes'];
            settings['htmlSignatures'][key]['value'] = this.htmlSignatures[key]['value-user-view'];
        }

        settings['jsSignatures'] = {};
        for(let key in this.javaScriptSignatures){
            settings['jsSignatures'][key] = this.javaScriptSignatures[key]['user_view'];
        }

        settings['cssSignatures'] = {};
        for(let key in this.cssSignatures){
            settings['cssSignatures'][key] = {};
            settings['cssSignatures'][key]['selector'] = this.cssSignatures[key]['selector_user_view'];
            settings['cssSignatures'][key]['property'] = this.cssSignatures[key]['attribute_user_view'];
            settings['cssSignatures'][key]['value'] = this.cssSignatures[key]['value_user_view'];
        }
        return JSON.stringify(settings);
    }

    import(settings){
        this.options = settings;
        this.options['deobSignatures'] = getDefaultObfuscationSignatures();

        for(let key in this.options['htmlSignatures']){
            this.addHtmlSignature(
                key,
                this.options['htmlSignatures'][key]['element'],
                this.options['htmlSignatures'][key]['attributes'].join(","),
                this.options['htmlSignatures'][key]['value']
            );
        }
        delete this.options['htmlSignatures'];

        for(let key in this.options['jsSignatures']){
            this.addJavaScriptSignature(key, this.options['jsSignatures'][key]);
        }
        delete this.options['jsSignatures'];

        for(let key in this.options['cssSignatures']){
            this.addCssSignature(
                key,
                this.options['cssSignatures'][key]['selector'],
                this.options['cssSignatures'][key]['property'],
                this.options['cssSignatures'][key]['value']
            );
        }
        delete this.options['cssSignatures'];
    }

    addHtmlSignature(name, element, attributes, value){

        //check if tag is already being extracted
        if(name in this.htmlSignatures){
            throw "The name \"" + name + "\" is already being used for another HTML signature.";
        }

        if(this.signatureAlreadyExists('html', [element, attributes.replace(/\s/g, ''), value])){
            throw "LinkRippr is already searching for this HTML signature";
        }

        if(attributes.includes(",") || attributes.includes("[") || attributes.includes("]")){
            attributes = this.processAttributes(attributes);
        }else{
            attributes = {"attributes":[attributes.replace(/\s/g, "")], "hasNested":false};
        }

        //check if tag is for a void element and is nested - this is impossible
        if(getElementFeature(element, Feature.IS_VOID) && attributes["hasNested"]){
            throw "\"" + element.toUpperCase() + "\" is a void element and can therefore not contain nested elements.";
        }

        this.htmlSignatures[name] = {
            'element':element,
            'attributes':attributes['attributes'],
            'value':new RegExp(value, "g"),
            'value-user-view':value,
            'hasNested':attributes['hasNested']
        };
    }

    addJavaScriptSignature(name, pattern){
        if(name in this.javaScriptSignatures){
            throw "Name \"" + name + "\" is already being used to identify a JavaScript signature.";
        }

        if(this.signatureAlreadyExists('javascript', [pattern])){
            throw "LinkRippr is already searching for this JavaScript signature.";
        }

        this.javaScriptSignatures[name] = {
            "global":new RegExp(pattern, "g"),
            "sticky":new RegExp(pattern, "y"),
            "user_view":pattern,
            "default":false
        };
    }

    addCssSignature(name, selector, attribute, value){
        //regex
        if(name in this.cssSignatures){
            throw "Name \"" + name + "\" is already being used to identify a CSS signature"
        }

        if(this.signatureAlreadyExists('css', [selector, attribute, value])){
            throw "LinkRippr is already looking for this CSS signature.";
        }

        this.cssSignatures[name] = {
            'selector':new RegExp(selector, 'g'),
            'attribute':new RegExp(attribute, 'g'),
            'value':new RegExp(value, 'g'),
            'selector_user_view':selector,
            'attribute_user_view':attribute,
            'value_user_view':value
        };
    }

    removeSignature(name, type) {
        switch (type) {
            case 'javascript':
                delete this.javaScriptSignatures[name];
                break;
            case 'css':
                delete this.cssSignatures[name];
                break;
            case 'html':
                delete this.htmlSignatures[name];
        }
    }

    signatureAlreadyExists(type, signatures){
        if(type === 'css'){
            for(let key in this.cssSignatures){
                if(this.cssSignatures[key]['selector_user_view'] === signatures[0] &&
                this.cssSignatures[key]['attribute_user_view'] === signatures[1] &&
                this.cssSignatures[key]['value_user_view'] === signatures[2]){
                    return true;
                }
            }
        }else if(type === 'javascript'){
            for(let key in this.javaScriptSignatures){
                if(this.javaScriptSignatures[key]['user_view'] === signatures[0]){
                    return true;
                }
            }
        }else if(type === 'html'){
            for(let key in this.htmlSignatures){
                if(this.htmlSignatures[key]['element'] === signatures[0] &&
                this.htmlSignatures[key]['attributes'].join(",") === signatures[1] &&
                this.htmlSignatures[key]['value-user-view'] === signatures[2]){
                    return true;
                }
            }
        }
        return false;
    }


    getOption(option){
        return this.options[option];
    }

    setOption(option, value){
        this.options[option] = value;
    }

    processAttributes(attString){

        let hasNested = false;
        let attributes = [];
        let buffer = "";
        let nested = false;
        let errChars = ["]", ":"];

        //general check for bad characters
        attString = attString.toLowerCase();
        if(!(attString.match(new RegExp("^[,\\[\\]:a-z0-9\-\\*]+$")))){
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
                    buffer = "err";
                    break;
                }
                buffer += attString.charAt(i);
            }
        }

        //check for errors
        if(buffer !== ""){
            throw "Incorrect syntax for nested extraction";
        }

        //clean up attributes
        for(let idx in attributes){
            attributes[idx] = attributes[idx].replace(" ","");
        }
        return {"attributes":attributes, "hasNested":hasNested};
    }
}