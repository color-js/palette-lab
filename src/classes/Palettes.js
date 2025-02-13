import AugmentedObject from "./AugmentedObject.js";
import Palette, { Scale } from "./Palette.js";
export { Palette, Scale };

/**
 * Augments a palette object with additional metadata
 */
export default class Palettes extends AugmentedObject {
	static #ids;

	constructor (palettes) {
		super(palettes);

		Palettes.#ids ??= Object.keys(palettes);

		for (let id in palettes) {
			try {
				this[id] = Palette.get(palettes[id]);
			}
			catch (e) {
				console.error(`Error when processing palette "${id}": ${e.message}`);
			}
		}
	}

	static get ids () {
		return this.#ids ?? [];
	}

	static get hues () {
		return Palette.hues;
	}

	static get tints () {
		return Palette.tints;
	}
}
