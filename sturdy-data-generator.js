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

		const headersClassAccessor = function({ rowIndex, columnIndex }) {
			const classes = [`Row-${rowIndex}`, `Column-${columnIndex}`, "Row", "Column", "Input"];
			return classes;
		}

		const headerDataAccessor = function({ rowIndex, columnIndex }) {
			if (rowIndex === 1) {

			}
			return data[rowIndex][columnIndex];
		}

		const inlineStyleAccessor = function ({ rowIndex, columnIndex }) {
			return "width: 30px";
		};

		const attributeAccessor = function ({ rowIndex, columnIndex }) {
			return [{ "data-key": this.key }];
		};

		let columns = { data: [], headers: [] };

		for (let i = 0; i < this.rowsCount; i++) {
			let row = [];
			for (let j = 0; j < this.columnsCount; j++) {
				row.push(`R:${i},C:${j}`);
			}
			data.push(row);
		}

		for (let i = 0; i < this.columnsCount; i++) {
			const nestedHeaders = [];
			for (let j = 0; j < 7; j++) {
				nestedHeaders.push(
					new SturdyColumn({
						dataAccessor: () => "Header",
						classAccessor: () => "",
						inlineStyleAccessor,
						attributeAccessor,
						key: i,
						width: 120,
						widthUnits: "px",
						renderer: ({ rowIndex, columnIndex, mainColumnIndex }) => {
							const element = document.createElement("div");
							element.style.maxWidth = "120px";
							const span = document.createElement("span");
							span.textContent = "Hello";
							element.append(span);
							const classes = classAccessor({ rowIndex, columnIndex });
							element.classList.add(...classes);
							return element;
						},
					})
				);
			}

			columns.headers.push(
				new SturdyColumn({
					nested: nestedHeaders,
					key: i,
					width: 120 * 7,
					widthUnits: "px",
					renderer: function ({ rowIndex, columnIndex }) {
						let elements = [];
						// return
						const element = document.createElement("div");
							element.style.maxWidth = "120px";
							const span = document.createElement("span");
							span.textContent = "Hello";
							element.append(span);
							const classes = classAccessor({ rowIndex, columnIndex });
							element.classList.add(...classes);
							// return element;

						return [element];
					},
				})
			);
			
			let nested = [];
			let totalWidth = 0;
			const classAccessor = function ({ rowIndex, columnIndex }) {
				let classes = ["Input"];

				// if (columnIndex % 2 === 0) {
				// 	classes = [...classes, ...["Even-Column", "Input"]];
				// } else {
				// 	classes = [...classes, ...["Odd-Column", "Input"]];
				// }

				if (rowIndex % 2 === 0) {
					classes.push("Even-Row");
				}
				return classes;
			};
			const dataAccessor = function ({ rowIndex, columnIndex, mainColumnIndex }) {
				return data[rowIndex][columnIndex] + "MC:" + mainColumnIndex;
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
						renderer: ({ rowIndex, columnIndex, mainColumnIndex }) => {
							const element = document.createElement("div");
							element.style.maxWidth = "120px";
							// if (rowIndex % 2 === 0 && columnIndex % 2 === 0) {
							// 	element = document.createElement("input");
							// 	element.value = dataAccessor({ rowIndex, columnIndex });
							// } else {
							const span = document.createElement("span");
							// span.style.maxWidth = "120px";
							span.textContent = dataAccessor({ rowIndex, columnIndex, mainColumnIndex });
							// element.textContent = ;
							element.append(span);
							element.addEventListener("click", function () {
								console.log(rowIndex, columnIndex, mainColumnIndex);
								const input = document.createElement("input");
								// input.style.maxWidth = "120px";
								input.value = dataAccessor({ rowIndex, columnIndex, mainColumnIndex });
								input.classList.add(...classes);
								element.textContent = "";
								element.append(input);
							});

							// }

							const classes = classAccessor({ rowIndex, columnIndex });
							element.classList.add(...classes);
							return element;
						},
					})
				);
			}
			columns.data.push(
				new SturdyColumn({
					nested: nested,
					key: i,
					width: totalWidth,
					widthUnits: "px",
					renderer: function ({ rowIndex, columnIndex }) {
						let elements = [];
						this.nested.forEach((column, i) => {
							elements.push(column.renderer({ rowIndex, columnIndex: i, mainColumnIndex: columnIndex }));
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
