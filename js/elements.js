/*
* https://www.w3.org/TR/2011/WD-html-markup-20110405/syntax.html
* */

function getElementFeature(tag, feature){
    let features = getTag(tag);
    if(features != null){
        return features[feature];
    }else{
        return null;
    }
}

const Feature = {
    IS_VOID: 0,
    IS_DEPRECATED: 1,
    IS_INLINE_TEXT_SEMANTIC: 2
};

function getTag(tagName) {
    switch(tagName){
       case "html":  return [false, false, false]; //Main root <
       case "base":  return [true, false, false]; //Document metadata \/
       case "head":  return [false, false, false];
       case "link":  return [true, false, false];
       case "meta":  return [true, false, false];
       case "style":  return [false, false, false];
       case "title":  return [false, false, false];
       case "body":  return [false, false, false]; //Sectioning root <
       case "address":  return [false, false, false]; //Content sectioning \/
       case "article":  return [false, false, false];
       case "aside":  return [false, false, false];
       case "footer":  return [false, false, false];
       case "header":  return [false, false, false];
       case "h1":  return [false, false, false];
       case "h2":  return [false, false, false];
       case "h3":  return [false, false, false];
       case "h4":  return [false, false, false];
       case "h5":  return [false, false, false];
       case "h6":  return [false, false, false];
       case "hgroup":  return [false, false, false];
       case "main":  return [false, false, false];
       case "nav":  return [false, false, false];
       case "section":  return [false, false, false];
       case "blockquote":  return [false, false, false]; //Text content \/
       case "dd":  return [false, false, false];
       case "div":  return [false, false, false];
       case "dl":  return [false, false, false];
       case "dt":  return [false, false, false];
       case "figcaption":  return [false, false, false];
       case "figure":  return [false, false, false];
       case "hr":  return [true, false, false];
       case "li":  return [false, false, false];
       case "ol":  return [false, false, false];
       case "p":  return [false, false, false];
       case "pre":  return [false, false, false];
       case "ul":  return [false, false, false];
       case "a":  return [false, false, true]; //Inline text semantics \/
       case "abbr":  return [false, false, true];
       case "b":  return [false, false, true];
       case "bdi":  return [false, false, true];
       case "bdo":  return [false, false, true];
       case "br":  return [true, false, true];
       case "cite":  return [false, false, true];
       case "code":  return [false, false, true];
       case "data":  return [false, false, true];
       case "dfn":  return [false, false, true];
       case "em":  return [false, false, true];
       case "i":  return [false, false, true];
       case "kbd":  return [false, false, true];
       case "mark":  return [false, false, true];
       case "q":  return [false, false, true];
       case "rb":  return [false, false, true];
       case "rp":  return [false, false, true];
       case "rt":  return [false, false, true];
       case "rtc":  return [false, false, true];
       case "ruby":  return [false, false, true];
       case "s":  return [false, false, true];
       case "samp":  return [false, false, true];
       case "small":  return [false, false, true];
       case "span":  return [false, false, true];
       case "strong":  return [false, false, true];
       case "sub":  return [false, false, true];
       case "sup":  return [false, false, true];
       case "time":  return [false, false, true];
       case "u":  return [false, false, true];
       case "var":  return [false, false, true];
       case "wbr":  return [true, false, true];
       case "area":  return [true, true, false]; //Image and multimedia \/
       case "audio":  return [false, false, false];
       case "img":  return [true, false, false];
       case "map":  return [false, false, false];
       case "track":  return [true, false, false];
       case "video":  return [false, false, false];
       case "embed":  return [true, false, false]; // Embedded content \/
       case "iframe":  return [false, false, false];
       case "object":  return [false, false, false];
       case "param":  return [true, false, false];
       case "source":  return [true, false, false];
       case "canvas":  return [false, false, false]; //scripting \/
       case "noscript":  return [false, false, false];
       case "script":  return [false, false, false];
       case "del":  return [false, false, false]; //Demarcating edits \/
       case "ins":  return [false, false, false];
       case "caption":  return [false, false, false]; //Table content \/
       case "col":  return [true, false, false];
       case "colgroup":  return [false, false, false];
       case "table":  return [false, false, false];
       case "tbody":  return [false, false, false];
       case "td":  return [false, false, false];
       case "tfoot":  return [false, false, false];
       case "th":  return [false, false, false];
       case "thead":  return [false, false, false];
       case "tr":  return [false, false, false];
       case "button":  return [false, false, false]; //Forms \/
       case "datalist":  return [false, false, false];
       case "fieldset":  return [false, false, false];
       case "form":  return [false, false, false];
       case "input":  return [true, false, false];
       case "label":  return [false, false, false];
       case "legend":  return [false, false, false];
       case "meter":  return [false, false, false];
       case "optgroup":  return [false, false, false];
       case "option":  return [false, false, false];
       case "output":  return [false, false, false];
       case "progress":  return [false, false, false];
       case "select":  return [false, false, false];
       case "textarea":  return [false, false, false];
       case "details":  return [false, false, false]; //Interactive elements \/
       case "dialog":  return [false, false, false];
       case "menu":  return [false, false, false];
       case "summary":  return [false, false, false];
       case "slot":  return [false, false, false]; //Web components \/
       case "template":  return [false, false, false];
       case "acronym": return [false, true, false]; // Obsolete and deprecated elements \/
       case "applet": return [false, true, false];
       case "basefont": return [false, true, false];
       case "bgsound": return [false, true, false];
       case "big": return [false, true, false];
       case "blink": return [false, true, false];
       case "center": return [false, true, false];
       case "command": return [true, true, false];
       case "content": return [false, true, false];
       case "dir": return [false, true, false];
       case "element": return [false, true, false];
       case "font": return [false, true, false];
       case "frame": return [false, true, false];
       case "frameset": return [false, true, false];
       case "image": return [false, true, false];
       case "isindex": return [false, true, false];
       case "keygen": return [true, true, false];
       case "listing": return [false, true, false];
       case "marquee": return [false, true, false];
       case "menuitem": return [false, true, false];
       case "multicol": return [false, true, false];
       case "nextid": return [false, true, false];
       case "nobr": return [false, true, false];
       case "noembed": return [false, true, false];
       case "noframes": return [false, true, false];
       case "plaintext": return [false, true, false];
       case "shadow": return [false, true, false];
       case "spacer": return [false, true, false];
       case "strike": return [false, true, false];
       case "tt": return [false, true, false];
       case "xmp": return [false, true, false];
        default: return null;
    }
}
