let baseQuery = {
	caption: "Chroma scale from core tint to next tint",
	getChromas (color, { palette, hue, tint }) {
		let scale = this[palette][hue];
		let nextTint = scale.getNext(tint);
		let next = scale[nextTint];
		return { next: next.c, core: color.c };
	},
	getKey (color, { palette, hue, tint }) {
		let scale = this[palette][hue];
		let nextTint = scale.getNext(tint);
		return `${tint} → ${nextTint}`;
	},
	sort: ["extent", "desc"],
	stats: ["min", "max", "avg", "median", "extent", "stddev", "count"],
	excludeOutliers: 2,
	filter: ["core", "-gray"],
};

export default [
	{
		...baseQuery,
		caption: "Chroma scale from core tint to next tint",
		getValue (...args) {
			let { next, core } = baseQuery.getChromas.call(this, ...args);
			return next / core;
		},
	},
	{
		...baseQuery,
		caption: "Absolute chroma drop from core tint to next tint",
		getValue (...args) {
			let { next, core } = baseQuery.getChromas.call(this, ...args);
			return core - next;
		},
	},
];
