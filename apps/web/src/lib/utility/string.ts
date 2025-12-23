/**
 * Returns a possessive form of the given name.
 * - Ends with s/S → apostrophe only
 * - Otherwise → 's or 'S depending on casing
 */
export function toPossessive(value: string): string {
	if (!value) return value;

	const trimmed = value.trim();
	const lastChar = trimmed.slice(-1);

	// Ends with s or S → just apostrophe
	if (lastChar.toLowerCase() === 's') {
		return `${trimmed}'`;
	}

	// Preserve casing for acronyms / all-caps
	const isUpper = lastChar === lastChar.toUpperCase();
	return `${trimmed}${isUpper ? "'S" : "'s"}`;
}
