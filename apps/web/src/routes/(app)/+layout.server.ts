import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from '../$types';
import { BUN_ENV } from '$env/static/private';

export const load: LayoutServerLoad = ({ locals, url }) => {
	const callbackURL = url.pathname + url.search;

	if (BUN_ENV === 'development') {
		return {
			user: {
				id: '123',
				email: 'email@example.com',
				name: 'Frank Simmons',
				image: '',
				role: 'admin',
				emailVerified: false,
				banned: true,
				banReason: 'Spamming'
			}
		};
	} else {
		if (!locals.session || !locals.user) {
			throw redirect(302, `/auth/login?callbackURL=${encodeURIComponent(callbackURL)}`);
		}
	}

	// authenticated users proceed
	return { user: locals.user };
};
