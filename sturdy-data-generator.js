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
			let nested = [];
			let totalWidth = 0;
			let classAccessor = function ({ rowIndex, columnIndex }) {
				let classes = [];

				if (columnIndex % 2 === 0) {
					classes = [...classes, ...["Even-Column", "Input"]];
				} else {
					classes = [...classes, ...["Odd-Column", "Input"]];
				}

				if (rowIndex % 2 === 0) {
					classes.push("Even-Row");
				}
				return classes;
			};
			for (let j = 0; j < 7; j++) {
				totalWidth += 120;
				nested.push(
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
							// if (rowIndex % 2 === 0 && columnIndex % 2 === 0) {
							// 	element = document.createElement("input");
							// 	element.value = dataAccessor({ rowIndex, columnIndex });
							// } else {
							element = document.createElement("div");
							element.textContent = dataAccessor({ rowIndex, columnIndex });
							// }

							const classes = classAccessor({ rowIndex, columnIndex });
							element.classList.add(...classes);
							return element;
						},
					})
				);
			}
			columns.push(
				new SturdyColumn({
					nested: nested,
					key: i,
					width: totalWidth,
					widthUnits: "px",
					renderer: function ({ rowIndex, columnIndex }) {
						let elements = [];
						this.nested.forEach((column, i) => {
							elements.push(column.renderer({ rowIndex, columnIndex: i }));
						});

						return elements;
					},
				})
			);
		}
		console.log(columns);
		return columns;
	}
}

export default SturdyColumnsGenerator;
