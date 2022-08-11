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

		this.rowsInViewport = Math.floor(this.containerHeight / this.rowHeight);
		this.zeroBasedRowsInViewport = this.rowsInViewport - 1;

		this.cellRenderer = cellRenderer;
		this.columns = columns;
		this.columnsCount = this.columns.length;

		this.firstVisibleRowIndex = 0;
		this.columnRenderingTolerance = 100;
		this.currentRenderedHorizontalArea = [0, 0];
		this.currentRenderedColumns = [];

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
				index: i,
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
		container.style.height = this.totalRowsHeight + "px";

		container.parentNode.addEventListener("scroll", this._throttleFunction(this._onScroll.bind(this), 0));

		this.setScrollHorizontally(0);
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
		this._clearOnVerticalFullredraw();
		const rowsUpTo = rowNumber + this.zeroBasedRowsInViewport + 1;
		const fragment = document.createDocumentFragment();
		for (let i = rowNumber; i < rowsUpTo; i++) {
			const rendered = this.createRow(i, this.currentRenderedColumns);
			fragment.append(...rendered.row);
			this.cellsMap.set(i, rendered.row);
		}
		this.container.append(fragment);
	}

	_partialRedrawOnScrollDown(rowNumber) {
		const diff = rowNumber - this.firstVisibleRowIndex;
		if (diff === 0) return;

		const fragment = document.createDocumentFragment();

		for (let i = 0; i < diff; i++) {
			const rowIndex2BeRemoved = this.firstVisibleRowIndex + i;
			const newRowIndex = this.firstVisibleRowIndex + this.zeroBasedRowsInViewport + i;

			this._removeRowByIndex(rowIndex2BeRemoved);

			this._createAndAppendRow(newRowIndex, this.currentRenderedColumns, fragment);
		}

		this.container.append(fragment);
	}

	_partialRedrawOnScrollUp(rowNumber) {
		const diff = Math.abs(this.firstVisibleRowIndex - rowNumber);
		if (diff === 0) return;

		const rowIndex = this.firstVisibleRowIndex + this.zeroBasedRowsInViewport;

		const fragment = document.createDocumentFragment();
		for (let i = 0; i < diff; i++) {
			const rowIndex2BeRemoved = rowIndex - i;
			const newRowIndex = rowNumber + i;

			this._removeRowByIndex(rowIndex2BeRemoved);

			this._createAndAppendRow(newRowIndex, this.currentRenderedColumns, fragment);
		}
		this.container.append(fragment);
	}

	_removeRowByIndex(rowIndex) {
		const rows = this.cellsMap.get(rowIndex);

		if (!rows) {
			return;
		}

		rows.forEach((elem) => elem.remove());
		this.cellsMap.delete(rowIndex);
	}

	_createAndAppendRow(rowIndex, columns, target) {
		const rendered = this.createRow(rowIndex, columns);

		if (!rendered?.row) {
			return;
		}

		target.append(...rendered.row);
		this.cellsMap.set(rowIndex, rendered.row);
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
	}

	setScrollHorizontally(scrollLeft) {
		if (scrollLeft >= this.currentRenderedHorizontalArea[1] || scrollLeft <= this.currentRenderedHorizontalArea[0]) {
			this._fullRedrawOnScrollHorizontally(scrollLeft);
		} else if (
			scrollLeft < this.scrollLeft &&
			scrollLeft - this.currentRenderedHorizontalArea[0] <= this.columnRenderingTolerance
		) {
			this._partialRedrawOnScrollHorizontallyLeft(scrollLeft);
		} else if (
			scrollLeft > this.scrollLeft &&
			this.currentRenderedHorizontalArea[1] - (scrollLeft + this.containerWidth) <= this.columnRenderingTolerance
		) {
			this._partialRedrawOnScrollHorizontallyRight(scrollLeft);
		}

		this.scrollLeft = scrollLeft;
	}

	_partialRedrawOnScrollHorizontallyLeft(scrollLeft) {
		this._fullRedrawOnScrollHorizontally(scrollLeft);
	}

	_partialRedrawOnScrollHorizontallyRight(scrollLeft) {
		this._fullRedrawOnScrollHorizontally(scrollLeft);
	}

	_findColumnByScrollLeft(scrollLeft) {
		const columnsLength = this.columnRenderingInfo.length;
		for (let i = 1, prev = this.columnRenderingInfo?.[0]; i < columnsLength; i++) {
			const curr = this.columnRenderingInfo[i];
			if (prev.start <= scrollLeft && scrollLeft < curr.start) {
				return {
					startColumnIndex: i - 1,
					startColumn: prev,
				};
			}
			prev = curr;
		}
	}

	_clearOnHorizontalFullredraw() {
		this.cellsMap = new Map();
		this.renderedColumnsMap = new Map();
		this.container.replaceChildren();
		this.currentRenderedColumns = [];
	}

	_clearOnVerticalFullredraw() {
		this.cellsMap = new Map();
		this.renderedColumnsMap = new Map();
		this.container.replaceChildren();
	}

	_fullRedrawOnScrollHorizontally(scrollLeft) {
		this._clearOnHorizontalFullredraw();
		const columnsLength = this.columnRenderingInfo.length;
		let columns2Rendered = [];

		let { startColumn, startColumnIndex } = this._findColumnByScrollLeft(scrollLeft);

		// Additional column to the left
		let freeSpaceToLeft = this.columnRenderingTolerance - Math.abs(startColumn.start - scrollLeft);
		for (let i = startColumnIndex - 1; i >= 0 && freeSpaceToLeft > 0; i--) {
			freeSpaceToLeft -= this.columnRenderingInfo[i].end - this.columnRenderingInfo[i].start;
			columns2Rendered.push(this.columnRenderingInfo[i]);
		}

		columns2Rendered.push(startColumn);

		// Additional column to the right
		let freeSpaceToRight = this.containerWidth - (startColumn.start - scrollLeft);
		for (let i = startColumnIndex + 1; i < columnsLength && freeSpaceToRight > -this.columnRenderingTolerance; i++) {
			freeSpaceToRight -= this.columnRenderingInfo[i].end - this.columnRenderingInfo[i].start;
			columns2Rendered.push(this.columnRenderingInfo[i]);
		}

		this.currentRenderedHorizontalArea[1] = columns2Rendered[columns2Rendered.length - 1].end;
		this.currentRenderedHorizontalArea[0] = columns2Rendered[0].start;

		const fragment = document.createDocumentFragment();
		columns2Rendered.forEach((column) => {
			this.currentRenderedColumns.push(column);
			const rendered = this.createColumn(column);
			fragment.append(...rendered.column);
			for (let i = 0; i < this.zeroBasedRowsInViewport; i++) {
				const rowIndex = i + this.firstVisibleRowIndex;
				if (this.cellsMap.has(rowIndex)) {
					this.cellsMap.set(rowIndex, [...this.cellsMap.get(rowIndex), rendered.column[i]]);
				} else {
					this.cellsMap.set(rowIndex, [rendered.column[i]]);
				}
			}
		});
		this.container.append(fragment);
		// console.log(this.cellsMap);
	}

	renderColumn(column) {
		const { column: renderedColumn } = this.createColumn(column);

		this.container.append(...renderedColumn);

		return { renderedColumn };
	}

	createColumn(column) {
		const columnWidth = column.column.width;
		const columnWidthUnits = column.column.widthUnits;
		const columnIndex = column.index;
		const leftPadding = column.start;

		let renderedColumn = [];
		for (let i = 0; i < this.zeroBasedRowsInViewport; i++) {
			const rowIndex = i + this.firstVisibleRowIndex;
			let topPadding = this.rowHeight * rowIndex;

			const renderedCell = this.cellRenderer({ rowIndex, columnIndex, column: column.column });

			renderedCell.style.height = `${this.rowHeight}px`;
			renderedCell.style.maxWidth = `${columnWidth}px`;
			renderedCell.style.position = `absolute`;
			renderedCell.style.left = `${leftPadding}${columnWidthUnits}`;
			renderedCell.style.top = `${topPadding}px`;

			renderedColumn.push(renderedCell);
		}

		return { column: renderedColumn };
	}

	createRow(rowIndex, columnsToRender) {
		if (rowIndex < 0 || rowIndex >= this.rowCount) {
			return;
		}
		const columns = columnsToRender;

		let topPadding = this.rowHeight * rowIndex;
		let row = [];
		columns.forEach((column, columnIndex) => {
			let leftPadding = column.start;
			const columnProps = column.column;
			const renderedCell = this.cellRenderer({ rowIndex, columnIndex, column: columnProps });

			renderedCell.style.height = `${this.rowHeight}px`;
			renderedCell.style.maxWidth = `${columnProps.width}px`;
			// renderedCell.style.position = `absolute`;
			// renderedCell.style.transform = `translate(${leftPadding}${columnProps.widthUnits},${topPadding}px)`;
			renderedCell.style.position = `absolute`;
			renderedCell.style.left = `${leftPadding}${columnProps.widthUnits}`;
			renderedCell.style.top = `${topPadding}px`;

			row.push(renderedCell);
		});

		return { row };
	}

	renderRow(rowIndex, columnsToRender) {
		const { row } = this.createRow(rowIndex, columnsToRender);

		this.container.append(...row);

		return { row };
	}
}

export default Sturdy;
