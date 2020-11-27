function getDefaultHtmlSignatures(){
    return {
        "external-hyperlinks":{
            "element":"*",
            "attributes":["href","data-src","src"],
            "value":new RegExp("http(s)?:\\/\\/", "g"),
            "value-user-view":"http(s)?:\\/\\/",
            "hasNested":false
        },
        "all-iframes":{
            "element":"iframe",
            "attributes":["*"],
            "value":new RegExp(".*", "g"),
            "value-user-view":".*",
            "hasNested":false
        },
        "all-forms":{
            "element":"form",
            "attributes":["method","action","[input:name,type]"],
            "value":new RegExp(".*", "g"),
            "value-user-view":".*",
            "hasNested":true
        },
        "data-binds":{
            "element":"*",
            "attributes":["data-bind"],
            "value":new RegExp(".*", "g"),
            "value-user-view":".*",
            "hasNested":false,
        },
        "refresh":{
            "element":"meta",
            "attributes":["http-equiv"],
            "value":new RegExp("[rReEfFsShH]{7}", "g"),
            "value-user-view":"[rReEfFsShH]{7}",
            "hasNested":false
        }
    };
}

function getDefaultJavaScriptSignatures(){
    return {
        "document.write":{
            "global":new RegExp("document\\.write\\(.*\\)[;\s]", "g"),
            "sticky":new RegExp("document\\.write\\(.*\\)[;\s]", "y"),
            "user_view":"document\\.write\\(.*\\)[;\\s]",
            "default":true},
        "eval":{
            "global":new RegExp("eval\\(.*\\)[;\s]", "g"),
            "sticky":new RegExp("eval\\(.*\\)[;\s]", "y"),
            "user_view":"eval\\(.*\\)[;\\s]",
            "default":true},
        "atob":{
            "global":new RegExp("atob\\(.*\\)[;\s]", "g"),
            "sticky":new RegExp("atob\\(.*\\)[;\s]", "y"),
            "user_view":"atob\\(.*\\)[;\\s]",
            "default":true},
        "unescape":{
            "global":new RegExp("unescape\\(.*\\)[;\s]", "g"),
            "sticky":new RegExp("unescape\\(.*\\)[;\s]", "y"),
            "user_view":"unescape\\(.*\\)[;\\s]",
            "default":true},
        "url":{
            "global":new RegExp('http(s)?:\\/\\/[a-zA-Z\\-]+\\..*["\']', "g"),
            "sticky":new RegExp('http(s)?:\\/\\/[a-zA-Z\\-]+\\..*["\']', "y"),
            "user_view":"http(s)?:\\/\\/[a-zA-Z\\-]+\\..*[;\\s\"']",
            "default":true},
        "ip-4":{
            "global":new RegExp('(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[\'";\s]', "g"),
            "sticky":new RegExp('(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[\'";\s]', "y"),
            "user_view":'(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[\'";\s]',
            "default":true},
        "ajax-request":{
            "global":new RegExp("\\$\\.ajax\\(\\{.*type:\\s?['\"](POST|GET)['\"].*\\}\\)", "g"),
            "sticky":new RegExp("\\$\\.ajax\\(\\{.*type:\\s?['\"](POST|GET)['\"].*\\}\\)", "y"),
            "user_view":"\\$\\.ajax\\(\\{.*type:\\s?['\"](POST|GET)['\"].*\\}\\)",
            "default":true},
        "jquery-request":{
            "global":new RegExp("\\$\\.(post|get)\\(.*\\);", "g"),
            "sticky":new RegExp("\\$\\.(post|get)\\(.*\\);", "y"),
            "user_view":"\\$\\.(post|get)\\(.*\\);",
            "default":true},
        "xml-http-request":{
            "global":new RegExp("\\b[a-zA-Z_0-9]+\\.open\\(\\s?[\"']([pPoOsStT]{4}|[gGeEtT]{3})['\"].*http.*\\)[;\\s]", "g"),
            "sticky":new RegExp("\\b[a-zA-Z_0-9]+\\.open\\(\\s?[\"']([pPoOsStT]{4}|[gGeEtT]{3})['\"].*http.*\\)[;\\s]", "y"),
            "user_view":"\\b[a-zA-Z_0-9]+\\.open\\(\\s?[\"']([pPoOsStT]{4}|[gGeEtT]{3})['\"].*http.*\\)[;\\s]",
            "default":true}
    };
}

function getDefaultObfuscationSignatures(){
    return {
        'document-write-unescape':{
            'global':new RegExp('document\\.write\\(unescape\\(["\'].*["\']\\)\\)', 'g'),
            'sticky':new RegExp('document\\.write\\(unescape\\(["\'].*["\']\\)\\)', 'y'),
            'user_view':'document\\.write\\(unescape\\(("|\').*("|\')\\)\\)',
            'unwrap':new RegExp('(^document\\.write\\(unescape\\(["\']|["\']\\)\\)$)','g')
        },
        'document-write':{
            'global':new RegExp('document\\.write\\(["\'].*["\']\\)', 'g'),
            'sticky':new RegExp('document\\.write\\(["\'].*["\']\\)', 'y'),
            'user_view':'document\\.write\\("|\').*("|\'))',
            'unwrap':new RegExp('(^document\\.write\\(["\']|["\']\\)$)','g')
        }
    };
}

function getDefaultCssSignatures(){
    return {
        'external-resource':{
            'selector':new RegExp('.*', 'g'),
            'attribute':new RegExp('.*', 'g'),
            'value':new RegExp('url\\([\'"]http.*\\)', 'g'),
            'selector_user_view':'.*',
            'attribute_user_view':'.*',
            'value_user_view':'url\\([\'"]http.*\\)'
        }
    };
}