import Sturdy from "./sturdy-giggle.js";
import SturdyDataGenerator from "./sturdy-data-generator.js";

const data = new SturdyDataGenerator().generateData();
const rowCount = 10;
const rowHeight = 30;

const sturdy = new Sturdy({
	parent: {},
	rowCount: 10,
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
