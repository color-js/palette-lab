import { glob } from "glob";
import { getStats, getData, getPalette } from "../src/index.js";
import * as output from "../src/output.js";
import defaultQueries from "../queries/default.js";

let args = process.argv.slice(2);

let paletteSource = args.shift();
let paletteFiles = await glob(paletteSource, { ignore: "node_modules/**" });

if (paletteFiles.length === 0) {
	console.error(`No palettes found for ${paletteSource}`);
	process.exit(1);
}

let palettes = {};
let firstValue;

for (let filePath of paletteFiles) {
	let filename = filePath.split("/").pop();
	let name = filename.split(".").shift(); // drop extension
	palettes[name] = await getPalette(filePath);
	firstValue ??= palettes[name];
}

if (firstValue && firstValue.constructor.name === "Palettes") {
	// Each file contains multiple palettes, flatten
	palettes = Object.assign(...Object.values(palettes));
}

let settingsArgs = args.filter(arg => arg.startsWith("--"));
let filter = args.filter(arg => !arg.startsWith("--"));
let settings = {};

if (settingsArgs.length > 0) {
	settingsArgs = settingsArgs.map(setting => setting.slice(2));
	settings = Object.fromEntries(
		settingsArgs.map(setting => {
			let [key, value] = setting.split("=");
			return [key, value ?? true];
		}),
	);
}

if (settings.queries) {
	// Queries file(s)
	let queriesFiles = await glob(settings.queries, { ignore: "node_modules/**" });

	if (queriesFiles.length === 0) {
		// Try again assuming it's a filename from queries/
		queriesFiles = await glob(`queries/${settings.queries}.js`, { ignore: "node_modules/**" });
	}

	settings.queries = (await Promise.all(queriesFiles.map(filePath => getData(filePath)))).flat();
}
else if (filter.length > 0 && settingsArgs.length > 0) {
	// No queries file, but queries in arguments
	settings.queries = { filter, ...settings };
	filter = undefined;
}
else {
	// Pull in default queries
	settings.queries = defaultQueries;
}

let results;

try {
	results = getStats(palettes, { queries: settings.queries, filter, ...settings });
}
catch (e) {
	console.error(e);
	console.info(`Palette data: { ${Object.keys(palettes).join(", ")} }`);
	// process.exit(1);
}

output[settings.output ?? "console"](results);
