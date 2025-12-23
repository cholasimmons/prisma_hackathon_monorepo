const logoCache = new Map<string, string | null>();

const FALLBACK_LOGO = '/logos/default-make-logo.webp';

/**
 * Normalize make names so "Land Rover", "land-rover", "LAND ROVER" all match
 */
function normalizeMake(make: string): string {
	return make.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Resolve a logo URL for a vehicle make.
 * Caches results (including failures).
 */
export async function getMakeLogo(make: string): Promise<string> {
	const key = normalizeMake(make);

	if (logoCache.has(key)) {
		return logoCache.get(key)!;
	}

	const url = `/logos/${key}.svg`;

	// HEAD request is cheap and avoids downloading image twice
	const exists = await fetch(url, { method: 'HEAD' })
		.then((r) => r.ok)
		.catch(() => false);

	const resolved = exists ? url : FALLBACK_LOGO;
	logoCache.set(key, resolved);

	return resolved;
}
