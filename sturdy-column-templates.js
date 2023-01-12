import SturdyColumn from "./sturdy-column.js";
// dayjs.extend(isSameOrBefore);


class SturdyColumnTemplates {
	constructor() {}

	generateFullWeek1Template(params) {
		const classAccessor = function ({ rowIndex, columnIndex }) {
			const classes = [`Row-${rowIndex}`, `Column-${columnIndex}`, "Row", "Column", "Input"];
			if (rowIndex % 2 === 0) {
				classes.push("Even");
			}
			return classes;
		};

		const {startDate, endDate, columnName, dataDataAccesor, dataClassAccesor}  = params;
		let currDate = dayjs(startDate).hour(0).minute(0).second(0).millisecond(0);
		const dayJSEndDate = dayjs(endDate).hour(0).minute(0).second(0).millisecond(0);
		const dataAccessor = function ({ rowIndex, columnIndex, mainColumnIndex }) {
			// return data[rowIndex][columnIndex] + "MC:" + mainColumnIndex;
		};
		// ALL 7 COLUMNS SUPPOSED TO BE WRAPPED BY ONE PARENT COLUMN
		// Compare computeColumnsRenderInfo method for data and headers.
		const renderer = ({ rowIndex, columnIndex }) => {
			console.log(headers);
			if (rowIndex === 0) {
				const element = document.createElement("div");
				element.style.maxWidth = "120px";
				const span = document.createElement("span");
				span.textContent = headers[0][columnIndex];
				element.append(span);
				const classes = classAccessor({ rowIndex, columnIndex });
				element.classList.add(...classes);

				return [element];
			}

			const elements = [];
			for (let i = 0; i < 7; i++) {
				
				const element = document.createElement("div");
				element.style.maxWidth = "120px";
				const span = document.createElement("span");
				span.textContent = headers[rowIndex]?.[columnIndex * 7 + i];
				element.append(span);
				const classes = classAccessor({ rowIndex, columnIndex });
				element.classList.add(...classes);
				elements.push(element);
			}
			return elements;
			
		}

		const headers = [[], [], [], []];
		const columns = [];

		for (let i = 0; currDate.isSameOrBefore(dayJSEndDate); i++) {
			const date = currDate.toDate();
			if (i % 6 === 0 && i !== 0) {
				headers[0].push(`${columnName} Wk-${i / 6}`);
			}
			headers[1].push(date.toLocaleString("en-US", {
				month: "short"
			}));
			headers[2].push(date.toLocaleString("en-US", {
				day: "numeric"
			}));
			headers[3].push(date.toLocaleString("en-US", {
				weekday: "short"
			}));

			columns.push(new SturdyColumn({
				// key: i,
				width: 120 * 7,
				widthUnits: "px",
				renderer,
				nested: headers,
			}));

			currDate = currDate.add(1, "d");
		}

		return columns;
	}
}

export default SturdyColumnTemplates;
