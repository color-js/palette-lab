import Palettes from "./classes/Palettes.js";
import query from "./query.js";
import { toArray } from "./util/util.js";
import getSubset from "./util/getSubset.js";

/**
 * Run multiple queries against a set of palettes.
 * @param {*} palettes
 * @param {*} options
 * @returns {Array<{ caption: string, results: Object }>}
 */
export default function (palettes, { queries, filter, ...options } = {}) {
	queries = toArray(queries);

	palettes = Palettes.get(palettes);
	let all = Palettes.allKeys;

	for (let key in all) {
		if (!all[key]) {
			throw new Error(`No ${key} found.`);
		}
	}

	let used = getSubset(all, filter);
	let results = [];

	for (let q of queries) {
		let result = query(palettes, q, { all: used, ...options });
		results.push(result);
	}

	return results;
}
