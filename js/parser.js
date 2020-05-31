class DOMParser{
	constructor(tokenizer){
		this.tokenizer = tokenizer;
	}

	parse(){
		return parseDOM();
	}

	parseDOM(){
		//find the root element
		while(tokenizer.hasNext() && tokenizer.current.tokenType != DOMTokenType.TAG_NAME && tokenizer.current.value != "html"){
			tokenizer.next();
		}
		if(!tokenizer.hasNext()){
			return null;
		}else{
			let dom = new ElementExpression("html");
			tokenizer.next();
			while(tokenizer.hasNext()){
				if(tokenizer.current.tokenType == DOMTokenType.ATT_KEY){
					dom.attributes.push(parseAttribute());
				}else if(tokenizer.current.tokenType == DOMTokenType.TAG_NAME){
					if(tokenizer.current.value == "html"){
						break;
					}else{
						dom.children.push(parseElement());
					}
				}
			}
			return dom;
		}
	}

	parseElement(){
		//get the element name
		//check for attributes
		//check for content and subelements
		let element = new ElementExpression(tokenizer.current.value);
		if(getElementFeature(element.elementName, Features.IS_VOID)){
			//get attributes
			while(tokenizer.hasNext() && tokenizer.current.tokenType != DOMTokenType.DEFAULT_TAG_FINISH && tokenizer.current.tokenType != VOID_TAG_FINISH){
				tokenizer.next();
				if(tokenizer.current.tokenType == DOMTokenType.ATT_KEY){
					element.attributes.push(parseAttribute());
				}
			}
		}else{
			//get attributes, content and children
			while(tokenizer.hasNext()){
				tokenizer.next();
				if(tokenizer.current.tokenType == DOMTokenType.ATT_KEY){
					element.attributes.push(parseAttribute());
				}else if(tokenizer.current.tokenType == DOMTokenType.CONTENT){
					element.content = tokenizer.current.value;
				}else if(tokenizer.current.tokenType == DOMTokenType.TAG_NAME){
					if(tokenizer.current.value == element.elementName){
						break;
					}else{
						element.children.push(parseElement());
					}
				}
			}
		}
		return element;
	}

	parseAttribute(){
		let att_key = tokenizer.current.value;
		while(tokenizer.hasNext() && tokenizer.current.tokenType != DOMTokenType.ATT_VALUE){
			tokenizer.next();
		}
		let att_val = tokenizer.current.value;
		tokenizer.next();
		return new AttributeExpression(att_key, att_val);
	}
}

class ScriptParser{
	constructor(scriptTokenizer){
		this.scriptTokenizer = scriptTokenizer;
	}

	parseScript(){

	}

}
