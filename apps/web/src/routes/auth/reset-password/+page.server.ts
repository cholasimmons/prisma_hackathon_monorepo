import { fail, type Actions } from '@sveltejs/kit';

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

		const passwordHasLength = newPassword.length >= 6;
    // const passwordHasNumber = /\d/.test(password);
    // const passwordHasUpper = /[A-Z]/.test(password);
		if (!passwordHasLength) {
			return fail(400, { success: false, message: 'Invalid password' });
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
