class SturdyColumn {
	constructor({ dataAccessor, classAccessor, inlineStyleAccessor, attributesAccessor, renderer, key } = {}) {
		this.dataAccessor = dataAccessor;
		this.classAccessor = classAccessor;
		this.inlineStyleAccessor = inlineStyleAccessor;
		this.attributesAccessor = attributesAccessor;
		this.renderer = renderer;
		this.key = key;
	}
}

export default SturdyColumn;
