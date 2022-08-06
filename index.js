import Sturdy from "./sturdy-giggle.js";
import SturdyDataGenerator from "./sturdy-data-generator.js";

const data = SturdyDataGenerator.generateData();
const rowCount = data.length;
const rowHeight = 30;

console.log(
	new Sturdy({
		parent: {},
		rowCount: rowCount,
		rowHeight: rowHeight,
		cellRenderer: ({ columnIndex, rowIndex, key, inlineStyle, classes, dataAccessor } = {}) => {
			return `
				<div data-key="${key}" style="${inlineStyle}" class="${classes}">
					${dataAccessor({ rowIndex, columnIndex })}
				</div>
			`;
		},
	})
);
