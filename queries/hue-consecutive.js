export default {
	caption: "Hue change between consecutive tints",
	getValue (color, { palette, tint, hue }) {
		let nextTint = getNextTint(tint);
		let nextColor = palettes[palette][hue][nextTint];
		return color.h - nextColor.h;
	},
	getKey (color, { tint }) {
		return `${tint} → ${getNextTint(tint)}`;
	},
	filter: "-95",
};
