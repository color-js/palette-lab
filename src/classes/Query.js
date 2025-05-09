import Color from "colorjs.io";
import { extend, capitalize, toArray } from "../util/util.js";
import parseFilter from "../util/parseFilter.js";

export default class Query {
	static KEY_JOINER = " > ";

	constructor (query) {
		if (query instanceof Query) {
			return query;
		}

		extend(this, Query.defaultOptions, query);

		if (this.filter) {
			this.filter = parseFilter(this.filter);
		}

		if (this.component && this.component !== "tint") {
			this.componentMeta = Color.Space.resolveCoord(query.component, "oklch");
		}
	}

	static defaultOptions = {
		get getValue () {
			if (this.component === "tint") {
				return (color, variables) => variables.tint;
			}

			return color => color.get(this.component);
		},
		by: "tint",
		get getKey () {
			return getDefaultKey(this.by);
		},
		get caption () {
			return getDefaultCaption(this);
		},
		stats: ["min", "max", "median", "avg", "stddev", "count"],
	};
}

function getDefaultKey (by) {
	by = Array.isArray(by) ? by : [by];

	return (color, variables) =>
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
		ret += ` (${query.filter.source.join(", ")})`;
	}

	ret = ret.replace("hue by hue", "hue by color name");

	return capitalize(ret);
}
