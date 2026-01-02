import { APP_URL } from '$lib/env';
import { fail, type Actions } from '@sveltejs/kit';
import mono_config from '@repo/config';

export function load({ locals, url }) {
	return {
		callbackURL: url.searchParams.get('callbackURL') ?? (APP_URL + '/')
	};
	// if(locals.user) {
	//   redirect(302, '/');
	// };
}

export const actions: Actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const callbackURL = url.searchParams.get('callbackURL') ?? (APP_URL + '/');

		const email = String(data.get('email') ?? '').trim();
		const password = String(data.get('password') ?? '').trim();
		const rememberMe = data.get('rememberMe') === 'on';

		// VALIDATION — always here
		if (!email.includes('@') || email.length < 8) {
			return fail(400, { success: false, email, rememberMe, message: 'Invalid Email' });
		}

		const passwordHasLength = password.length >= mono_config.auth.password.maxLength;
    const passwordHasNumber = mono_config.auth.password.requireNumber ? /\d/.test(password) : false;
    const passwordHasUpper = mono_config.auth.password.requireUppercase ? /[A-Z]/.test(password) : false;
		if (!passwordHasLength || !passwordHasNumber || !passwordHasUpper) {
			return fail(400, { success: false, email, rememberMe, message: 'Invalid password' });
		}



		return {
			success: true,
			user: { email, rememberMe, password },
			callbackURL,
			message: 'Welcome!'
		};
	}
} satisfies Actions;
