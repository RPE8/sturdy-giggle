// TODO: 	Add treshold
//  			Add rowHeightUnits
// 				Move all this. props to constructor
// 				Instead of filter use Binary search
// 				rendered* (renderedInfo) -> rendering
//  			clear vars on render

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
		this.columnsTreshold = 1;

		this.rowsInViewport = Math.floor(this.containerHeight / this.rowHeight);

		this.tresholdPadding = this.treshold * this.rowHeight;

		this.cellRenderer = cellRenderer;
		this.columns = columns;
		this.columnsCount = this.columns.length;

		this.firstVisibleRowIndex = 0;
		this.columnRenderingTolerance = 400;
		this.currentRenderedArea = [0, 0];

		this.cellsMap = new Map();
		this.renderedColumnsMap = new Map();

		this.scrollTop = 0;
		this.scrollLeft = 0;
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

	computeColumnsRenderInfo(columns) {
		let totalWidth = 0;
		const renderedInfo = columns.reduce((acc, curr, i) => {
			let obj = {
				start: totalWidth,
				end: totalWidth + curr.width,
				column: curr,
			};
			totalWidth += curr.width;
			acc.push(obj);
			return acc;
		}, []);

		const renderedInfoMap = new Map();
		const renderedInfoKeys = [];
		renderedInfo.forEach((info) => {
			renderedInfoMap.set(info.start, info);
			renderedInfoKeys.push(info.start);
		});

		return {
			renderedInfo,
			renderedInfoMap,
			renderedInfoKeys,
			totalWidth,
		};
	}

	renderColumn(column) {
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

	render() {
		const container = this.container;
		const { renderedInfo, renderedInfoMap, renderedInfoKeys, totalWidth } = this.computeColumnsRenderInfo(this.columns);
		this.renderedInfo = renderedInfo;
		this.renderedInfoMap = renderedInfoMap;
		this.renderedInfoKeys = renderedInfoKeys;
		this.totalWidth = totalWidth;

		this.cellsMap = new Map();
		this.firstVisibleRowIndex = 0;

		container.style.width = totalWidth;
		container.style.height = this.rowHeight * this.rowCount + "px";

		const throttledScroll = this.throttleFunction(this.onScroll.bind(this), 17);
		container.parentNode.addEventListener("scroll", throttledScroll);

		this.setScrollLeft(0);
		this.setScrollTop(0);

		// const columnsToRender = [];
		// let freeWidth = this.containerWidth;
		// for (let i = 0; i < this.columns.length; i++) {
		// 	if (freeWidth > 0) {
		// 		columnsToRender.push(this.columns[i]);
		// 		freeWidth -= this.columns[i].width;
		// 	} else {
		// 		break;
		// 	}
		// }

		// for (let i = 0; i < this.rowsInViewport + this.treshold; i++) {
		// 	const rendered = this.renderRow(i, columnsToRender);
		// 	this.cellsMap.set(i, rendered.row);
		// }

		// console.table(this.cellsMap);
	}

	onScroll(event) {
		const newTopScroll = event.target.scrollTop;
		if (newTopScroll !== this.scrollTop) {
			this.setScrollTop(newTopScroll);
			return;
		}

		const newLeftScroll = event.target.scrollLeft;
		if (newLeftScroll !== this.scrollLeft) {
			this.setScrollLeft(newLeftScroll);
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

	setScrollLeft(scrollLeft) {
		if (scrollLeft >= this.currentRenderedArea[1] || scrollLeft + this.containerWidth <= this.currentRenderedArea[0]) {
			console.log("full hor");
			this._fullRedrawOnScrollLeft(scrollLeft);
		} else if (scrollLeft - this.currentRenderedArea[0] <= this.columnRenderingStartPoint) {
			console.log("left hor");
			this._partialRedrawOnScrollLeftLeft(scrollLeft);
		} else if (this.currentRenderedArea[1] - scrollLeft <= this.columnRenderingStartPoint) {
			console.log("right hor");
			this._partialRedrawOnScrollLeftRight(scrollLeft);
		}
	}

	_fullRedrawOnScrollLeft(scrollLeft) {
		scrollLeft = 1680;
		this.cellsMap = new Map();
		this.renderedColumnsMap = new Map();
		this.container.replaceChildren();

		let startColumnIndex = this.renderedInfoKeys;
		for (let i = 1, prev = this.renderedInfoKeys?.[0]; i < this.renderedInfoKeys.length; i++) {
			const curr = this.renderedInfoKeys[i];
			if (prev <= scrollLeft && scrollLeft <= curr) {
				startColumnIndex = prev;
				break;
			}
			prev = curr;
		}

		console.log(startColumnIndex);
		// console.table(this.renderedInfo);
		// console.table(this.renderedInfoMap);
		console.log(this.renderedInfoKeys);
		// console.table(this.totalWidth);

		// this.firstVisibleRowIndex
	}

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
