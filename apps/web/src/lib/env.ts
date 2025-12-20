import { BETTER_AUTH_URL, BUN_ENV } from "$env/static/private";
import { PUBLIC_API_BASE_URL } from "$env/static/public";

const API_BASE_URL = BETTER_AUTH_URL ||
	(BUN_ENV === 'development'
		? 'http://localhost:3000' // ← your Elysia dev port
		: PUBLIC_API_BASE_URL);

if (!API_BASE_URL) {
	throw new Error('API_BASE_URL is required');
}

export { API_BASE_URL };
