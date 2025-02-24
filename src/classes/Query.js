import Color from "colorjs.io";
import { extend, capitalize, toArray } from "../util/util.js";

export default class Query {
	static KEY_JOINER = " > ";

	constructor (query) {
		if (query instanceof Query) {
			return query;
		}

		extend(this, Query.defaultOptions, query);

		if (this.component) {
			this.componentMeta = Color.Space.resolveCoord(query.component, "oklch");
		}
	}

	static defaultOptions = {
		get getValue () {
			return color => color.get(this.component);
		},
		by: "tint",
		get getKey () {
			return getDefaultKey(this.by);
		},
		get caption () {
			return getDefaultCaption(this);
		},
		stats: ["min", "max", "median", "count"],
	};
}

function getDefaultKey (by) {
	by = Array.isArray(by) ? by : [by];

	return variables =>
		by.map((variableName, i) => {
			if (variableName === "tint") {
				let tint = String(variables.tint);

				// Drop leading zeros because they throw off row order
				if (tint.startsWith("0") && !tint.endsWith("0")) {
					return tint.replace(/^0+/, "");
				}

				return tint;
			}

			return variables[variableName];
		});
}

function getDefaultCaption (query) {
	let ret = "";

	if (query.component) {
		ret = query.componentMeta?.name ?? query.component;
	}

	if (query.by) {
		ret += ` by ${toArray(query.by).join(" ")}`;
	}

	if (query.filter) {
		let filter = Array.isArray(query.filter) ? query.filter.join(", ") : query.filter;
		ret += ` (${filter})`;
	}

	ret = ret.replace("hue by hue", "hue by color name");

	return capitalize(ret);
}
