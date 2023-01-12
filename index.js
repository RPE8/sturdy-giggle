import Sturdy from "./sturdy-giggle.js";
import SturdyDataGenerator from "./sturdy-data-generator.js";
import SturdyColumnTemplates from "./sturdy-column-templates.js";

const rowsCount = 10000;
const columnsCount = 100;

const data = new SturdyDataGenerator({ rowsCount, columnsCount }).generateData();
const templates = new SturdyColumnTemplates();
templates.generateFullWeek1Template({
	startDate: new Date(),
	endDate: new Date(new Date().setDate(new Date().getDate() + 118)),
});

const rowHeight = 25;

const sturdy = new Sturdy({
	tableElement: document.querySelector(".sturdy-table"),
	rowCount: rowsCount,
	rowHeight: rowHeight,
	columns: data.data,
	cellRenderer: ({ columnIndex, rowIndex, key, inlineStyle, classes = ["cell"], column } = {}) => {
		const cellContainer = document.createElement("div");
		if (key) cellContainer.setAttribute("data-key", key);
		if (classes) cellContainer.classList.add(...classes);
		if (inlineStyle) cellContainer.setAttribute("style", inlineStyle);

		const content = column.renderer({ columnIndex, rowIndex });
		cellContainer.append(...content);
		return cellContainer;
	},
});

sturdy.render();

const sturdy2 = (window.sturdy2 = new Sturdy({
	tableElement: document.querySelector(".sturdy-table2"),
	rowCount: 5,
	rowHeight: rowHeight,
	secondary: true,
	columns: data.headers,
	cellRenderer: ({ columnIndex, rowIndex, key, inlineStyle, classes = ["cell"], column } = {}) => {
		const cellContainer = document.createElement("div");
		if (key) cellContainer.setAttribute("data-key", key);
		if (classes) cellContainer.classList.add(...classes);
		if (inlineStyle) cellContainer.setAttribute("style", inlineStyle);

		const content = column.renderer({ columnIndex, rowIndex });
		cellContainer.append(...content);
		return cellContainer;
	},
}));

sturdy2.render();
