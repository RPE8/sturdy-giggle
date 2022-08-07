// TODO: 	Add treshold
//  			Add rowHeightUnits

class Sturdy {
	constructor({ container, rowHeight, rowCount, columnsCount, cellRenderer, columns } = {}) {
		this.container = container;
		this.containerHeight = container.offsetHeight;
		this.containerWidth = container.offsetWidth;
		this.rowHeight = rowHeight;
		this.rowCount = rowCount;

		this.totalRowsHeight = this.rowCount * this.rowHeight;

		this.treshold = 0;
		this.rowsTreshold = 0;
		this.columnsTreshold = 0;

		this.rowsInViewport = Math.floor(this.containerHeight / this.rowHeight);

		this.tresholdPadding = this.treshold * this.rowHeight;

		this.cellRenderer = cellRenderer;
		this.columns = columns;
		this.columnsCount = this.columns.length;

		this.currentLeft = 0;
		this.currentTop = 0;

		this.firstVisibleRowIndex = 0;

		this.cellsMap = new Map();

		this.scrollTop = 0;
	}

	throttleFunction(func, ms) {
		let isThrottled = false,
			savedArgs,
			savedThis;

		function wrapper(...args) {
			if (isThrottled) {
				savedArgs = args;
				savedThis = this;
				return;
			}

			func.apply(this, args);

			isThrottled = true;

			setTimeout(function () {
				isThrottled = false;
				if (savedArgs) {
					wrapper.apply(savedThis, savedArgs);
					savedArgs = savedThis = null;
				}
			}, ms);
		}

		return wrapper;
	}

	render() {
		const container = this.container;
		container.style.height = this.rowHeight * this.rowCount + "px";
		container.style.width =
			this.columns.reduce((width, column) => {
				width += column.width;
				return width;
			}, 0) + "px";

		const columnsToRender = [];
		let freeWidth = this.containerWidth;
		for (let i = 0; i < this.columns.length; i++) {
			if (freeWidth > 0) {
				columnsToRender.push(this.columns[i]);
				freeWidth -= this.columns[i].width;
			} else {
				break;
			}
		}

		// const throttledScroll = this.throttleFunction(, 170);
		const throttledScroll = this.throttleFunction(this.onScroll.bind(this), 17);
		container.parentNode.addEventListener("scroll", throttledScroll);
		this.cellsMap = new Map();
		for (let i = 0; i < this.rowsInViewport + this.treshold; i++) {
			const rendered = this.renderRow(i, columnsToRender);

			this.cellsMap.set(i, rendered.row);
		}

		console.table(this.cellsMap);
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

	_fullRedrawOnScrollTop(rowNumber) {
		this.cellsMap = new Map();
		this.container.replaceChildren();
		const rowsUpTo = rowNumber + this.rowsInViewport;
		for (let i = rowNumber; i < rowsUpTo; i++) {
			const rendered = this.renderRow(i);
			this.cellsMap.set(i, rendered.row);
		}
	}

	_partialRedrawOnScrollTopDown(rowNumber) {
		const diff = rowNumber - this.firstVisibleRowIndex;
		if (diff === 0) return;
		for (let i = 0; i < diff; i++) {
			const lastRowIndex2BeRemoved = this.firstVisibleRowIndex + i;
			const newRowIndex = this.firstVisibleRowIndex + this.rowsInViewport + i;
			if (this.cellsMap.has(lastRowIndex2BeRemoved)) {
				const rows = this.cellsMap.get(lastRowIndex2BeRemoved);
				rows.forEach((elem) => elem.remove());
				this.cellsMap.delete(lastRowIndex2BeRemoved);
			}
			const rendered = this.renderRow(newRowIndex);
			this.cellsMap.set(newRowIndex, rendered.row);
		}
	}

	_partialRedrawOnScrollTopUp(rowNumber) {
		const diff = Math.abs(this.firstVisibleRowIndex - rowNumber);
		if (diff === 0) return;
		const lastRowIndex = this.firstVisibleRowIndex + this.rowsInViewport - 1;
		for (let i = 0; i < diff; i++) {
			const lastRowIndex2BeRemoved = lastRowIndex - i;
			const newRowIndex = rowNumber + i;
			if (this.cellsMap.has(lastRowIndex2BeRemoved)) {
				const rows = this.cellsMap.get(lastRowIndex2BeRemoved);
				rows.forEach((elem) => elem.remove());
				this.cellsMap.delete(lastRowIndex2BeRemoved);
			}
			const rendered = this.renderRow(newRowIndex);
			this.cellsMap.set(newRowIndex, rendered.row);
		}
	}

	setScrollTop(scrollTop) {
		const rowNumber = this.calcRowNumberByScrollTop(scrollTop);
		if (
			rowNumber >= this.firstVisibleRowIndex + this.rowsInViewport ||
			rowNumber <= this.firstVisibleRowIndex - this.rowsInViewport
		) {
			this._fullRedrawOnScrollTop(rowNumber);
		} else if (rowNumber > this.firstVisibleRowIndex) {
			this._partialRedrawOnScrollTopDown(rowNumber);
		} else if (rowNumber < this.firstVisibleRowIndex) {
			this._partialRedrawOnScrollTopUp(rowNumber);
		}
		this.firstVisibleRowIndex = rowNumber;
		this.scrollTop = scrollTop;
		// let obj = {};
		// document.querySelectorAll(".Input").forEach((elem) => {
		// 	if (!obj[elem.textContent]) obj[elem.textContent] = 0;
		// 	obj[elem.textContent]++;
		// });
		// for (let [prop, value] of Object.entries(obj)) {
		// 	if (value && value > 1) {
		// 		console.error({ prop, value });
		// 	}
		// }
	}

	renderColumn(column) {}

	removeRow(rowIndex) {}

	// bLast - last element in Dom or first
	renderRow(rowIndex, columnsToRender) {
		if (rowIndex < 0 || rowIndex >= this.rowCount) {
			return;
		}
		const columns = columnsToRender || this.columns;
		let leftPadding = this.currentLeft;
		let topPadding = this.rowHeight * rowIndex;
		let row = [];
		columns.forEach((column, columnIndex) => {
			let inlineStyle = `height:${this.rowHeight}px;max-width:${column.width}px ;left: ${leftPadding}${column.widthUnits}; top:${topPadding}px; position: absolute; display: flex; justify-content: center; align-items: center;`;
			const renderedCell = this.cellRenderer({ rowIndex, columnIndex, column, inlineStyle });

			row.push(renderedCell);
			leftPadding += column.width;
		});

		this.container.append(...row);

		return { row };
	}
}

export default Sturdy;
