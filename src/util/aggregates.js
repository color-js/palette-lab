// First order aggregates
// These are aggregates that operate on the values directly.
export function excludeOutliers (values, threshold = 3, aggregates) {
	if (values.length <= 1) {
		return values;
	}

	if (Array.isArray(threshold)) {
		let [count, unit] = threshold;

		if (unit === "stddev") {
			aggregates.stddev ??= stddev(values, aggregates);
			aggregates.avg ??= avg(values);
			threshold = count * aggregates.stddev;
			return values.filter(v => Math.abs(v - aggregates.avg) <= threshold);
		}
		else if (unit === "%" || unit === "percent") {
			threshold = (count / 100) * values.length;
		}
	}

	threshold = Math.round(threshold);

	values.sort((a, b) => a - b);

	if (2 * threshold + 1 > values.length) {
		// If the threshold is greater than half the length of the array, just return the middle value
		return [values[Math.floor(values.length / 2)]];
	}

	return values.slice(threshold, -threshold);
}

export function min (values, aggregates) {
	values = values.filter(v => !isNaN(v));
	let minValue = Math.min(...values);
	aggregates.minValues = values.filter(v => v === minValue);
	return minValue;
}

export function minValues (values, aggregates) {
	aggregates.min ??= min(values);
	return aggregates.minValues;
}

export function max (values, aggregates) {
	values = values.filter(v => !isNaN(v));
	let maxValue = Math.max(...values);
	aggregates.maxValues = values.filter(v => v === maxValue);
	return maxValue;
}

export function maxValues (values, aggregates) {
	aggregates.max ??= max(values);
	return aggregates.maxValues;
}

export function minAbs (values) {
	values = values.filter(v => !isNaN(v)).map(Math.abs);
	return Math.min(...values);
}

export function maxAbs (values) {
	values = values.filter(v => !isNaN(v)).map(Math.abs);
	return Math.max(...values);
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
	if (values.length <= 1) {
		return 0;
	}

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
	if (values.length <= 1) {
		return 0;
	}

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
