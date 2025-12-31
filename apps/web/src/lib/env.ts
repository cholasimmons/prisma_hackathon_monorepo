import { BETTER_AUTH_URL } from '$env/static/private';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { PUBLIC_APP_URL, PUBLIC_S3_BUCKET, PUBLIC_S3_ENDPOINT } from '$env/static/public';

const API_BASE_URL = PUBLIC_API_BASE_URL;
const APP_URL = PUBLIC_APP_URL;
const PRIVATE_API_BASE_URL = BETTER_AUTH_URL;

if (!API_BASE_URL) {
	throw new Error('Public API_BASE_URL is required');
}
if (!PRIVATE_API_BASE_URL) {
	throw new Error('API_BASE_URL is required');
}
if (!APP_URL) {
	throw new Error('APP_URL is required');
}

export { API_BASE_URL, PRIVATE_API_BASE_URL, APP_URL };
