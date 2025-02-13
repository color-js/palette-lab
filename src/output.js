// import { capitalize } from "./util.js";

export function consoleOutput (results) {
	for (let table of results) {
		console.log(table.caption);
		console.table(table.results);
		console.log("\n");
	}
}

export { consoleOutput as console };

export function html (results) {
	return results
		.map(table => {
			let entries = Object.entries(table.results);
			let columns = Object.keys(entries[0][1]);

			let trs = Object.entries(table.results).map(([key, rows]) => {
				let valueCols = Object.values(rows)
					.map(row => `<td>${row}</td>`)
					.join("");
				return `<tr><th>${key}</th>${valueCols}</tr>`;
			});

			return [
				`<table><caption>${table.caption}</caption>`,
				`<thead><tr><th></th>${columns.map(label => `<th>${label}</th>`)}</tr></thead>`,
				...trs,
				"</table>",
			].join("\n");
		})
		.join("\n");
}
