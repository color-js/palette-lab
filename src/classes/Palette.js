import AugmentedObject from "./AugmentedObject.js";
import Scale from "./Scale.js";
export { Scale };

/**
 * Augments a palette object with additional metadata
 */
export default class Palette extends AugmentedObject {
	static #hues;

	constructor (palette) {
		super(palette);

		Palette.#hues ??= Object.keys(palette);

		for (let hue in palette) {
			this[hue] = new Scale(palette[hue]);
		}
	}

	static get hues () {
		return this.#hues ?? [];
	}

	static get tints () {
		return Scale.tints;
	}

	static isHue (key) {
		return this.hues.includes(key);
	}
}
