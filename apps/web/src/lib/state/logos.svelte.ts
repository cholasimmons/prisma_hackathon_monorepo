import { api } from '$lib/api/client';

let _logos = $state([]);
let _loadingLogos = $state(true);
let _initialized = false;

// Export *accessors* (not the state variables directly)
export function logos() {
	return _logos;
}

export function loadingLogos() {
	return _loadingLogos;
}

// Background fetch (non-blocking)
export async function fetchLogos() {
	if (_initialized) return; // Prevent duplicate fetches

	_initialized = true;

	_loadingLogos = true;

	try {
		const r = await api.raw('/logos');
		const data = await r.json();

		console.log('data:', data);

		_logos = data;
		localStorage.setItem('logos', JSON.stringify(data));
	} catch (err) {
		console.error('Failed to fetch logos', err);
	} finally {
		_loadingLogos = false;
	}
}
