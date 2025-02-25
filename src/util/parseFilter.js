import Scale from "../classes/Scale.js";
import Palette from "../classes/Palette.js";

import { toArray } from "./util.js";

export default function (filter) {
	filter = toArray(filter);

	let ret = {
		tints: [],
		hues: [],
		palettes: [],
		other: [],
		source: filter,
	};

	for (let arg of filter) {
		if (typeof arg === "function") {
			ret.other.push(arg);
			continue;
		}

		let not = arg.startsWith("-");
		let value = not ? arg.slice(1) : arg;
		let key = Scale.isTint(value) ? "tints" : Palette.isHue(value) ? "hues" : "palettes";

		ret[key].push({ value, not });
	}

	return ret;
}
