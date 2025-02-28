import query from "../src/query.js";
import { roundTo } from "../src/util/util.js";

let baseQuery = { component: "c", filter: ["95"] };

function maxChromaScale (palettes, { all } = {}) {
	let { results: maxChromas } = query(palettes, {
		component: "c",
		by: ["palette"],
		filter: ["core ± 1", "-gray"],
		stats: ["max"],
	});

	return {
		...baseQuery,
		caption: "By palette max chroma",
		getKey (color, { palette }) {
			return roundTo(maxChromas[palette].max, 0.05);
		},
		sort: "numeric",
	};
}

export default [{ ...baseQuery, by: "hue" }, { ...baseQuery, by: "palette" }, maxChromaScale];
