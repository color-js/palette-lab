import Palettes from "./classes/Palettes.js";
import Query from "./classes/Query.js";
import { aggregates, normalizeAngles, toPrecision, sortObject } from "./util/util.js";
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
	let { all = Palettes.allKeys } = options;

	if (typeof query === "function") {
		query = query(palettes, options);
	}

	query = new Query(query);

	let { getValue, getKey, filter, caption, stats, sort } = query;
	let results = {};
	let used = { ...all };

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

				let value = getValue.call(palettes, color, { hue, tint, palette }, used, all);
				let key = getKey.call(palettes, { hue, tint, palette, value }, used, all);
				key = Array.isArray(key) ? key.join(Query.KEY_JOINER) : key;

				// Apply any late filters
				if (filter?.other) {
					for (let f of filter.other) {
						if (typeof f === "function") {
							let include = f.call(
								palettes,
								value,
								key,
								color,
								{
									hue,
									tint,
									palette,
								},
								used,
								all,
							);
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
			if (!(stat in aggregates)) {
				// Might be an aggregate added by another function, e.g. minValues
				return acc;
			}

			let value = aggregates[stat](values, acc);

			if (Array.isArray(value)) {
				acc[stat] = value.slice();
			}
			else if (typeof value === "object") {
				// getValue() can return complex objects
				for (let key in value) {
					acc[key] = value[key];
				}
			}
			else {
				acc[stat] = value;
			}

			return acc;
		}, {});

		// Remove stats not in the stats list
		for (let stat in results[key]) {
			if (stat in aggregates && !stats.includes(stat)) {
				delete results[key][stat];
			}
		}

		// Format the rest
		for (let stat in results[key]) {
			results[key][stat] = toPrecision(results[key][stat]);
		}
	}

	if (sort) {
		results = sortObject(results, sort);
	}

	return { caption, results };
}
