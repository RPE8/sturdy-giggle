import Sturdy from "./sturdy-giggle.js";
import SturdyDataGenerator from "./sturdy-data-generator.js";

const rowsCount = 40;
const columnsCount = 1;

const data = new SturdyDataGenerator({ rowsCount, columnsCount }).generateData();

const rowHeight = 50;

const sturdy = new Sturdy({
	container: document.querySelector(".sturdy-container"),
	rowCount: rowsCount,
	rowHeight: rowHeight,
	columns: data,
	cellRenderer: ({ columnIndex, rowIndex, key, inlineStyle, classes = ["cell"], column } = {}) => {
		const cellContainer = document.createElement("div");
		if (key) cellContainer.setAttribute("data-key", key);
		if (classes) cellContainer.classList.add("class", ...classes);
		if (inlineStyle) cellContainer.setAttribute("style", inlineStyle);

		const content = column.renderer({ columnIndex, rowIndex });
		cellContainer.append(content);
		return cellContainer;
	},
});

sturdy.render();
