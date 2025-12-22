import { hexToColorName } from '$lib/color/colors';
import { canonicalizeMake, normalizeMake } from '$lib/vehicles/make';
import { formatPlateInput } from '$lib/vehicles/plate';
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export function load({ locals }) {
	if (!locals.user) {
		throw redirect(302, '/login');
	}
}

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const data = await request.formData();

		const plate = String(data.get('plate') ?? '').trim();
		if (!plate) {
			return fail(400, { message: 'Plate number required' });
		}

		const color = data.get('color') as string | null;
		if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
			return fail(400, { error: 'Invalid color value' });
		}

		// const colorName = color
		// 		? hexToColorName(color)
		// 		: null;

		const make = String(data.get('make') ?? '').trim();
		if (!/^[A-Za-z][A-Za-z\s'-]{1,48}$/.test(make)) {
			return fail(400, { message: 'Vehicle Make not acceptable' });
		}

		const model = String(data.get('model') ?? '').trim();
		if (!/^[A-Za-z0-9][A-Za-z0-9\s-]{0,48}$/.test(model)) {
			return fail(400, { message: 'Model not acceptable' });
		}

		const year = Number(data.get('year') ?? '');
		const currentYear = new Date().getFullYear();
		if (!Number.isInteger(year) || (year >= 1900 && year <= currentYear)) {
			return fail(400, { message: 'Year not acceptable' });
		}

		const forSale = Boolean(data.get('forSale') === 'on');

		const photos = data.getAll('photos') as File[];
		if (photos.some((f) => f.size > 3_000_000))
			return fail(400, { message: 'Photo must be ≤ 3MB' });
		if (photos.length > 3) return fail(400, { message: 'Max 1 photo allowed' });

		return {
			success: true,
			vehicle: {
				plate: formatPlateInput(plate, { allowTrailingSpace: false }),
				make: canonicalizeMake(normalizeMake(make)),
				color,
				model,
				year,
				forSale,
				photos
			}
		}; // submittedById: locals.user.id
	}
};
