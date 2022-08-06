class SturdyDataGenerator {
	constructor() {
		this.columnsCount = 10;
		this.rowsCount = 10;
	}

	generateData() {
		let data = [];
		for (let i = 0; i < this.rowsCount; i++) {
			let row = [];
			for (let j = 0; j < this.columnsCount; i++) {
				row.push(`R: ${i}; C: ${j}`);
			}
			data.push(row);
		}
		return data;
	}
}

export default SturdyDataGenerator;
