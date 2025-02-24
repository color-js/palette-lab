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
export default function (palettes, query, options = {}) {
	palettes = Palettes.get(palettes);
	options.all ??= Palettes.allKeys;

	if (typeof query === "function") {
		query = query(palettes, options);
	}

	query = new Query(query);

	let { getValue, getKey, filter, caption, stats } = query;
	let results = {};
	let used = { ...options.all };

	if (filter) {
		used = getSubset(used, filter);
	}

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
				key = Array.isArray(key) ? key.join(Query.KEY_JOINER) : key;
				let value = getValue.call(palettes, color, { hue, tint, palette }, used);

				// Apply any late filters
				if (filter?.other) {
					for (let f of filter.other) {
						if (typeof f === "function") {
							let include = f(value, key, color, { hue, tint, palette });
							if (include === false) {
								continue;
							}
						}
					}
				}

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
			let value = aggregates[stat](values, acc);

			if (typeof value === "object") {
				// getValue() can return complex objects
				for (let key in value) {
					acc[key] = toPrecision(value[key]);
				}
			}
			else {
				acc[stat] = toPrecision(value);
			}

			return acc;
		}, {});
	}

	return { caption, results };
}
