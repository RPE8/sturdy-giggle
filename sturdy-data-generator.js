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
					width: 120,
					widthUnits: "px",
					renderer: ({ rowIndex, columnIndex }) => {
						const cell = document.createElement("div");
						cell.textContent = dataAccessor({ rowIndex, columnIndex });
						return cell;
					},
				})
			);
		}

		return columns;
	}
}

export default SturdyColumnsGenerator;
