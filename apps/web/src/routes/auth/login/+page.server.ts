import { APP_URL } from '$lib/env';
import { fail, type Actions } from '@sveltejs/kit';
import mono_config from '@config';

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

		const emailRegex = mono_config.auth.email.regex || /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		const email = String(data.get('email') ?? '').trim();
		const password = String(data.get('password') ?? '').trim();
		const rememberMe = data.get('rememberMe') === 'on';

		// VALIDATION — always here
		if (!emailRegex.test(email) || email.length > mono_config.auth.email.maxLength)  {
			return fail(400, { success: false, email, rememberMe, message: 'Invalid Email' });
		}

		const passwordHasLength = password.length <= mono_config.auth.password.maxLength || password.length >= mono_config.auth.password.minLength;
    const passwordHasNumber = mono_config.auth.password.requireNumber ? /\d/.test(password) : true;
    const passwordHasUpper = mono_config.auth.password.requireUppercase ? /[A-Z]/.test(password) : true;
    if (!passwordHasLength) {
			return fail(400, { success: false, email, message: 'Password invalid length' });
		}
		if (!passwordHasNumber) {
			return fail(400, { success: false, email, message: 'Password requires a number' });
		}
		if (!passwordHasUpper) {
			return fail(400, { success: false, email, message: 'Password requires an uppercase letter' });
		}



		return {
			success: true,
			user: { email, rememberMe, password },
			callbackURL,
			message: 'Welcome!'
		};
	}
} satisfies Actions;
