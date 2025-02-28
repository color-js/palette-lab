import { subtractAngles } from "../src/util/util.js";

let baseQuery = {
	caption: "Hue change between consecutive tints",
	getValue (color, { palette, tint, hue }) {
		let scale = this[palette][hue];
		let nextTint = scale.getNext(tint);
		let nextColor = scale[nextTint];
		return Math.abs(subtractAngles(color.h, nextColor.h));
	},

	filter: ["-95", "-gray"],
};

export default [
	{
		...baseQuery,
		getKey (color, { palette, tint, hue }) {
			let scale = this[palette][hue];
			let nextTint = scale.getNext(tint);
			return `${tint} → ${nextTint}`;
		},
	},
	{ ...baseQuery, by: "hue" },
];
