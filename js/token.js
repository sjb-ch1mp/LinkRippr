class Token{
    constructor(tokenType, value){
        this.tokenType = tokenType;
        this.value = value;
    }
}

const TokenType = {
    OPEN,
    CLOSE_START,
    CLOSE_END,
    TAG,
    ATT_KEY,
    ATT_VALUE,
    SCRIPT_BLOCK
};