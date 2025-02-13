export default [
	{ component: "h", by: "hue", filter: ["core ± 1", "-gray"] },
	{ component: "c", by: "tint", filter: "-gray" },
	{ component: "c", by: "palette", filter: "core", stats: ["max", "avg", "median", "count"] },
	{ component: "l", by: "tint" },
];
