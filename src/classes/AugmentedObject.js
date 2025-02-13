/**
 * A class to support augmenting an object with additional metadata
 * The same object can only produce the same instance, so they can be used interchangeably.
 */
export default class AugmentedObject {
	/**
	 * Map of objects to instances so they can be used interchangeably.
	 */
	static _constructed = new WeakMap();

	constructor (object) {
		if (!object) {
			throw new Error(`Invalid ${this.constructor.name} object: ${object}`);
		}

		if (AugmentedObject._constructed.has(object)) {
			return AugmentedObject._constructed.get(object);
		}

		AugmentedObject._constructed.set(object, this);
		Object.assign(this, object);
	}

	static get (object) {
		if (this._constructed.has(object)) {
			return this._constructed.get(object);
		}

		return new this(object);
	}
}
