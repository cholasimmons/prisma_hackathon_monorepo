import { createAuthClient } from 'better-auth/svelte'; // make sure to import from better-auth/svelte
import { API_BASE_URL } from './env';

export const authClient = createAuthClient({
	baseURL: API_BASE_URL,
	basePath: '/auth',
	credentialscc: 'include'
	// plugins: [sveltekitCookies(getRequestEvent)] // make sure this is the last plugin in the array
});
