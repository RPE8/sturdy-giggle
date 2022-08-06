import SturdyColumn from "./sturdy-column.js";

class SturdyColumnsGenerator {
	constructor() {
		this.columnsCount = 10;
		this.rowsCount = 10;
	}

	generateData() {
		let data = [];

		const dataAccessor = function ({ rowIndex, columnIndex }) {
			return data[rowIndex][columnIndex];
		};

		const classAccessor = function ({ rowIndex, columnIndex }) {
			return this.key;
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
					width: 50,
					widthUnits: "px",
					renderer: ({ rowIndex, columnIndex }) => {
						return `<div>${dataAccessor({ rowIndex, columnIndex })}</div>`;
					},
				})
			);
		}

		return columns;
	}
}

export default SturdyColumnsGenerator;
