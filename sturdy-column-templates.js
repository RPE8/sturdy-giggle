// import SturdyColumn from "./sturdy-column.js";
// dayjs.extend(isSameOrBefore);


class SturdyColumnTemplates {
	constructor() {}

	generateFullWeek1Template(params) {
		const {startDate,endDate,columnName, dataAccesor, classAccesor}  = params;
		let currDate = dayjs(startDate).hour(0).minute(0).second(0).millisecond(0);
		const dayJSEndDate = dayjs(endDate).hour(0).minute(0).second(0).millisecond(0);
		const days = [];
		for (let i = 0; currDate.isSameOrBefore(dayJSEndDate); i++) {
			const date = currDate.toDate();
			
			days.push([date.toLocaleString("en-US", {
				month: "short"
			}), date.toLocaleString("en-US", {
				day: "numeric"
			}),date.toLocaleString("en-US", {
				weekday: "short"
			})]);
			currDate = currDate.add(1, "d");
		}
		console.log(days);
	}
}

export default SturdyColumnTemplates;
