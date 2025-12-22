type FormatPlateOptions = {
	maxLength?: number;
	maxParts?: number; // parts split by spaces
	allowTrailingSpace?: boolean;
};

const DEFAULT_OPTIONS: Required<FormatPlateOptions> = {
	maxLength: 12,
	maxParts: 3, // 2 spaces max
	allowTrailingSpace: true
};

/**
 * Formats a vehicle plate string for user input or normalization.
 * Safe for UI + server usage.
 */
function formatPlateInput(
	rawInput: string,
	options: FormatPlateOptions = {}
): string {
	const { maxLength, maxParts, allowTrailingSpace } = {
		...DEFAULT_OPTIONS,
		...options
	};

	// 1. Uppercase
	let v = rawInput.toUpperCase();

	// 2. Remove invalid chars: keep A-Z, 0-9, space
	v = v.replace(/[^A-Z0-9 ]/g, '');

	// 3. Collapse whitespace → single space
	v = v.replace(/\s+/g, ' ');

	// 4. Enforce max parts (spaces)
	const parts = v.split(' ').filter(Boolean);
	if (parts.length > maxParts) {
		v = parts.slice(0, maxParts).join(' ');
	}

	// 5. Enforce max length
	v = v.slice(0, maxLength);

	// 6. Trailing-space logic (important for typing UX)
	if (allowTrailingSpace && v.endsWith(' ') && v.length < maxLength) {
		return v;
	}

	return v.trim();
}

export { formatPlateInput }