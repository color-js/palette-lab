export default {
	caption: "Chroma scale from core tint to edges, by core tint",
	getValue (color, { palette, hue }) {
		let maxChroma = this[palette][hue].maxChroma;
		return color.c / maxChroma;
	},
	getKey ({ palette, hue }) {
		return this[palette][hue].maxChromaTint;
	},
	filter: ["05", "95"],
};
