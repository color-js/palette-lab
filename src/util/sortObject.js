export default function sortObject (obj, sort) {
	if (!sort) {
		return obj;
	}

	let keys = Object.keys(obj);

	let order;
	if (Array.isArray(sort)) {
		[sort, order] = sort;
	}
	else if (sort === "desc") {
		order = "desc";
	}

	let sortFactor = order === "desc" ? -1 : 1;
	if (sort === true) {
		// Sort by key, lexically
		keys = keys.sort(Intl.Collator().compare);
	}
	else if (sort === "numeric") {
		// Sort
		keys = keys.sort((a, b) => sortFactor * (a - b));
	}
	else if (typeof sort === "string") {
		// Sort by key in the values
		keys = keys.sort((a, b) => {
			return sortFactor * (obj[a][sort] - obj[b][sort]);
		});
	}
	else {
		keys.sort(sort);
	}

	return Object.fromEntries(
		keys.map(key => {
			// Add space after key to avoid numbers being listed first
			let sortedKey = isNaN(key) ? key : key + " ";
			return [sortedKey, obj[key]];
		}),
	);
}
