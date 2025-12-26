import type { Vehicle, VehicleSubmission } from '$lib/models/vehicle.model';
import { api } from './client';

async function searchVehicles(plate: string): Promise<Vehicle[]> {
	// Normalize on client — but backend should also normalize!
	const normalized = plate.trim();
	if (!normalized) return [];

	const response = await api.get<Vehicle[]>(
		`/vehicles/search?plate=${encodeURIComponent(normalized)}`
	);

	const payload = response.data;

	if (!Array.isArray(payload)) {
		// console.error('Unexpected Vehicle API response', payload);
		return [];
	}

	// Elysia endpoint: GET /vehicles/search?plate=ABC123
	return payload.map((v: Vehicle) => ({
		...v,
		model: v.model ?? '',
		year: v.year ?? null
	}));
}

async function mySubmittedVehicles(): Promise<VehicleSubmission[] | null> {
	const response = await api.get<VehicleSubmission[]>(`/vehicles/submissions`);

	const payload = response.data;

	if (!Array.isArray(payload)) {
		// console.error('Unexpected Vehicle API response', payload);
		return [];
	}

	// Elysia endpoint: GET /vehicles/search?plate=ABC123
	return payload.map((v: VehicleSubmission) => ({
		...v,
		model: v.model ?? '',
		year: v.year ?? null
	}));
}

export { searchVehicles, mySubmittedVehicles };
