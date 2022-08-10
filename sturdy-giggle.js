// TODO: 	Add treshold
//  			Add rowHeightUnits
// 				Move all this. props to constructor
// 				Instead of filter use Binary search
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
		this.zeroBasedRowsInViewport = this.rowsInViewport - 1;

		this.tresholdPadding = this.treshold * this.rowHeight;

		this.cellRenderer = cellRenderer;
		this.columns = columns;
		this.columnsCount = this.columns.length;

		this.firstVisibleRowIndex = 0;
		this.columnRenderingTolerance = 400;
		this.columnRenderingStartPoint = 100;
		this.currentRenderedArea = [0, 0];

		this.cellsMap = new Map();
		this.renderedColumnsMap = new Map();
		this.columnRenderingInfo = new Map();
		this.columnRenderingInfoMap = new Map();
		this.columnRenderingInfoKeys = [];
		this.totalColumnsWidth = 0;

		this.scrollTop = 0;
		this.scrollLeft = 0;
	}

	_throttleFunction(func, ms) {
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
		const renderingInfo = columns.reduce((acc, curr, i) => {
			let obj = {
				start: totalWidth,
				end: totalWidth + curr.width,
				column: curr,
				index: i
			};
			totalWidth += curr.width;
			acc.push(obj);
			return acc;
		}, []);

		const renderingInfoMap = new Map();
		const renderingInfoKeys = [];
		renderingInfo.forEach((info) => {
			renderingInfoMap.set(info.start, info);
			renderingInfoKeys.push(info.start);
		});

		return {
			renderingInfo,
			renderingInfoMap,
			renderingInfoKeys,
			totalWidth,
		};
	}

	render() {
		const container = this.container;
		const { renderingInfo, renderingInfoMap, renderingInfoKeys, totalWidth } = this.computeColumnsRenderInfo(
			this.columns
		);
		this.columnRenderingInfo = renderingInfo;
		this.columnRenderingInfoMap = renderingInfoMap;
		this.columnRenderingInfoKeys = renderingInfoKeys;
		this.totalColumnsWidth = totalWidth;

		this.cellsMap = new Map();
		this.firstVisibleRowIndex = 0;

		container.style.width = totalWidth + "px";
		container.style.height = this.rowHeight * this.rowCount + "px";

		const throttledScroll = this._throttleFunction(this._onScroll.bind(this), 17);
		container.parentNode.addEventListener("scroll", throttledScroll);

		this.setScrollHorizontally(0);
		this.setScrollVertically(0);
	}

	_onScroll(event) {
		const newTopScroll = event.target.scrollTop;
		if (newTopScroll !== this.scrollTop) {
			this.setScrollVertically(newTopScroll);
			return;
		}

		const newLeftScroll = event.target.scrollLeft;
		if (newLeftScroll !== this.scrollLeft) {
			this.setScrollHorizontally(newLeftScroll);
			return;
		}
	}

	calcRowNumberByScrollTop(scrollTop) {
		return Math.round(scrollTop / this.rowHeight);
	}

	_fullRedrawOnScrollVertically(rowNumber) {
		this._clearOnFullredraw();
		const rowsUpTo = rowNumber + this.zeroBasedRowsInViewport;
		for (let i = rowNumber; i < rowsUpTo; i++) {
			const rendered = this.renderRow(i);
			this.cellsMap.set(i, rendered.row);
		}
	}

	_partialRedrawOnScrollDown(rowNumber) {
		const diff = rowNumber - this.firstVisibleRowIndex;
		if (diff === 0) return;
		for (let i = 0; i < diff; i++) {
			const lastRowIndex2BeRemoved = this.firstVisibleRowIndex + i;
			const newRowIndex = this.firstVisibleRowIndex + this.zeroBasedRowsInViewport + i;
			if (this.cellsMap.has(lastRowIndex2BeRemoved)) {
				const rows = this.cellsMap.get(lastRowIndex2BeRemoved);
				rows.forEach((elem) => elem.remove());
				this.cellsMap.delete(lastRowIndex2BeRemoved);
			}
			const rendered = this.renderRow(newRowIndex);
			this.cellsMap.set(newRowIndex, rendered.row);
		}
	}

	_partialRedrawOnScrollUp(rowNumber) {
		const diff = Math.abs(this.firstVisibleRowIndex - rowNumber);
		if (diff === 0) return;
		const lastRowIndex = this.firstVisibleRowIndex + this.zeroBasedRowsInViewport;
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

	setScrollVertically(scrollTop) {
		const rowNumber = this.calcRowNumberByScrollTop(scrollTop);
		if (
			rowNumber >= this.firstVisibleRowIndex + this.zeroBasedRowsInViewport ||
			rowNumber <= this.firstVisibleRowIndex - this.zeroBasedRowsInViewport
		) {
			this._fullRedrawOnScrollVertically(rowNumber);
		} else if (rowNumber > this.firstVisibleRowIndex) {
			this._partialRedrawOnScrollDown(rowNumber);
		} else if (rowNumber < this.firstVisibleRowIndex) {
			this._partialRedrawOnScrollUp(rowNumber);
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

	setScrollHorizontally(scrollLeft) {
		if (scrollLeft >= this.currentRenderedArea[1] || scrollLeft <= this.currentRenderedArea[0]) {
			console.log("full hor");
			this._fullRedrawOnScrollHorizontally(scrollLeft);
		} else if (scrollLeft < this.scrollLeft && (scrollLeft - this.currentRenderedArea[0]) <= this.columnRenderingStartPoint) {
			console.log("left hor");
			this._fullRedrawOnScrollHorizontally(scrollLeft);
			// return;
			// this._partialRedrawOnScrollLeft(scrollLeft);
		} else if (scrollLeft > this.scrollLeft && (this.currentRenderedArea[1] - (scrollLeft + this.containerWidth))  <= this.columnRenderingStartPoint) {
			console.log("right hor");
			this._fullRedrawOnScrollHorizontally(scrollLeft);
			// return;
			// this._partialRedrawOnScrollRight(scrollLeft);
		}

		this.scrollLeft = scrollLeft;
	}

	_findColumnByScrollLeft(scrollLeft) {
		const columnsLength = this.columnRenderingInfo.length; 
		for (let i = 1, prev = this.columnRenderingInfo?.[0]; i < columnsLength; i++) {
			const curr = this.columnRenderingInfo[i];
			if (prev.start <= scrollLeft && scrollLeft < curr.start) {
				return {
					startColumnIndex: i - 1,
					startColumn: prev
				}
			}
			prev = curr;
		}
	}

	_clearOnFullredraw() {
		this.cellsMap = new Map();
		this.renderedColumnsMap = new Map();
		this.container.replaceChildren();
	}

	_fullRedrawOnScrollHorizontally(scrollLeft) {
		console.log(scrollLeft);
		this._clearOnFullredraw();
		const columnsLength = this.columnRenderingInfo.length; 
		let columns2Rendered = [];

		let {startColumn, startColumnIndex} = this._findColumnByScrollLeft(scrollLeft);

		// Additional column to the left
		let freeSpaceToLeft = this.columnRenderingTolerance - Math.abs(startColumn.start - scrollLeft);
		for (let i = startColumnIndex - 1; i >= 0 && freeSpaceToLeft > 0; i--) {
			freeSpaceToLeft -= (this.columnRenderingInfo[i].end  - this.columnRenderingInfo[i].start)
			columns2Rendered.push(this.columnRenderingInfo[i]);
		}

		
		columns2Rendered.push(startColumn);
	
		// Additional column to the right
		let freeSpaceToRight = this.containerWidth - (startColumn.start - scrollLeft);
		for (let i = startColumnIndex + 1; i < columnsLength && freeSpaceToRight > (-this.columnRenderingTolerance); i++) {
			freeSpaceToRight -= (this.columnRenderingInfo[i].end  - this.columnRenderingInfo[i].start)
			columns2Rendered.push(this.columnRenderingInfo[i]);
		}

		this.currentRenderedArea[1] = columns2Rendered[columns2Rendered.length - 1].end;
		this.currentRenderedArea[0] = columns2Rendered[0].start;

		columns2Rendered.forEach((column) => {
			const rendered = this.renderColumn(column);
			for (let i = 0; i < this.zeroBasedRowsInViewport; i++) {
				const rowIndex = (i + this.firstVisibleRowIndex);
				if (this.cellsMap.has(rowIndex)) {
					this.cellsMap.set(rowIndex, [...(this.cellsMap.get(rowIndex)), rendered.column[i]]);
				} else {
					this.cellsMap.set(rowIndex, [rendered.column[i]]);
				}
				
			}
		});

		// console.log(this.cellsMap);
	}

	renderColumn(column) {
		const columnWidth = column.column.width;
		const columnWidthUnits = column.column.widthUnits;
		const columnIndex = column.index;
		const leftPadding = column.start;

		let renderedColumn = [];
		for (let i = 0; i < this.zeroBasedRowsInViewport; i++) {
			const rowIndex = (i + this.firstVisibleRowIndex);
			let topPadding = this.rowHeight * rowIndex;

			let inlineStyle = `height:${this.rowHeight}px;max-width:${columnWidth}px ;left: ${leftPadding}${columnWidthUnits}; top:${topPadding}px; position: absolute; display: flex; justify-content: center; align-items: center;`;
			const renderedCell = this.cellRenderer({ rowIndex, columnIndex, column: column.column, inlineStyle });

			renderedColumn.push(renderedCell);
		}


		this.container.append(...renderedColumn);

		return { column: renderedColumn };
	}

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
