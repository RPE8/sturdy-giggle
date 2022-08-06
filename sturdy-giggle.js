class Sturdy {
	constructor({ container, rowHeight, rowCount, cellRenderer, columns } = {}) {
		this.container = container;
		this.containerHeight = container.offsetHeight;
		this.rowHeight = rowHeight;
		this.rowCount = rowCount;

		this.totalRowsHeight = this.rowCount * this.rowHeight;

		this.rowsInViewport = Math.floor(this.containerHeight / this.rowHeight);

		this.treshold = 0;

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
		// Previously called time of the function
		let prev = 0;
		return (...args) => {
			// Current called time of the function
			let now = new Date().getTime();

			// Logging the difference between previously
			// called and current called timings
			console.log(now - prev, delay);

			// If difference is greater than delay call
			// the function again.
			if (now - prev > delay) {
				prev = now;

				// "..." is the spread operator here
				// returning the function with the
				// array of arguments
				return func(...args);
			}
		};
	}

	render() {
		const container = this.container;
		container.style.height = this.rowHeight * this.rowCount + "px";
		// const throttledScroll = this.throttleFunction(, 170);
		container.parentNode.addEventListener("scroll", this.onScroll.bind(this));

		for (let i = 0; i < this.rowsInViewport + this.treshold; i++) {
			this.renderRow(i);
		}

		this.firstVisibleRowIndex = 0;
	}

	onScroll(event) {
		const newScroll = event.target.scrollTop;
		if (newScroll > this.scrollTop) {
			// console.log("Down");
			// requestAnimationFrame(() => {
			this.setScrollTop(newScroll);
			// });
		} else if (newScroll < this.scrollTop) {
			console.log("Up");
		}

		this.scrollTop = event.target.scrollTop;
	}

	calcRowNumberByScrollTop(scrollTop) {
		return Math.round(scrollTop / this.rowHeight);
	}

	setScrollTop(scrollTop) {
		const rowNumber = this.calcRowNumberByScrollTop(scrollTop);
		// console.log(rowNumber, this.firstVisibleRowIndex + this.rowsInViewport);
		if (rowNumber >= this.firstVisibleRowIndex + this.rowsInViewport) {
			console.groupCollapsed("full redraw");
			this.container.replaceChildren();
			const rowsUpTo = rowNumber + this.rowsInViewport - 1;
			console.log("rowsUpTo:", rowsUpTo);
			console.log("rowNumber", rowNumber);
			console.log("fisrtVisible", this.firstVisibleRowIndex);
			console.log("rowsInViewport", this.rowsInViewport);
			for (let i = rowNumber; i <= rowsUpTo; i++) {
				console.log(i);
				this.renderRow(i);
			}
			console.groupEnd("full redraw");
		} else {
			const diff = rowNumber - this.firstVisibleRowIndex;
			if (diff === 0) return;

			console.groupCollapsed("redraw");
			console.log("rowNumber", rowNumber);
			console.log("fisrtVisible", this.firstVisibleRowIndex);
			console.log("rowsInViewport", this.rowsInViewport);
			for (let i = 0; i < diff; i++) {
				for (let j = 0; j < this.columnsCount; j++) {
					this.container.firstChild.remove();
				}
				console.log(this.firstVisibleRowIndex + (this.rowsInViewport - 1) + i);
				this.renderRow(this.firstVisibleRowIndex + (this.rowsInViewport - 1) + i);
			}
			console.groupEnd("redraw");
		}
		this.firstVisibleRowIndex = rowNumber;
		this.scrollTop = scrollTop;
	}

	renderColumn(column) {}

	removeRow(rowIndex) {}

	renderRow(rowIndex) {
		if (rowIndex < 0 || rowIndex >= this.rowCount) {
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
