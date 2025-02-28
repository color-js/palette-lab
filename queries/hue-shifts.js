import { subtractAngles } from "../src/util/util.js";
import { roundTo } from "../src/util/util.js";

export default {
	getValue (color, { palette, hue, tint }) {
		let lightest = this[palette][hue].max;
		return subtractAngles(color.h, lightest.h);
	},
	getKey (color, { palette, hue, tint, value }) {
		return roundTo(color.h, 10);
	},
	sort: "numeric",
	filter: ["core", "-gray", value => Math.abs(value) > 3],
	stats: ["min", "max", "median", "minAbs", "maxAbs", "avg", "stddev", "count"],
	minCount: 2,
	// excludeOutliers: 1,
};
