import { API_BASE_URL } from '../env';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { emailOTP } from 'better-auth/plugins';
import { betterAuth } from 'better-auth';

export const auth = betterAuth({
	baseURL: API_BASE_URL,
	basePath: '/auth',
	credentials: 'include',
	emailAndPassword: {
		enabled: true,
	},
	// fetchOptions: {
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	}
	// }
	plugins: [
		sveltekitCookies(getRequestEvent)
	] // make sure this is the last plugin in the array
});
