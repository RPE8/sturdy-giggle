import Sturdy from "./sturdy-giggle.js";
import SturdyDataGenerator from "./sturdy-data-generator.js";

const rowsCount = 30;
const columnsCount = 30;

const data = new SturdyDataGenerator({ rowsCount, columnsCount }).generateData();

const rowHeight = 50;

const sturdy = new Sturdy({
	container: document.querySelector(".sturdy-container"),
	rowCount: rowsCount,
	rowHeight: rowHeight,
	columns: data,
	cellRenderer: ({ columnIndex, rowIndex, key, inlineStyle, classes, column } = {}) => {
		return `
				<div data-key="${key}" style="${inlineStyle}" class="${classes}">
					${column.renderer({ columnIndex, rowIndex })}
				</div>
			`;
	},
});

sturdy.render();
