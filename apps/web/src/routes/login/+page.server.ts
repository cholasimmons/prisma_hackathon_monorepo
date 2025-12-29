import { authClient } from '$lib/auth-client';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export function load({ locals, url }) {
	return {
		callbackUrl: url.searchParams.get('callbackUrl') ?? '/'
	};
	// if(locals.user) {
	//   redirect(302, '/');
	// };
}

export const actions: Actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const callbackUrl = url.searchParams.get('callbackUrl') ?? '/';

		const email = String(data.get('email') ?? '').trim();
		const password = String(data.get('password') ?? '').trim();
		const rememberMe = data.get('rememberMe') === 'on';

		// VALIDATION — always here
		if (!email.includes('@') || email.length < 8) {
			return fail(400, { success: false, email, rememberMe, message: 'Invalid Email' });
		}

		if (password.length < 8) {
			return fail(400, { success: false, email, rememberMe, message: 'Invalid password' });
		}

		return {
			success: true,
			user: { email, rememberMe, password, callbackUrl },
			message: 'Welcome!'
		};
	}
} satisfies Actions;
