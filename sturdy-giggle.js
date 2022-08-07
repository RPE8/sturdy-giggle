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

		this.rowsMap = new Map();

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
		container.style.width = this.columns.reduce((width, column) => {
			width += column.width;
			return width;
		}, 0);
		// const throttledScroll = this.throttleFunction(, 170);
		const throttledScroll = this.throttleFunction(this.onScroll.bind(this), 17);
		container.parentNode.addEventListener("scroll", throttledScroll);
		this.rowsMap = new Map();
		for (let i = 0; i < this.rowsInViewport + this.treshold; i++) {
			this.rowsMap.set(i, this.renderRow(i));
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
			this.rowsMap = new Map();
			this.container.replaceChildren();
			// console.groupCollapsed("full");
			// console.log("first visible", this.firstVisibleRowIndex);
			// console.log("current", rowNumber);
			const rowsUpTo = rowNumber + this.rowsInViewport;
			for (let i = rowNumber; i < rowsUpTo; i++) {
				this.rowsMap.set(i, this.renderRow(i));
			}
			// console.groupEnd("full");
		} else if (rowNumber > this.firstVisibleRowIndex) {
			const diff = rowNumber - this.firstVisibleRowIndex;
			if (diff === 0) return;
			// console.groupCollapsed("partial dowm");
			// console.log("first visible", this.firstVisibleRowIndex);
			// console.log("current", rowNumber);
			for (let i = 0; i < diff; i++) {
				if (this.rowsMap.has(this.firstVisibleRowIndex + i)) {
					// console.log(`Yes ${this.firstVisibleRowIndex + i}`);
					const rows = this.rowsMap.get(this.firstVisibleRowIndex + i);
					rows.forEach((elem) => elem.remove());
				}
				// } else {
				// 	console.log(`No ${this.firstVisibleRowIndex + i}`);
				// }
				// for (let j = 0; j < this.columnsCount; j++) {

				// 	this.container.firstChild.remove();

				// }
				// console.log(this.firstVisibleRowIndex + this.rowsInViewport + i);
				this.rowsMap.set(
					this.firstVisibleRowIndex + this.rowsInViewport + i,
					this.renderRow(this.firstVisibleRowIndex + this.rowsInViewport + i)
				);
			}
			// console.groupEnd("partial dowm");
		} else if (rowNumber < this.firstVisibleRowIndex) {
			// console.groupCollapsed("partial up");
			// console.log("first visible", this.firstVisibleRowIndex);
			// console.log("current", rowNumber);
			const diff = Math.abs(this.firstVisibleRowIndex - rowNumber);
			// console.groupCollapsed("deleted");
			for (let i = 0; i < diff; i++) {
				// for (let j = 0; j < this.columnsCount; j++) {

				if (this.rowsMap.has(this.firstVisibleRowIndex + this.rowsInViewport - 1 - i)) {
					// console.log(`Yes ${this.firstVisibleRowIndex + this.rowsInViewport - 1 - i}`);
					const rows = this.rowsMap.get(this.firstVisibleRowIndex + this.rowsInViewport - 1 - i);
					rows.forEach((elem) => elem.remove());
				}
				// } else {
				// 	console.log(`No ${this.firstVisibleRowIndex + this.rowsInViewport - 1 - i}`);
				// }

				// this.container.lastChild.remove();
				// }
				// console.log(rowNumber + i);
				this.rowsMap.set(rowNumber + i, this.renderRow(rowNumber + i));
			}
			// console.groupEnd("deleted");
			// console.groupEnd("partial up");
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
		return row;
	}
}

export default Sturdy;
