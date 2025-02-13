import { IS_NODEJS } from "./util/util.js";

/**
 * Fetch a file or URL in either Node.js or the browser
 * If a JS or JSON file (.js, .mjs, .cjs, .json), the function will return data,
 * otherwise it will return the file contents as a string.
 * @param {string} filePath
 * @returns {object | string} The data or file contents
 */
export default async function (filePath) {
	return IS_NODEJS ? getDataNodeJS(filePath) : getDataBrowser(filePath);
}

let nodeImports;

export async function getDataNodeJS (filePath) {
	if (!nodeImports) {
		nodeImports = {};
		for (let id of ["path", "fs", "url"]) {
			nodeImports[id] = await import(id).then(m => m.default ?? m);
		}
	}

	const { path, url } = nodeImports;

	const extension = filePath.split(".").pop();

	if (["js", "mjs"].includes(extension)) {
		let absoluteUrl = url.pathToFileURL(path.resolve(filePath));
		return import(absoluteUrl).then(module => module.default ?? module);
	}
	else if (["cjs", "json"].includes(extension)) {
		// filePath is relative to CWD but require() is relative to this file
		const absolutePath = path.resolve(process.cwd(), filePath);
		return require(absolutePath);
	}
	else {
		const { readFile } = await import("fs/promises");
		return readFile(filePath, "utf8");
	}
}

export async function getDataBrowser (filePath) {
	const extension = filePath.split(".").pop();

	// In the browser, resolve paths relative to location
	let absoluteUrl = new URL(filePath, location).href;

	if (["js", "mjs", "cjs"].includes(extension)) {
		if (extension === "cjs") {
			// Create a global module object to mimic Node.js behavior
			globalThis.module = { exports: {} };
		}

		let importedData = await import(absoluteUrl).then(module => module.default ?? module);

		if (extension !== "cjs") {
			return importedData;
		}

		// For CJS, return the exports object
		let module = globalThis.module.exports;
		delete globalThis.module;
		return module;
	}
	else {
		let response = await fetch(absoluteUrl);

		if (extension === "json") {
			return response.json();
		}
		else {
			return response.text();
		}
	}
}
