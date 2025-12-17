import { assertSameOrigin } from '$lib/server/csrf';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		assertSameOrigin(request);

		// locals.user is guaranteed here
		const userId = locals.user!.id ?? null;

		// safe mutation
	}
};
