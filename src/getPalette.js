import getData from "./getData.js";
import Palette from "./classes/Palette.js";
import Palettes from "./classes/Palettes.js";
import { getFirstPath } from "./util/util.js";
import Color from "colorjs.io";

export function getDeclarationRegex (prefix, language = "css") {
	let variablePrefix = language === "css" ? "--" : "\\$";
	return RegExp(
		`^\\s*${variablePrefix}${prefix}(?<hue>[a-z]+)-(?<level>[0-9]+):\\s*(?<color>.+?)\\s*(\\/\\*.+?\\*\\/)?\\s*;$`,
		"gm",
	);
}

/**
 * Read a palette from a variety of file types
 * @param {string} filePath - Path or URL to the file to read
 * @returns
 */
export default async function (filePath, options = {}) {
	let contents = await getData(filePath);

	if (typeof contents === "object") {
		// Already parsed
		let firstPath = getFirstPath(contents, {
			stopIf (obj) {
				return (
					!["Object", "Palettes", "Palette", "Scale"].includes(obj.constructor.name) ||
					"parseMeta" in obj // Color object
				);
			},
		});
		let multiplePalettes = firstPath.length > 2;
		return multiplePalettes ? Palettes.get(contents) : Palette.get(contents);
	}

	let filename = filePath.split("/").pop();
	let extension = filename.split(".").pop();

	if (!["css", "scss"].includes(extension)) {
		// Can’t really do anything here
		throw new Error(`Unsupported file type: ${extension} (path was: ${filePath})`);
	}

	let { prefix, colorSpace = "oklch" } = options;
	let declarationRegex = getDeclarationRegex(prefix ?? "(?<prefix>[a-z-]*-)?", extension);
	let declarations = [...contents.matchAll(declarationRegex)];

	if (declarations.length === 0) {
		console.warn(`Empty palette: ${filePath}`);
		return {};
	}

	let retByPrefix = {};
	let statsByPrefix = {};

	for (let match of declarations) {
		let { prefix: declarationPrefix, hue, level, color } = match.groups;
		let ret = (retByPrefix[declarationPrefix] ??= {});
		ret[hue] ??= {};

		if (level.startsWith("0") && !level.endsWith("0")) {
			// Leading zeroes throw off sorting
			// level = level.replace(/^0+/, "");
		}

		statsByPrefix[declarationPrefix] ??= { colors: 0, errors: 0 };

		try {
			color = new Color(color);
		}
		catch (e) {
			statsByPrefix[declarationPrefix].errors++;
			continue;
		}

		statsByPrefix[declarationPrefix].colors++;

		if (colorSpace) {
			color = color.to(colorSpace);
		}

		ret[hue][level] = color;
	}

	if (prefix === undefined) {
		// Detect prefix based on which one had the most valid colors
		let maxColors = 0;

		for (let candidatePrefix in statsByPrefix) {
			let stats = statsByPrefix[candidatePrefix];

			if (stats.colors > maxColors) {
				maxColors = stats.colors;
				prefix = candidatePrefix;
			}
		}

		if (prefix === undefined) {
			console.warn(`[${filename}] No valid colors found`);
			return {};
		}

		console.info(`[${filename}] Detected prefix: ${prefix}`);
	}

	let ret = retByPrefix[prefix];
	return Palette.get(ret);
}
