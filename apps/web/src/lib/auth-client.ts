import { createAuthClient } from 'better-auth/svelte'; // make sure to import from better-auth/svelte
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { API_BASE_URL } from './env';

export const authClient = createAuthClient({
	baseURL: API_BASE_URL,
	email: {
		login: async ({ email, password }: { email: string; password: string }) => {
			authClient.signIn.email({ email, password, callbackURL: '/', rememberMe: true }).then(() => {
				console.log('User signed out');
			});
		},
		register: async ({
			email,
			password,
			name
		}: {
			email: string;
			password: string;
			name: string;
		}) => {
			authClient.signUp.email({ email, password, callbackURL: '/login', name }).then(() => {
				console.log('User signed up');
			});
		}
	}
	// plugins: [sveltekitCookies(getRequestEvent)] // make sure this is the last plugin in the array
});
