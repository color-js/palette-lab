import Color from "colorjs.io";
import AugmentedObject from "./AugmentedObject.js";
import { clamp } from "../util/util.js";

const CORE_TINT_MICROSYNTAX = /^core\s*((?<op>[-+±])\s*(?<offset>\d+))?$/;

/**
 * Augments a scale of tints with additional metadata
 */
export default class Scale extends AugmentedObject {
	#maxChromaTint;
	static #tints;

	/** Default accent tint if all chromas are 0, but also the tint accent colors will be nudged towards (see CHROMA_TOLERANCE) */
	static DEFAULT_CORE_TINT;

	/** Min core tint. If below that, it will be clamped. */
	static MIN_CORE_TINT;

	/** Max core tint. If above that, it will be clamped. */
	static MAX_CORE_TINT;

	/** Chroma tolerance: Chroma will need to differ more than this to gravitate away from DEFAULT_CORE_TINT */
	static CHROMA_TOLERANCE = 0.000001;

	/** Color space to convert the tints to */
	static COLOR_SPACE = "oklch";

	constructor (scale) {
		super(scale);

		for (let tint in scale) {
			let color = scale[tint];
			if (Array.isArray(color)) {
				// Coordinates only
				this[tint] = new Color(Scale.COLOR_SPACE, color);
			}
			else {
				try {
					this[tint] = Color.get(color).to(Scale.COLOR_SPACE);
				}
				catch (e) {
					// console.error(`Error parsing color ${color} for tint "${tint}"`);
				}
			}
		}

		if (!Scale.#tints) {
			let tints = Object.keys(scale);
			Scale.#tints = tints;
			Scale.DEFAULT_CORE_TINT ??= tints[Math.round((tints.length - 1) / 2)];
			Scale.MIN_CORE_TINT ??= tints[1];
			Scale.MAX_CORE_TINT ??= tints[tints.length - 2];
		}
	}

	get maxChromaTint () {
		if (this.#maxChromaTint === undefined) {
			this.#maxChromaTint = Scale.DEFAULT_CORE_TINT;

			let maxChroma = this[this.#maxChromaTint].get("oklch.c") || 0;

			for (let tint in this) {
				if (this[tint].get("oklch.c") > maxChroma + Scale.CHROMA_TOLERANCE) {
					maxChroma = this[tint].get("c");
					this.#maxChromaTint = tint;
				}
			}
		}

		return this.#maxChromaTint;
	}

	get maxChroma () {
		return this[this.maxChromaTint].get("oklch.c");
	}

	get coreTint () {
		return clamp(Scale.MIN_CORE_TINT, this.maxChromaTint, Scale.MAX_CORE_TINT);
	}

	get minTint () {
		return Math.min(...Scale.tints);
	}

	get maxTint () {
		return Math.max(...Scale.tints);
	}

	get min () {
		return this[this.minTint];
	}

	get max () {
		return this[this.maxTint];
	}

	get coreTintChroma () {
		return this[this.coreTint].get("oklch.c");
	}

	getIndex (tint) {
		// Loose equals to account for string vs number
		return Scale.tints.findIndex(t => t == tint);
	}

	getNext (tint, offset = 1) {
		let tintIndex = this.getIndex(tint);
		return Scale.tints[tintIndex + offset];
	}

	getPrevious (tint, offset = 1) {
		let tintIndex = this.getIndex(tint);
		return Scale.tints[tintIndex - offset];
	}

	resolveTint (tint, coreTint) {
		if (CORE_TINT_MICROSYNTAX.test(tint)) {
			let { op, offset } = CORE_TINT_MICROSYNTAX.exec(tint).groups;
			offset = Number(offset);

			if (!offset) {
				// Just "core" (or "core ± 0")
				return coreTint;
			}

			let startOffset = 0;
			let endOffset = 0;

			if (op !== "-") {
				// + or ±
				endOffset = offset;
			}

			if (op !== "+") {
				// - or ±
				startOffset = -offset;
			}

			let allTints = Scale.tints;
			let coreTintIndex = allTints.indexOf(String(coreTint));
			let start = clamp(0, coreTintIndex + startOffset);
			let end = clamp(coreTintIndex, coreTintIndex + endOffset + 1, allTints.length);

			return allTints.slice(start, end);
		}

		if (tint in this) {
			return tint;
		}

		return [];
	}

	static isTint (tint) {
		return this.tints.includes(tint) || CORE_TINT_MICROSYNTAX.test(tint);
	}

	static get tints () {
		return this.#tints;
	}
}
