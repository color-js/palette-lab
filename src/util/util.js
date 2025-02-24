import * as aggregates from "./aggregates.js";
export { aggregates };

export const IS_NODEJS = typeof process === "object" && process + "" === "[object process]";

export function clamp (min, value, max) {
	if (min !== undefined) {
		value = Math.max(min, value);
	}

	if (max !== undefined) {
		value = Math.min(max, value);
	}

	return value;
}

export function toPrecision (value, precision = 2) {
	if (isNaN(value)) {
		return value;
	}

	return +Number(value).toPrecision(precision);
}

export function roundTo (value, roundTo = 1) {
	let decimals = roundTo.toString().split(".")[1]?.length ?? 0;
	let ret = Math.round(value / roundTo) * roundTo;

	if (decimals > 0) {
		// Eliminate IEEE 754 floating point errors
		ret = +ret.toFixed(decimals);
	}

	return ret;
}

export function normalizeAngles (angles) {
	// First, normalize
	angles = angles.map(h => ((h % 360) + 360) % 360);

	// Remove top and bottom 25% and find average
	let averageHue =
		angles
			.toSorted((a, b) => a - b)
			.slice(angles.length / 4, -angles.length / 4)
			.reduce((a, b) => a + b, 0) / angles.length;

	for (let i = 0; i < angles.length; i++) {
		let h = angles[i];
		let prevHue = angles[i - 1];
		let delta = h - prevHue;

		if (Math.abs(delta) > 180) {
			let equivalent = [h + 360, h - 360];
			// Offset hue to minimize difference in the direction that brings it closer to the average
			let delta = h - averageHue;

			if (Math.abs(equivalent[0] - prevHue) <= Math.abs(equivalent[1] - prevHue)) {
				angles[i] = equivalent[0];
			}
			else {
				angles[i] = equivalent[1];
			}
		}
	}

	return angles;
}

export function capitalize (str) {
	if (!str) {
		return "";
	}

	str = String(str);
	return str[0].toUpperCase() + str.slice(1);
}

/**
 * Like Object.assign() but copies descriptors rather than triggering getters.
 * Only copies own properties.
 */
export function extend (target, ...sources) {
	let descriptors = {};

	for (let source of sources) {
		Object.assign(descriptors, Object.getOwnPropertyDescriptors(source));
	}

	for (let key in descriptors) {
		Object.defineProperty(target, key, descriptors[key]);
	}

	return target;
}

/**
 * Convert a value to an array. `undefined` and `null` values are converted to an empty array.
 * @param {*} value - The value to convert.
 * @returns {any[]} The converted array.
 */
export function toArray (value) {
	if (value === undefined || value === null) {
		return [];
	}

	if (Array.isArray(value)) {
		return value;
	}

	// Don't convert "foo" into ["f", "o", "o"]
	if (typeof value !== "string" && typeof value[Symbol.iterator] === "function") {
		return Array.from(value);
	}

	return [value];
}

export function getFirstPath (obj, options = {}, depth = 0) {
	if (!obj || typeof obj !== "object" || options.stopIf?.(obj, depth)) {
		// Terminal value
		return [];
	}

	for (let key in obj) {
		return [key, ...getFirstPath(obj[key], options, ++depth)];
	}
}
