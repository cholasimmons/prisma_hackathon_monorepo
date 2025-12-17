import { error } from '@sveltejs/kit';

export function assertSameOrigin(request: Request) {
	const origin = request.headers.get('origin');
	const host = request.headers.get('host');

	if (!origin || !host) return;

	const originHost = new URL(origin).host;

	if (originHost !== host) {
		throw error(403, 'CSRF blocked');
	}
}
