function getDefaultDomExtractions(){
    return {
        "base":{"attributes":["href"],"hasNested":false},
        "a":{"attributes":["href"],"hasNested":false},
        "iframe":{"attributes":["href","data-src","src"],"hasNested":false},
        "script":{"attributes":["src"],"hasNested":false},
        "form":{"attributes":["method", "action","data-bind","[input:name,type]"],"hasNested":true},
        "meta":{"attributes":["http-equiv"],"hasNested":false}
    };
}

function getDefaultScriptSignatures(){
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
            "global":new RegExp("new XMLHttpRequest\\(\\)", "g"),
            "sticky":new RegExp("new XMLHttpRequest\\(\\)", "y"),
            "user_view":"new XMLHttpRequest\\(\\)",
            "default":true}
    };
}

function getDefaultDeobfuscations(){
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