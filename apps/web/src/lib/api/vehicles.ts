import type { Vehicle } from '$lib/models/vehicle.model';
import { api } from './client';

async function searchVehicles(plate: string): Promise<Vehicle[]> {
	// Normalize on client — but backend should also normalize!
	const normalized = plate.trim().toLowerCase();
	if (!normalized) return [];

	const payload = await api.get<Vehicle[]>(
		`/vehicles/search?plate=${encodeURIComponent(normalized)}`
	);

	if (!Array.isArray(payload)) {
		console.error('Unexpected Vehicle API response', payload);
		return [];
	}

	// Elysia endpoint: GET /vehicles/search?plate=ABC123
	return payload.map((v: Vehicle) => ({
		...v,
		model: v.model ?? '',
		year: v.year ?? null
	}));
}

export { searchVehicles };
