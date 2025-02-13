import parseFilter from "./parseFilter.js";

/**
 * Apply a list of args (hues, tints, palette ids) to add or exclude against the corresponding arrays
 */
export default function getSubset (all, filter) {
	filter = parseFilter(filter);

	let used = {
		tints: undefined,
		hues: undefined,
		palettes: undefined,
	};

	for (let key in filter) {
		for (let arg of filter[key]) {
			let { not, value } = arg;

			if (not) {
				// Start from all values, and progressively reduce with every negative filter
				used[key] = (used[key] ?? all[key]).filter(v => v !== value);
			}
			else {
				used[key] ??= [];
				used[key].push(value);
			}
		}
	}

	// If no filters, use all values
	for (let key in used) {
		used[key] ??= all[key].slice();
	}

	return used;
}
