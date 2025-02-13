import Palettes from "./classes/Palettes.js";
import Query from "./classes/Query.js";
import { aggregates, normalizeAngles, toPrecision } from "./util/util.js";
import getSubset from "./util/getSubset.js";

/**
 * Run a single query against a set of palettes.
 * @param {*} palettes
 * @param {*} query
 * @param {*} options
 * @returns {{ caption: string, results: Object }}
 */
export default function (palettes, query, { all } = {}) {
	palettes = Palettes.get(palettes);
	query = new Query(query);

	let { getValue, getKey, filter, caption, stats } = query;
	let results = {};
	let used = filter ? getSubset(all, filter) : all;

	for (let palette of used.palettes) {
		for (let hue of used.hues) {
			if (!palettes[palette][hue]) {
				continue;
			}

			let { coreTint } = palettes[palette][hue];

			// Resolve any core tint microsyntax
			let scale = palettes[palette][hue];
			let tints = used.tints.flatMap(tint => scale.resolveTint(tint, coreTint));
			// TODO ensure in  all.tints

			for (let tint of tints) {
				let color = palettes[palette][hue][tint];

				let key = getKey.call(palettes, { hue, tint, palette });
				let value = getValue.call(palettes, color, { hue, tint, palette }, used);

				results[key] ??= [];
				results[key].push(value);
			}
		}
	}

	// Process results
	for (let key in results) {
		let values = results[key];

		if (query.componentMeta?.type === "angle") {
			values = normalizeAngles(values);
		}

		results[key] = stats.reduce((acc, stat) => {
			acc[stat] = toPrecision(aggregates[stat](values, acc));
			return acc;
		}, {});
	}

	return { caption, results };
}
