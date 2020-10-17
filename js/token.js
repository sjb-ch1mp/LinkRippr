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

const DOMTokenType = {
    OPEN_TAG_START: 'OPEN_TAG_START', // <
    CLOSE_TAG_START: 'CLOSE_TAG_START', // </
    DEFAULT_TAG_FINISH: 'DEFAULT_TAG_FINISH', // >
    VOID_TAG_FINISH: 'VOID_TAG_FINISH', // />
    OPEN_TAG_NAME: 'OPEN_TAG_NAME',
    CLOSE_TAG_NAME: 'CLOSE_TAG_NAME',
    BOOL_ATT: 'BOOL_ATT',
    ATT_KEY: 'ATT_KEY',
    ATT_VALUE: 'ATT_VALUE',
    CONTENT: 'CONTENT',
    SCRIPT: 'SCRIPT',
    IGNORE: 'IGNORE',
    IGNORE_TAG: 'IGNORE_TAG',
    EQUALS: 'EQUALS',
    QUOTE: 'QUOTE'
};