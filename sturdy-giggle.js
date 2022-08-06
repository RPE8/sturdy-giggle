class Sturdy {
	constructor({ container, rowHeight, rowCount, cellRenderer, columns } = {}) {
		this.container = container;
		this.containerHeight = container.offsetHeight;
		this.rowHeight = rowHeight;
		this.rowCount = rowCount;

		this.totalRowsHeight = this.rowCount * this.rowHeight;

		this.rowsInViewport = Math.floor(this.containerHeight / this.rowHeight);

		this.treshold = 2;

		this.tresholdPadding = this.treshold * this.rowHeight;

		this.cellRenderer = cellRenderer;
		this.columns = columns;

		this.currentLeft = 0;
		this.currentTop = 0;

		this.firstVisibleRowIndex = 0;

		this.scrollTop = 0;
	}

	render() {
		const container = this.container;
		container.style.height = this.rowHeight * this.rowCount + "px";

		container.parentNode.addEventListener("scroll", (event) => {
			console.log(event.target.scrollTop);
			this.scrollTop = event.target.scrollTop;

			const rowNumber = Math.floor(this.scrollTop / this.rowHeight);
			if (rowNumber > this.firstVisibleRowIndex) {
				this.firstVisibleRowIndex = rowNumber;
				this.renderRow(rowNumber + this.rowsInViewport + 1);
			}
		});

		for (let i = 0; i < this.rowsInViewport + this.treshold; i++) {
			this.renderRow(i);
		}

		this.firstVisibleRowIndex = 0;

		// let html = "";
		// let rowIndex = 0;

		// while (rowIndex < this.rowCount) {
		// 	this.columns.forEach((column, columnIndex) => {});
		// 	topForRow += this.rowHeight;
		// 	rowIndex++;
		// }
		// container.innerHTML += html;
	}

	renderColumn(column) {}

	renderRow(rowIndex) {
		if (rowIndex < 0 || rowIndex > this.rowCount) {
			return;
		}
		const columns = this.columns;
		let leftPadding = this.currentLeft;
		let topPadding = this.rowHeight * rowIndex;
		let row = [];
		columns.forEach((column, columnIndex) => {
			let inlineStyle = `max-width:${column.width}px ;left: ${leftPadding}${column.widthUnits}; top:${topPadding}px; position: absolute; display: flex; justify-content: center; align-items: center;`;
			row.push(this.cellRenderer({ rowIndex, columnIndex, column, inlineStyle }));
			leftPadding += column.width;
		});
		this.container.append(...row);
	}
}

export default Sturdy;
