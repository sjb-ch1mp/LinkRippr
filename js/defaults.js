function getDefaultSettings(){
    let defaults = {

        //==== DEFAULT SETTINGS ====
        //These are the default settings for LinkRippr.
        //You can change the behaviour of LinkRippr by modifying this dictionary.
        //LinkRippr will load this dictionary on start up.

        //== USER SETTINGS ==
        "debugTokenizer":false,     //Debug mode: LinkRippr will dump tokens from the tokenizer
        "truncate":false,           //LinkRippr will truncate any detection greater than 100 characters to 97 characters + "..."
        "simpleDeob":true,          //LinkRippr will attempt to deobfuscate simple obfuscation techniques
        "extractDomains":true,      //LinkRippr will extract all unique domains from detections
        "conditionalComments":true, //LinkRippr will detect conditional comments
        "includeDOM":true,          //LinkRippr will dump the entire HTML document to the results summary
        "includeJS":true,           //LinkRippr will dump all script blocks to the results summary after splitting into statements

        // == HTML SIGNATURES ==
        //These are the default HTML signatures that LinkRippr will search for. Each HTML signature requires a unique key, and an 'element', 'attributes' and 'value' field.
        "htmlSignatures":{
            "base":{
                "element":"base",
                "attributes":["*"],
                "value":".*"
            },
            "external-hyperlinks":{
                "element":"*",
                "attributes":["href","data-src","src"],
                "value":"http(s)?:\\/\\/"
            },
            "all-iframes":{
                "element":"iframe",
                "attributes":["*"],
                "value":".*"
            },
            "all-forms":{
                "element":"form",
                "attributes":["method","action","[input:name,type]"],
                "value":".*"
            },
            "data-binds":{
                "element":"*",
                "attributes":["data-bind"],
                "value":".*"
            },
            "refresh":{
                "element":"meta",
                "attributes":["http-equiv"],
                "value":"[rR][eE][fF][rR][eE][sS][hH]"
            },
            "onclick":{
                "element":"*",
                "attributes":["onclick"],
                "value":".*"
            }
        },

        //== JAVASCRIPT SIGNATURES ==
        //These are the default JavaScript signatures that LinkRippr will search for. Each JavaScript signature requires a unique key and a unique regex value.
        "jsSignatures":{
            "document.write":"document\\.write\\(.*\\)[;\\s]",
            "eval":"eval\\(.*\\)[;\\s]",
            "atob":"atob\\(.*\\)[;\\s]",
            "unescape":"unescape\\(.*\\)[;\\s]",
            "url":"http(s)?[\\W3A2F]{3,9}[a-zA-Z0-9\\-]+\\..*[\"';\\s\\)\\(]",
            "ip-4":"(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)['\";\\s]",
            "ajax-request":"\\$\\.ajax\\(\\{.*type:\\s?['\"]([pPoOsStT]{4}|[gGeEtT]{3})['\"].*\\}\\)",
            "jquery-request":"\\$\\.([pPoOsStT]{4}|[gGeEtT]{3})\\(.*\\);",
            "xml-http-request":"\\b[^\\s]+\\.open\\(\\s?[\"']([pPoOsStT]{4}|[gGeEtT]{3})['\"].*\\)[;\\s]",
            "browser-redirection":"location\\.(replace\\(.*\\)[;\\s]|href\\s?=.*;)",
            "url-variable-declaration":"(let|var)\\s[a-zA-Z0-9\\-_]*[uU][rR][lL][a-zA-Z0-9\\-_]*\\s?=\\s?[^;]+[;\\s]",
            "fetch-api":"(\\s+|^)fetch\\(.*\\);"
        },

        //== CSS SIGNATURES ==
        //These are the default CSS signatures that LinkRippr will search for. Each CSS signature requires a unique key and a 'selector', 'property' and 'value' field.
        "cssSignatures":{
            "external-resource":{
                "selector":".*",
                "property":".*",
                "value":"url\\(['\"]http.*\\)"
            }
        }
    };

    return JSON.stringify(defaults);
}