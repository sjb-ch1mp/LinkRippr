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
            "global":new RegExp("document\\.write\\(.*\\)(;|\\s|\\n)", "g"),
            "sticky":new RegExp("document\\.write\\(.*\\)(;|\\s|\\n)", "y"),
            "user_view":"document\\.write\\(.*\\)(;|\\s|\\n)",
            "default":true},
        "eval":{
            "global":new RegExp("eval\\(.*\\)(;|\\s|\\n)", "g"),
            "sticky":new RegExp("eval\\(.*\\)(;|\\s|\\n)", "y"),
            "user_view":"eval\\(.*\\)(;|\\s|\\n)",
            "default":true},
        "atob":{
            "global":new RegExp("atob\\(.*\\)(;|\\s|\\n)", "g"),
            "sticky":new RegExp("atob\\(.*\\)(;|\\s|\\n)", "y"),
            "user_view":"atob\\(.*\\)(;|\\s|\\n)",
            "default":true},
        "unescape":{
            "global":new RegExp("unescape\\(.*\\)(;|\\s|\\n)", "g"),
            "sticky":new RegExp("unescape\\(.*\\)(;|\\s|\\n)", "y"),
            "user_view":"unescape\\(.*\\)(;|\\s|\\n)",
            "default":true},
        "simple-url":{
            "global":new RegExp('http(s)?:\\/\\/[a-zA-Z\\-]+\\..*(;|\\s|"|\')', "g"),
            "sticky":new RegExp('http(s)?:\\/\\/[a-zA-Z\\-]+\\..*(;|\\s|"|\')', "y"),
            "user_view":"http(s)?:\\/\\/[a-zA-Z\\-]+\\..*(;|\\s|\"|')",
            "default":true},
        "ip-4":{
            "global":new RegExp('[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}', "g"),
            "sticky":new RegExp('[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}', "y"),
            "user_view":'[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}',
            "default":true},
        "ajax-request":{
            "global":new RegExp("\\$\\.ajax\\(\\{.*type:\\s?(\\'|\")(POST|GET)(\\'|\").*\\}\\)", "g"),
            "sticky":new RegExp("\\$\\.ajax\\(\\{.*type:\\s?(\\'|\")(POST|GET)(\\'|\").*\\}\\)", "y"),
            "user_view":"\\$\\.ajax\\(\\{.*type:\\s?(\\'|\")(POST|GET)(\\'|\").*\\}\\)",
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
            'global':new RegExp('document\\.write\\(unescape\\(("|\').*("|\')\\)\\)', 'g'),
            'sticky':new RegExp('document\\.write\\(unescape\\(("|\').*("|\')\\)\\)', 'y'),
            'user_view':'document\\.write\\(unescape\\(("|\').*("|\')\\)\\)',
            'unwrap':new RegExp('(^document\\.write\\(unescape\\(("|\')|("|\')\\)\\)$)','g')
        },
        'document-write':{
            'global':new RegExp('document\\.write\\(("|\').*("|\')\\)', 'g'),
            'sticky':new RegExp('document\\.write\\(("|\').*("|\')\\)', 'y'),
            'user_view':'document\\.write\\("|\').*("|\'))',
            'unwrap':new RegExp('(^document\\.write\\(("|\')|("|\')\\)$)','g')
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