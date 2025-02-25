import query from "../src/query.js";
import { subtractAngles } from "../src/util/util.js";

export default function (palettes, { all } = {}) {
	let { results } = query(palettes, {
		component: "h",
		by: ["palette", "hue"],
		filter: ["core ± 1", "-gray"],
		stats: ["min", "max"],
	});

	let allHueRanges = {};
	for (let key in results) {
		let [palette, hue] = key.split(" > ");
		allHueRanges[palette] ??= {};
		allHueRanges[palette][hue] = results[key];
	}

	return {
		caption: "Gray hue",
		getValue (coreGray, { palette }) {
			let hue = coreGray.get("h");
			let chroma = coreGray.get("c");
			if (chroma === 0) {
				return { name: "N/A", mix: 0 };
			}

			let hueRanges = allHueRanges[palette];
			let { name, distance } = getHue(hue, hueRanges);
			let coreChroma = palettes[palette][name].coreTintChroma;
			return { name, distance, mix: chroma / coreChroma };
		},
		by: "palette",
		filter: ["core", "gray"],
		stats: ["value", "count"],
	};
}

function getHue (hue, hueRanges) {
	let minMid = Infinity;
	let minColorName;

	for (let name in hueRanges) {
		let { min, max } = hueRanges[name];
		let extent = subtractAngles(max, min);
		let mid = min + extent / 2;
		let fromMid = Math.abs(subtractAngles(hue, mid));

		if (fromMid <= extent / 2) {
			return { name, distance: 0 };
		}

		if (fromMid < minMid) {
			minMid = fromMid;
			minColorName = name;
		}
	}

	return { name: minColorName, distance: minMid };
}
