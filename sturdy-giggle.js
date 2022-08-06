class Sturdy {
	constructor({ parent, rowHeight, rowCount, cellRenderer, columns } = {}) {
		this.parent = parent;
		this.rowHeight = rowHeight;
		this.rowCount = rowCount;
		this.cellRenderer = cellRenderer;
		this.columns = columns;
	}

	render() {
		let html = "";
		let rowIndex = 0;
		while (rowIndex < this.rowCount) {
			this.columns.forEach((column, columnIndex) => {
				html += this.cellRenderer({ rowIndex, columnIndex, column });
			});
			rowIndex++;
		}
		console.log(html);
	}
}

export default Sturdy;
