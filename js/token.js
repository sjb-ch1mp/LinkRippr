class Token{
    constructor(tokenType, value){
        this.tokenType = tokenType;
        this.value = value;
    }
}

class DOMToken extends Token{
    constructor(DOMTokenType, value){
        super(DOMTokenType, value);
    }
}

class ScriptToken extends Token{
    constructor(scriptTokenType, value){
        super(scriptTokenType, value);
    }
}

const DOMTokenType = {
    OPEN_TAG_START: 'OPEN_TAG_START', // <
    CLOSE_TAG_START: 'CLOSE_TAG_START', // </
    TAG_FINISH: 'TAG_FINISH', // >
    OPEN_TAG_CLOSE: 'OPEN_TAG_CLOSE', // />
    TAG_NAME: 'TAG_NAME',
    ATT_KEY: 'ATT_KEY',
    ATT_VALUE: 'ATT_VALUE',
    CONTENT: 'CONTENT',
    IGNORE_TAG: 'IGNORE_TAG',
    EQUALS: 'EQUALS',
    QUOTE: 'QUOTE'
};

const ScriptTokenType = {
    //many many
};