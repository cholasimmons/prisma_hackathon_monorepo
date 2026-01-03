import { fail, type Actions } from '@sveltejs/kit';
import mono_config from "@config";

export const actions: Actions = {
	default: async ({ request, url }) => {
		const callbackURL = url.searchParams.get('callbackURL');
    const token = url.searchParams.get('token');

		const data = await request.formData();

		const newPassword = String(data.get('newPassword') ?? '').trim();
		const confirmPassword = String(data.get('confirmPassword') ?? '').trim();

		if (!token || token.length < 64) {
			return fail(400, { success: false, message: 'Invalid reset token' });
		}

		const passwordHasLength = newPassword.length >= mono_config.auth.password.maxLength;
    const passwordHasNumber = mono_config.auth.password.requireNumber ? /\d/.test(newPassword) : false;
    const passwordHasUpper = mono_config.auth.password.requireUppercase ? /[A-Z]/.test(newPassword) : false;
    if (!passwordHasLength) {
			return fail(400, { success: false, message: 'Password invalid length' });
		}
		if (!passwordHasNumber) {
			return fail(400, { success: false, message: 'Password requires a number' });
		}
		if (!passwordHasUpper) {
			return fail(400, { success: false, message: 'Password requires an uppercase letter' });
		}
		if (newPassword !== confirmPassword) {
			return fail(400, { success: false, message: 'Passwords do not match' });
		}

		return {
			success: true,
			user: { newPassword },
			callbackURL, token,
			message: 'Password updated!'
		};
	}
} satisfies Actions;
