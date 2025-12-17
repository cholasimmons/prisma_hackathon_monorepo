/**
 * Public env vars (exposed to client)
 * Add to `vite.config.ts` `define` or use `$env/static/public`
 */
const API_BASE_URL =
	import.meta.env.API_BASE_URL || import.meta.env.NODE_ENV === 'development'
		? 'http://localhost:3000' // ← your Elysia dev port
		: 'https://api.plates.simmons.studio';

if (!API_BASE_URL) {
	throw new Error('PUBLIC_API_BASE_URL is required');
}

export { API_BASE_URL };
