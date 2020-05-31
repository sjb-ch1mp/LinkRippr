class ElementExpression{
	constructor(elementName){
		this.elementName = elementName;
		this.attributes = [];
		this.children = [];
		this.content = "";
		this.hasContent = false;
	}

	print(){

		let tag = "<" + this.elementName + " ";

	    if(this.attributes.length > 0){
	    	for(let i=0; i<this.attributes.length; i++){
	    		tag += this.attributes[i].key + "=" + this.attributes[i].value + " ";
			}
		}

	    if(getElementFeature(this.elementName, Feature.IS_VOID)){
	    	tag += "is_void=true"
		}else{
	    	tag += "is_void=false ";
			if(this.hasContent){
				tag += "content_length=" + this.content.length + " ";
			}
			if(this.children.length > 0){
				tag += "children=[";
				for(let i=0; i<this.children.length; i++){
					tag += this.children[i].print() + ", "
				}
				tag = tag.substring(0, tag.length - 2) + "]";
			}
		}
	    return tag + ">";
    }
}

class AttributeExpression{
	constructor(key, value){
		this.key = key;
		this.value = value;
	}
}
