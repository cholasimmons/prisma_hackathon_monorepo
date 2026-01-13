import { BUN_ENV } from '$env/static/private';
import { PUBLIC_S3_ENDPOINT, PUBLIC_S3_BUCKET } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
	if (BUN_ENV === 'production') {
		return {
			user: locals.user ?? null,
			session: locals.session ?? null,
			apiDown: locals.apiDown ?? false,
			s3Endpoint: PUBLIC_S3_ENDPOINT,
			s3Bucket: PUBLIC_S3_BUCKET
		};
	} else if (BUN_ENV === 'development') {
		return {
			user: {
				id: '1',
				email: 'admin@example.com',
				emailVerified: false,
				role: 'admin',
				name: 'Frank Simmons'
			},
			session: { id: '1', userId: '1', expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
			apiDown: false,
			s3Endpoint: PUBLIC_S3_ENDPOINT,
			s3Bucket: PUBLIC_S3_BUCKET
		};
	} else {
		if (!locals.user) {
			// return { user: null }
			throw redirect(302, '/auth/login');
		}

		return {
			user: locals.user ?? null,
			session: locals.session ?? null,
			apiDown: locals.apiDown ?? true,
			s3Endpoint: PUBLIC_S3_ENDPOINT,
			s3Bucket: PUBLIC_S3_BUCKET
		};
	}
}
