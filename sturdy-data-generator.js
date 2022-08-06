import SturdyColumn from "./sturdy-column.js";

class SturdyColumnsGenerator {
	constructor({ rowsCount, columnsCount }) {
		this.columnsCount = columnsCount;
		this.rowsCount = rowsCount;
	}

	generateData() {
		let data = [];

		const dataAccessor = function ({ rowIndex, columnIndex }) {
			return data[rowIndex][columnIndex];
		};

		const classAccessor = function ({ rowIndex, columnIndex }) {
			const classes = [`Row-${rowIndex}`, `Column-${columnIndex}`, "Row", "Column", "Input"];
			if (rowIndex % 2 === 0) {
				classes.push("Even");
			}
			return classes;
		};

		const inlineStyleAccessor = function ({ rowIndex, columnIndex }) {
			return "width: 30px";
		};

		const attributeAccessor = function ({ rowIndex, columnIndex }) {
			return [{ "data-key": this.key }];
		};

		let columns = [];

		for (let i = 0; i < this.rowsCount; i++) {
			let row = [];
			for (let j = 0; j < this.columnsCount; j++) {
				row.push(`R:${i},C:${j}`);
			}
			data.push(row);
		}

		for (let i = 0; i < this.columnsCount; i++) {
			columns.push(
				new SturdyColumn({
					dataAccessor,
					classAccessor,
					inlineStyleAccessor,
					attributeAccessor,
					key: i,
					width: 120,
					widthUnits: "px",
					renderer: ({ rowIndex, columnIndex }) => {
						let element;
						if (rowIndex % 2 === 0 && columnIndex % 2 === 0) {
							element = document.createElement("input");
							element.value = dataAccessor({ rowIndex, columnIndex });
						} else {
							element = document.createElement("div");
							element.textContent = "Hello";
						}

						const classes = classAccessor({ rowIndex, columnIndex });
						element.classList.add(...classes);
						return element;
					},
				})
			);
		}

		return columns;
	}
}

export default SturdyColumnsGenerator;
