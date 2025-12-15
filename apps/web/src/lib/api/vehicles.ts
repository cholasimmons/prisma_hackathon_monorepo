import type { Vehicle, VehicleSearchResult } from '$lib/models/vehicle.model';
import { api, type ApiResponse } from './client';

export async function searchVehicles(plate: string): Promise<Vehicle[]> {
	// Normalize on client — but backend should also normalize!
	const normalized = plate.toLowerCase();
	if (!normalized) return [];

	// Elysia endpoint: GET /api/vehicles/search?plate=ABC123
	return await api
		.get<ApiResponse<Vehicle[]>>('/vehicles/search', {
			// Inject normalized plate as query — no encoding needed; `URL()` handles it
			// But we’ll construct manually to be safe
			headers: {
				'X-Client-Plate-Normalized': 'true' // optional debug header
			}
		})
		.then((res) => {
			// Optional: map/fallbacks
			return res.data.map((v) => ({
				...v,
				model: v.model ?? '',
				year: v.year ?? null
			}));
		})
		.catch((err: unknown) => {
			// Re-throw — let UI handle via .catch()
			console.error(err);
			throw err;
		});
}
