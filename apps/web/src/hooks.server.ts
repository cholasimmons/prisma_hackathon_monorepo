import { createApi, type ApiResponse } from '$lib/api/client';
import { API_BASE_URL } from '$lib/env';
import type { SessionPayload } from '$lib/models/auth.model';

export async function handle({ event, resolve }) {
	const api = createApi(event.fetch);

	let response: ApiResponse<SessionPayload>;

	const cookie = event.request.headers.get('cookie');

	try {
		if (!cookie) {
			event.locals.user = null;
			event.locals.session = null;
			event.locals.apiDown = false; // API reachable
			return resolve(event);
		}

		response = await api.get<SessionPayload>('/auth/get-session', {
			headers: { cookie },
			timeout: 5000,
			signal: event.request.signal
		});

		event.locals.user = response.data?.user ?? null;
		event.locals.session = response.data?.session ?? null;
		event.locals.apiDown = false; // API reachable, just unauthenticated

		// console.log('Session User:', event.locals.user);
		// console.log('Session:', event.locals.session);
	} catch (error) {
		event.locals.user = null;
		event.locals.session = null;
		event.locals.apiDown = true; // API unreachable
	} finally {
		return resolve(event);
	}
}
