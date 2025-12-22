import namer from 'color-namer';

type NamedColor = {
	hex: string;
	name: string;
};

/**
 * Converts a hex color to a readable name.
 * Falls back gracefully.
 */
function hexToColorName(hex: string): string {
	try {
		const names = namer(hex, { pick: ['basic','ntc'] });
		return names.ntc[0]?.name ?? 'Unknown';
	} catch {
		return 'Unknown color';
	}
}

export type { NamedColor }
export { hexToColorName }