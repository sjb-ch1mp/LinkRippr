class StyleParser{
    constructor(styleBlock){
        if(styleBlock.tokenType !== DOMTokenType.STYLE){
            throw "ScriptParser cannot parse content of DOMTokenType." + styleBlock.tokenType;
        }
        this.styleBlock = new StyleBlock(styleBlock);
        this.parseStyleBlock();
    }

    parseStyleBlock(styleBlock){

    }
}

class StyleBlock{
    constructor(styleBlock){
        this.ruleSets = this.breakIntoRuleSets(styleBlock);
    }

    breakIntoRuleSets(styleBlock){

    }
}

function areCssSignatureHits(styleBlocks){
    //FIXME
}