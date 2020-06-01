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
    DEFAULT_TAG_FINISH: 'DEFAULT_TAG_FINISH', // >
    VOID_TAG_FINISH: 'VOID_TAG_FINISH', // />
    TAG_NAME: 'TAG_NAME',
    ATT_KEY: 'ATT_KEY',
    ATT_VALUE: 'ATT_VALUE',
    CONTENT: 'CONTENT',
    IGNORE_TAG: 'IGNORE_TAG',
    EQUALS: 'EQUALS',
    QUOTE: 'QUOTE'
};

const ScriptTokenType = {
    END_OF_STATEMENT: 'END_OF_STATEMENT', //;
    QUALIFIER: 'QUALIFIER', //.
    LEFT_PARENTHESIS: 'LEFT_PARENTHESIS', //(
    RIGHT_PARENTHESIS: 'RIGHT_PARENTHESIS', //)
    LEFT_BRACE: 'LEFT_BRACE', //{
    RIGHT_BRACE: 'RIGHT_BRACE', //}
    LEFT_BRACKET: 'LEFT_BRACKET', //[
    RIGHT_BRACKET: 'RIGHT_BRACKET', //]
    WORD: 'WORD',
    SINGLE_QUOTE: 'SINGLE_QUOTE', //'
    DOUBLE_QUOTE: 'DOUBLE_QUOTE', //"
    STRING: 'STRING',
    COMMA: 'COMMA', //',
    COLON: 'COLON', //:
    RESERVED_WORD: 'RESERVED_WORD', //isReserved()
    AND: 'AND', //&
    OR: 'OR', //|
    GREATER_THAN: 'GREATER_THAN', //>
    LESS_THAN: 'LESS_THEN', //<
    EQUAL: 'EQUAL', //=
    NOT: 'NOT', //!
    PLUS: 'PLUS', //+
    MINUS: 'MINUS', //-
    DIVIDE: 'DIVIDE', ///
    MULTIPLY: 'MULTIPLY', //*
    MODULUS: 'MODULUS', //%
    OTHER: 'OTHER' //anything else
};

function isReserved(scriptToken){
    let reservedWords =
        ['abstract','arguments','await','boolean',
        'break','byte','case','catch',
        'char','class','const','continue',
        'debugger','default','delete','do',
        'double','else','enum','eval',
        'export','extends','false','final',
        'finally','float','for','function',
        'goto','if','implements','import',
        'in','instanceof','int','interface',
        'let','long','native','new',
        'null','package','private','protected',
        'public','return','short','static',
        'super','switch','synchronized','this',
        'throw','throws','transient','true',
        'try','typeof','var','void',
        'volatile','while','with','yield'];
    return reservedWords.includes(scriptToken.value);
}
