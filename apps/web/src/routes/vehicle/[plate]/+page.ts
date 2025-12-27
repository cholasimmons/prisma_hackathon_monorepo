import { api } from '$lib/api/client';
import type { Vehicle } from '$lib/models/vehicle.model';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = (async ({ params, fetch }) => {
	if(!params || !params.plate || params.plate.trim() === '') {
	  throw error(400, 'Vehicle plate number is required');
	}

	console.log('page.ts params:', params);
	console.log('page.ts params plate:', params.plate);

	// const response = await api.get<Vehicle>(`/vehicles/${encodeURIComponent(plate)}`);
	// const vehicle = response.data;

	// if (!vehicle) {
	// 	throw error(404, 'Vehicle not found');
	// }

	// // const data = await vehicle.json();
	// return { vehicle };
}) satisfies PageLoad;
