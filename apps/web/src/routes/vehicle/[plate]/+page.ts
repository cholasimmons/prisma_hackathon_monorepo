import { api } from '$lib/api/client';
import type { Vehicle } from '$lib/models/vehicle.model';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ params, fetch }) => {
	const { plate } = params;

	const vehicle = await api.get<Vehicle>(`/vehicles/${encodeURIComponent(plate)}`);
	if (!vehicle) {
		throw error(404, 'Vehicle not found');
	}

	// const data = await vehicle.json();
	return { vehicle };
}) satisfies PageLoad;
