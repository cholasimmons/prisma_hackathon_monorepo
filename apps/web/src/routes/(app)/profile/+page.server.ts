import { redirect, type Actions } from '@sveltejs/kit';

export function load({ locals }) {
	if (!locals.user) {
		redirect(302, '/');
	}
}

// export const actions: Actions = {
// updateProfile: async ({ request, locals }) => {
// 	assertSameOrigin(request);

// 	// locals.user is guaranteed here
// 	const userId = locals.user!.id ?? null;

// 	// safe mutation
// };
