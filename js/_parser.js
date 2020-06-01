/* === RETIRED ===

class Parser{
	constructor(tokenizer){
		this.tokenizer = tokenizer;
	}
}

class DOMParser extends Parser{

	constructor(tokenizer){
		super(tokenizer);
	}

	parseDOM(){

		//find the root element
		while(this.tokenizer.hasNext()){
			if(this.tokenizer.current.tokenType === DOMTokenType.TAG_NAME && this.tokenizer.current.value === "html"){
				break;
			}else{
				this.tokenizer.next();
			}
		}

		if(!this.tokenizer.hasNext()){ //check whether the document has a <html> tag
			return null; //if not - return null
		}else{
			let dom = new ElementExpression("html");
			while(this.tokenizer.hasNext()){
				this.tokenizer.next();
				if(this.tokenizer.current.tokenType === DOMTokenType.ATT_KEY){
					dom.attributes.push(this.parseAttribute());
				}else if(this.tokenizer.current.tokenType === DOMTokenType.TAG_NAME){
					if(this.tokenizer.current.value === "html"){
						break;
					}else{
						dom.children.push(this.parseElement());
					}
				}
			}
			return dom;
		}
	}

	parseElement(){
		//get the element name
		//check for attributes
		//check for content and sub-elements
		let element = new ElementExpression(this.tokenizer.current.value);
		if(getElementFeature(element.elementName, Feature.IS_VOID)){
			//get attributes
			while(this.tokenizer.hasNext() && this.tokenizer.current.tokenType !== DOMTokenType.DEFAULT_TAG_FINISH && this.tokenizer.current.tokenType !== DOMTokenType.VOID_TAG_FINISH){
				this.tokenizer.next();
				if(this.tokenizer.current.tokenType === DOMTokenType.ATT_KEY){
					element.attributes.push(this.parseAttribute());
				}
			}
		}else{
			//get attributes, content and children
			while(this.tokenizer.hasNext()){
				this.tokenizer.next();
				if(this.tokenizer.current.tokenType === DOMTokenType.ATT_KEY){
					element.attributes.push(this.parseAttribute());
				}else if(this.tokenizer.current.tokenType === DOMTokenType.CONTENT){
					element.hasContent = true;
					element.content += this.tokenizer.current.value;
				}else if(this.tokenizer.current.tokenType === DOMTokenType.TAG_NAME){
					if(this.tokenizer.current.value === element.elementName){
						break;
					}else{
						let child = this.parseElement();
						if(getElementFeature(child.elementName, Feature.IS_INLINE_TEXT_SEMANTIC)){
							this.content += child.content;
						}
						element.children.push(child);
					}
				}
			}
		}
		return element;
	}

	parseAttribute(){
		let att_key = this.tokenizer.current.value;
		while(this.tokenizer.hasNext() && this.tokenizer.current.tokenType !== DOMTokenType.ATT_VALUE){
			this.tokenizer.next();
		}
		return new AttributeExpression(att_key, this.tokenizer.current.value);
	}
}

class ScriptParser extends Parser{

	constructor(tokenizer){
		super(tokenizer);
	}

	parseScript(){}
}
*/