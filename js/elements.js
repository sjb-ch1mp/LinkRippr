/*
* https://www.w3.org/TR/2011/WD-html-markup-20110405/syntax.html
* */

function getElementFeature(tag, feature){
    let features = getTag(tag);
    console.log("Features for " + tag + " are " + features);
    if(features != null){
        return features[feature];
    }else{
        return null;
    }
}

const Feature = {
    IS_VOID: 0,
    IS_DEPRECATED: 1
};

function getTag(tagName) {
    console.log("Getting features for " + tagName);
    switch(tagName){
       case "html":  return [false, false];
       case "base":  return [true, false];
       case "head":  return [false, false];
       case "link":  return [true, false];
       case "meta":  return [true, false];
       case "style":  return [false, false];
       case "title":  return [false, false];
       case "body":  return [false, false];
       case "address":  return [false, false];
       case "article":  return [false, false];
       case "aside":  return [false, false];
       case "footer":  return [false, false];
       case "header":  return [false, false];
       case "h1":  return [false, false];
       case "h2":  return [false, false];
       case "h3":  return [false, false];
       case "h4":  return [false, false];
       case "h5":  return [false, false];
       case "h6":  return [false, false];
       case "hgroup":  return [false, false];
       case "main":  return [false, false];
       case "nav":  return [false, false];
       case "section":  return [false, false];
       case "blockquote":  return [false, false];
       case "dd":  return [false, false];
       case "div":  return [false, false];
       case "dl":  return [false, false];
       case "dt":  return [false, false];
       case "figcaption":  return [false, false];
       case "figure":  return [false, false];
       case "hr":  return [true, false];
       case "li":  return [false, false];
       case "ol":  return [false, false];
       case "p":  return [false, false];
       case "pre":  return [false, false];
       case "ul":  return [false, false];
       case "a":  return [false, false];
       case "abbr":  return [false, false];
       case "b":  return [false, false];
       case "bdi":  return [false, false];
       case "bdo":  return [false, false];
       case "br":  return [true, false];
       case "cite":  return [false, false];
       case "code":  return [false, false];
       case "data":  return [false, false];
       case "dfn":  return [false, false];
       case "em":  return [false, false];
       case "i":  return [false, false];
       case "kbd":  return [false, false];
       case "mark":  return [false, false];
       case "q":  return [false, false];
       case "rb":  return [false, false];
       case "rp":  return [false, false];
       case "rt":  return [false, false];
       case "rtc":  return [false, false];
       case "ruby":  return [false, false];
       case "s":  return [false, false];
       case "samp":  return [false, false];
       case "small":  return [false, false];
       case "span":  return [false, false];
       case "strong":  return [false, false];
       case "sub":  return [false, false];
       case "sup":  return [false, false];
       case "time":  return [false, false];
       case "u":  return [false, false];
       case "var":  return [false, false];
       case "wbr":  return [true, false];
       case "area":  return [true, true];
       case "audio":  return [false, false];
       case "img":  return [true, false];
       case "map":  return [false, false];
       case "track":  return [true, false];
       case "video":  return [false, false];
       case "embed":  return [true, false];
       case "iframe":  return [false, false];
       case "object":  return [false, false];
       case "param":  return [true, false];
       case "source":  return [true, false];
       case "canvas":  return [false, false];
       case "noscript":  return [false, false];
       case "script":  return [false, false];
       case "del":  return [false, false];
       case "ins":  return [false, false];
       case "caption":  return [false, false];
       case "col":  return [true, false];
       case "colgroup":  return [false, false];
       case "table":  return [false, false];
       case "tbody":  return [false, false];
       case "td":  return [false, false];
       case "tfoot":  return [false, false];
       case "th":  return [false, false];
       case "thead":  return [false, false];
       case "tr":  return [false, false];
       case "button":  return [false, false];
       case "datalist":  return [false, false];
       case "fieldset":  return [false, false];
       case "form":  return [false, false];
       case "input":  return [true, false];
       case "label":  return [false, false];
       case "legend":  return [false, false];
       case "meter":  return [false, false];
       case "optgroup":  return [false, false];
       case "option":  return [false, false];
       case "output":  return [false, false];
       case "progress":  return [false, false];
       case "select":  return [false, false];
       case "textarea":  return [false, false];
       case "details":  return [false, false];
       case "dialog":  return [false, false];
       case "menu":  return [false, false];
       case "summary":  return [false, false];
       case "slot":  return [false, false];
       case "template":  return [false, false];
       case "acronym": return [false, true]; // All the following tags are deprecated
       case "applet": return [false, true];
       case "basefont": return [false, true];
       case "bgsound": return [false, true];
       case "big": return [false, true];
       case "blink": return [false, true];
       case "center": return [false, true];
       case "command": return [true, true];
       case "content": return [false, true];
       case "dir": return [false, true];
       case "element": return [false, true];
       case "font": return [false, true];
       case "frame": return [false, true];
       case "frameset": return [false, true];
       case "image": return [false, true];
       case "isindex": return [false, true];
       case "keygen": return [true, true];
       case "listing": return [false, true];
       case "marquee": return [false, true];
       case "menuitem": return [false, true];
       case "multicol": return [false, true];
       case "nextid": return [false, true];
       case "nobr": return [false, true];
       case "noembed": return [false, true];
       case "noframes": return [false, true];
       case "plaintext": return [false, true];
       case "shadow": return [false, true];
       case "spacer": return [false, true];
       case "strike": return [false, true];
       case "tt": return [false, true];
       case "xmp": return [false, true];
        default: return null;
    }
}
