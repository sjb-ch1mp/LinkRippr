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
    DOUBLE_AND: 'DOUBLE_AND',
    OR: 'OR', //|
    DOUBLE_OR: 'DOUBLE_OR',
    GREATER_THAN: 'GREATER_THAN', //>
    GREATER_THAN_EQUAL_TO: 'GREATER_THAN_EQUAL_TO',
    LESS_THAN: 'LESS_THEN', //<
    LESS_THAN_EQUAL_TO: 'LESS_THAN_EQUAL_TO',
    EQUAL: 'EQUAL', //=
    DOUBLE_EQUAL: 'DOUBLE_EQUAL',
    TRIPLE_EQUAL: 'TRIPLE_EQUAL',
    NOT: 'NOT', //!
    NOT_EQUAL: 'NOT_EQUAL',
    NOT_DOUBLE_EQUAL: 'NOT_DOUBLE_EQUAL',
    PLUS: 'PLUS', //+
    INCREMENT: 'INCREMENT', //++
    PLUS_EQUAL: 'PLUS_EQUAL', //+=
    MINUS: 'MINUS', //-
    DECREMENT: 'DECREMENT', //--
    MINUS_EQUAL: 'MINUS_EQUAL',
    DIVIDE: 'DIVIDE', ///
    DIVIDE_EQUAL: 'DIVIDE_EQUAL',
    MULTIPLY: 'MULTIPLY', //*
    MULTIPLY_EQUAL: 'MULTIPLY_EQUAL',
    MODULUS: 'MODULUS', //%
    MODULUS_EQUAL: 'MODULUS_EQUAL',
    SINGLE_LINE_COMMENT_START: 'SINGLE_LINE_COMMENT_START',
    COMMENT: 'COMMENT',
    MULTI_LINE_COMMENT_START: 'MULTI_LINE_COMMENT_START',
    MULTI_LINE_COMMENT_END: 'MULTI_LINE_COMMENT_END',
    INTEGER: 'INTEGER',
    TERNARY: 'TERNARY',
    BITWISE_NOT: 'BITWISE_NOT',
    BITWISE_XOR: 'BITWISE_XOR',
    LEFT_SHIFT: 'LEFT_SHIFT',
    RIGHT_SHIFT: 'RIGHT_SHIFT',
    EMPTY_STRING_SINGLE_QUOTE: 'EMPTY_STRING_SINGLE_QUOTE',
    EMPTY_STRING_DOUBLE_QUOTE: 'EMPTY_STRING_DOUBLE_QUOTE',
    SPACE_DOUBLE_QUOTE: 'SPACE_DOUBLE_QUOTE',
    SPACE_SINGLE_QUOTE: 'SPACE_SINGLE_QUOTE',
    OTHER: 'OTHER' //anything else
};

function isReserved(word){
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
    return reservedWords.includes(word);
}
