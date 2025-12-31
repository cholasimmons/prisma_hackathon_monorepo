import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, url }) => {
		const callbackURL = url.searchParams.get('callbackURL');

		const data = await request.formData();

		const newPassword = String(data.get('newPassword') ?? '').trim();
		const confirmPassword = String(data.get('confirmPassword') ?? '').trim();


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
			callbackURL,
			message: 'Password updated!'
		};
	}
} satisfies Actions;
