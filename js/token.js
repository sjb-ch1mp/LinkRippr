class DOMToken{
    constructor(domTokenType, value){
        this.domTokenType = domTokenType;
        this.value = value;
    }
}

class ScriptToken{
    constructor()
}

const DOMTokenType = {
    OPEN,
    CLOSE_START,
    CLOSE_END,
    TAG,
    ATT_KEY,
    ATT_VALUE,
    SCRIPT_BLOCK
};

const ScriptToken = {
    //many many
};