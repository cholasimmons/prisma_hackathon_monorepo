import { PUBLIC_API_BASE_URL } from "$env/static/public";

const API_BASE_URL = PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
	throw new Error('API_BASE_URL is required');
}

export { API_BASE_URL };
