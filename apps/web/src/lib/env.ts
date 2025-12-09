/**
 * Public env vars (exposed to client)
 * Add to `vite.config.ts` `define` or use `$env/static/public`
 */
const PUBLIC_API_BASE_URL =
	import.meta.env.PUBLIC_API_BASE_URL || import.meta.env.DEV
		? 'http://localhost:3000' // ← your Elysia dev port
		: 'https://api.yourdomain.com';

if (!PUBLIC_API_BASE_URL) {
	throw new Error('PUBLIC_API_BASE_URL is required');
}

export { PUBLIC_API_BASE_URL };
