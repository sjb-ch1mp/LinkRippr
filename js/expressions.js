class ElementExpression extends Expression{
	constructor(elementName){
		this.elementName = elementName;
		this.attributes = [];
		this.children = [];
		this.content = null;
	}
}

class AttributeExpression extends Expression{
	constructor(key, value){
		this.key = key;
		this.value = value;
	}
}
