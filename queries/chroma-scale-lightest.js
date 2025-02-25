let baseQuery = {
	getChromas (color, { palette, hue, tint }, used, all) {
		let lightestTint = all.tints.at(-1);
		let lightest = this[palette][hue][lightestTint];

		return { lightest: lightest.c, core: color.c };
	},
	by: "tint",
	stats: ["min", "max", "avg", "median", "extent", "stddev", "count"],
	filter: ["core", "-gray"],
};

export default [
	{
		...baseQuery,
		caption: "Chroma scale from core to lightest color, by core tint",
		getValue (...args) {
			let { lightest, core } = baseQuery.getChromas.call(this, ...args);
			return lightest / core;
		},
	},
	{
		...baseQuery,
		caption: "Absolute chroma drop from core to lightest color, by core tint",
		getValue (...args) {
			let { lightest, core } = baseQuery.getChromas.call(this, ...args);
			return core - lightest;
		},
	},
];
