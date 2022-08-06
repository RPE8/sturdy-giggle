// TODO: 	Add treshold
//  			Add rowHeightUnits

class Sturdy {
	constructor({ container, rowHeight, rowCount, cellRenderer, columns } = {}) {
		this.container = container;
		this.containerHeight = container.offsetHeight;
		this.rowHeight = rowHeight;
		this.rowCount = rowCount;

		this.totalRowsHeight = this.rowCount * this.rowHeight;

		this.treshold = 0;

		this.rowsInViewport = Math.floor(this.containerHeight / this.rowHeight);

		this.tresholdPadding = this.treshold * this.rowHeight;

		this.cellRenderer = cellRenderer;
		this.columns = columns;
		this.columnsCount = this.columns.length;

		this.currentLeft = 0;
		this.currentTop = 0;

		this.firstVisibleRowIndex = 0;

		this.scrollTop = 0;
	}

	throttleFunction(func, delay) {
		let prev = 0;
		return (...args) => {
			let now = new Date().getTime();
			if (now - prev > delay) {
				prev = now;
				return func(...args);
			} else {
				console.log("t");
			}
		};
	}

	render() {
		const container = this.container;
		container.style.height = this.rowHeight * this.rowCount + "px";
		// const throttledScroll = this.throttleFunction(, 170);
		const throttledScroll = this.throttleFunction(this.onScroll.bind(this), 0);
		container.parentNode.addEventListener("scroll", throttledScroll);

		for (let i = 0; i < this.rowsInViewport + this.treshold; i++) {
			this.renderRow(i);
		}

		this.firstVisibleRowIndex = 0;
	}

	onScroll(event) {
		const newTopScroll = event.target.scrollTop;
		if (newTopScroll !== this.scrollTop) {
			this.setScrollTop(newTopScroll);
			return;
		}

		const newLeftScroll = event.target.scrollLeft;
		if (newLeftScroll !== this.scrollTop) {
			console.log("Left");
			return;
		}
	}

	calcRowNumberByScrollTop(scrollTop) {
		return Math.round(scrollTop / this.rowHeight);
	}

	setScrollTop(scrollTop) {
		const rowNumber = this.calcRowNumberByScrollTop(scrollTop);
		// console.log(rowNumber, this.firstVisibleRowIndex + this.rowsInViewport);
		if (
			rowNumber >= this.firstVisibleRowIndex + this.rowsInViewport ||
			rowNumber <= this.firstVisibleRowIndex - this.rowsInViewport
		) {
			this.container.replaceChildren();
			const rowsUpTo = rowNumber + this.rowsInViewport;
			for (let i = rowNumber; i < rowsUpTo; i++) {
				this.renderRow(i);
			}
		} else if (rowNumber > this.firstVisibleRowIndex) {
			const diff = rowNumber - this.firstVisibleRowIndex;
			if (diff === 0) return;
			for (let i = 0; i < diff; i++) {
				for (let j = 0; j < this.columnsCount; j++) {
					this.container.firstChild.remove();
				}
				this.renderRow(this.firstVisibleRowIndex + this.rowsInViewport + i);
			}
		} else if (rowNumber < this.firstVisibleRowIndex) {
			const diff = Math.abs(this.firstVisibleRowIndex - rowNumber);
			for (let i = 0; i < diff; i++) {
				for (let j = 0; j < this.columnsCount; j++) {
					this.container.lastChild.remove();
				}

				this.renderRow(rowNumber + i, false);
			}
		}
		this.firstVisibleRowIndex = rowNumber;
		this.scrollTop = scrollTop;
	}

	renderColumn(column) {}

	removeRow(rowIndex) {}

	// bLast - last element in Dom or first
	renderRow(rowIndex, bLast = true) {
		if (rowIndex < 0 || rowIndex >= this.rowCount) {
			return;
		}
		const columns = this.columns;
		let leftPadding = this.currentLeft;
		let topPadding = this.rowHeight * rowIndex;
		let row = [];
		columns.forEach((column, columnIndex) => {
			let inlineStyle = `height:${this.rowHeight}px;max-width:${column.width}px ;left: ${leftPadding}${column.widthUnits}; top:${topPadding}px; position: absolute; display: flex; justify-content: center; align-items: center;`;
			row.push(this.cellRenderer({ rowIndex, columnIndex, column, inlineStyle }));
			leftPadding += column.width;
		});
		if (bLast) {
			this.container.append(...row);
		} else {
			this.container.prepend(...row);
		}
	}
}

export default Sturdy;
