class SturdyColumn {
	constructor({ dataAccessor, classAccessor, inlineStyleAccessor, attributesAccessor, renderer, key, width, widthUnits } = {}) {
		this.dataAccessor = dataAccessor;
		this.classAccessor = classAccessor;
		this.inlineStyleAccessor = inlineStyleAccessor;
		this.attributesAccessor = attributesAccessor;
		this.renderer = renderer;
		this.key = key;
		this._width = width;
		this._widthUnits = widthUnits;
	}

	get width() {
		return this._width;
	}

	set width(width) {
		this._width = width;
	}

	get widthUnits() {
		return this._widthUnits;
	}

	set widthUnits(widthUnits) {
		this._widthUnits = widthUnits;
	}
}

export default SturdyColumn;
