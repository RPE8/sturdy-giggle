class Sturdy {
	constructor({ container, rowHeight, rowCount, cellRenderer, columns } = {}) {
		this.container = container;
		this.containerHeight = container.offsetHeight;
		this.rowHeight = rowHeight;
		this.rowCount = rowCount;

		this.totalRowsHeight = this.rowCount * this.rowHeight;

		this.rowsInViewport = Math.ceil(this.containerHeight / this.rowHeight);

		this.treshold = 2;

		this.tresholdPadding = this.treshold * this.rowHeight;

		this.cellRenderer = cellRenderer;
		this.columns = columns;

		this.currentLeft = 0;
		this.currentTop = 0;

		this.scrollTop = 0;
	}

	render() {
		const container = this.container;

		container.addEventListener("scroll", (event) => {
			console.log(event.target.scrollTop);
			this.scrollTop = event.target.scrollTop;
		});

		let html = "";
		let rowIndex = 0;
		let topForRow = this.currentTop;
		while (rowIndex < this.rowCount) {
			let leftForRow = this.currentLeft;

			this.columns.forEach((column, columnIndex) => {
				let inlineStyle = `max-width:${column.width}px ;left: ${leftForRow}${column.widthUnits}; top:${topForRow}px; position: absolute; display: flex; justify-content: center; align-items: center;`;
				html += this.cellRenderer({ rowIndex, columnIndex, column, inlineStyle });
				leftForRow += column.width;
			});
			topForRow += this.rowHeight;
			rowIndex++;
		}
		container.innerHTML += html;
	}

	renderColumn(column) {}

	renderRow(rowIndex) {}
}

export default Sturdy;
