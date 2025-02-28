import Palettes from "./classes/Palettes.js";
import Query from "./classes/Query.js";
import { aggregates, normalizeAngles, toPrecision } from "./util/util.js";
import getSubset from "./util/getSubset.js";
import sortObject from "./util/sortObject.js";

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

	let { getValue, by, getKey, filter, caption, stats, sort } = query;
	let byStr = by ? by + "" : undefined;
	let results = {};
	let used = { ...all };

	let onePerRow = {
		palette: used.palettes.length <= 1 || byStr.includes("palette"),
		hue: used.hues.length <= 1 || byStr.includes("hue"),
		tint: used.tints.length <= 1 || byStr.includes("tint"),
	};

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

			tintloop: for (let tint of tints) {
				let color = palettes[palette][hue][tint];

				let value = getValue.call(palettes, color, { hue, tint, palette }, used, all);
				let key = getKey.call(palettes, color, { hue, tint, palette, value }, used, all);
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
								continue tintloop;
							}
						}
					}
				}

				results[key] ??= [];
				results[key].details ??= {};
				results[key].details[palette] ??= [];
				results[key].details[palette].push(onePerRow.tint ? hue : `${hue}-${tint}`);
				results[key].push(value);
			}
		}
	}

	// Process results
	for (let key in results) {
		let values = results[key];

		let acc = {};
		if (query.excludeOutliers) {
			values = aggregates.excludeOutliers(values, query.excludeOutliers, acc);
		}

		if (query.minCount && values.length < query.minCount) {
			delete results[key];
			continue;
		}

		if (query.componentMeta?.type === "angle") {
			values = normalizeAngles(values);
		}

		let details = results[key].details;

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
		}, acc);

		if (stats.includes("details")) {
			acc.details = details;
		}

		// Remove stats not in the stats list
		for (let stat in results[key]) {
			if (stat in aggregates && !stats.includes(stat)) {
				delete results[key][stat];
			}
		}

		// Format the rest and make sure it's in the order specified
		for (let stat of stats) {
			let value = results[key][stat];
			delete results[key][stat];

			if (stat === "details") {
				let entries = Object.entries(value).map(([palette, colors]) => [
					palette,
					colors.join(", "),
				]);
				value = entries
					.map(([palette, colors]) =>
						onePerRow.palette ? colors : `${palette} (${colors})`)
					.join(", ");
			}
			else {
				value = toPrecision(value);
			}

			results[key][stat] = value;
		}
	}

	if (sort) {
		results = sortObject(results, sort);
	}

	return { caption, results };
}
