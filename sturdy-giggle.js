class Sturdy {
	constructor({ parent, rowHeight, rowCount, cellRenderer, columns } = {}) {
		this.parent = parent;
		this.container = undefined;
		this.rowHeight = rowHeight;
		this.rowCount = rowCount;
		this.cellRenderer = cellRenderer;
		this.columns = columns;

		this.currentLeft = 0;
		this.currentTop = 0;
	}

	render() {
		const container = (this.container = document.createElement("div"));
		container.setAttribute("style", "position: relative; width:100%; height: 100%;");
		this.parent.append(container);
		let html = "";
		let rowIndex = 0;
		let topForRow = this.currentTop;
		while (rowIndex < this.rowCount) {
			let leftForRow = this.currentLeft;

			this.columns.forEach((column, columnIndex) => {
				let inlineStyle = `left: ${leftForRow}${column.widthUnits}; top:${topForRow}px; position: absolute; display: flex`;
				html += this.cellRenderer({ rowIndex, columnIndex, column, inlineStyle });
				leftForRow += column.width;
			});
			topForRow += this.rowHeight;
			rowIndex++;
		}
		container.innerHTML += html;
	}
}

export default Sturdy;
