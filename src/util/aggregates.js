// First order aggregates
// These are aggregates that operate on the values directly.

export function min (values) {
	return Math.min(...values.filter(v => !isNaN(v)));
}

export function max (values) {
	return Math.max(...values.filter(v => !isNaN(v)));
}

/**
 * Average (mean) of the values
 * @param {*} values
 * @returns
 */
export function avg (values) {
	return values.filter(v => !isNaN(v)).reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Count of the values
 * @param {number[]} values
 * @returns {number}
 */
export function count (values) {
	return values?.length ?? 0;
}

/**
 * Just returns the values
 * @param {any[]} values
 * @returns {any[]}
 */
export function values (values) {
	return values;
}

/**
 * Just returns the first value (mainly useful for single-value queries)
 * @param {any[]} values
 * @returns {any}
 */
export function value (values) {
	return values[0];
}

export function median (values) {
	let sorted = values.slice().sort((a, b) => a - b);
	let mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// Second order aggregates
// These are aggregates that operate on the results of other aggregates

export function stddev (values, aggregates) {
	aggregates.avg ??= avg(values);
	let squaredDiffs = values.map(v => Math.pow(v - aggregates.avg, 2));
	return Math.sqrt(avg(squaredDiffs));
}

/**
 * Extent of the range between the min and max values
 * @param {number[]} values
 * @param {object} [aggregates] Precomputed min and max values, if available
 * @returns {number}
 */
export function extent (values, aggregates) {
	aggregates.min ??= min(values);
	aggregates.max ??= max(values);
	return aggregates.max - aggregates.min;
}

/**
 * Midpoint between the min and max values
 * @param {*} values
 * @param {object} [aggregates] Precomputed min and max values, if available
 * @returns {number}
 */
export function mid (values, aggregates) {
	aggregates.min ??= min(values);
	aggregates.max ??= max(values);
	return (aggregates.max + aggregates.min) / 2;
}
