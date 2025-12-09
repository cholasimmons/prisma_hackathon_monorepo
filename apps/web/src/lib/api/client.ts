import { PUBLIC_API_BASE_URL } from '$lib/env';

// Response shape expected from *all* Elysia endpoints
interface ApiResponse<T = unknown> {
	data: T;
	message: string; // always present — success or error reason
	code: number; // e.g. 200, 201
	// code: string;           // e.g. 'SUCCESS', 'VALIDATION_ERROR', 'NOT_FOUND'
	status: 'success' | 'error';
}

// Options for api.get/post/etc.
interface RequestOptions {
	timeout?: number; // ms
	retries?: number;
	headers?: HeadersInit;
}

// Custom error for structured handling
export class ApiError extends Error {
	constructor(
		public readonly message: string,
		public readonly code: number,
		public readonly status: 'error',
		public readonly originalError?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

// Timeout helper
function timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
	const timeout = new Promise<never>((_, reject) =>
		setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
	);
	return Promise.race([promise, timeout]);
}

// Core request function
async function request<T>(
	method: string,
	path: string,
	options: { body?: unknown } & RequestOptions = {}
): Promise<T> {
	const { timeout = 10_000, retries = 2, headers = {}, body } = options;

	const url = new URL(path, PUBLIC_API_BASE_URL).href;

	const baseHeaders: HeadersInit = {
		'Content-Type': 'application/json',
		credentials: 'include',
		...headers
	};

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			const fetchPromise = fetch(url, {
				method,
				headers: baseHeaders,
				body: body ? JSON.stringify(body) : undefined
			});

			const response = await timeoutPromise(fetchPromise, timeout);

			let responseBody: ApiResponse<T>;
			try {
				responseBody = await response.json();
			} catch (e) {
				throw new Error(`Invalid JSON response from ${url}`);
			}

			// ✅ Always use `.message` for UX (success or error)
			if (responseBody.status === 'error') {
				throw new ApiError(
					responseBody.message || 'An unknown error occurred',
					responseBody.code || 500,
					'error'
				);
			}

			return responseBody.data;
		} catch (err) {
			const isFinalAttempt = attempt === retries;

			if (isFinalAttempt) {
				// Final error — expose `.message`
				if (err instanceof ApiError) throw err;
				if (err instanceof Error) {
					throw new ApiError(err.message || 'Network request failed', 500, 'error', err);
				}
				throw new ApiError('Request failed', 500, 'error');
			}

			// Exponential backoff
			await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
		}
	}

	throw new Error('Unreachable');
}

// ✅ NEW: raw fetch passthrough (returns Response)
async function raw(input: string | URL | Request, init?: RequestInit): Promise<Response> {
	const url =
		input instanceof Request
			? input.url
			: input instanceof URL
				? input.href
				: new URL(input, PUBLIC_API_BASE_URL).href;

	const baseInit: RequestInit = {
		headers: {
			'Content-Type': 'application/json',
			credentials: 'include',
			...init?.headers
		},
		...init
	};

	const res = await fetch(url, baseInit);

	// Still enforce uniform { data, message, code, status } for JSON endpoints,
	// but for HEAD/asset checks, caller handles raw Response.
	return res;
}

// ✅ Fluent API
export const api = {
	get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
		request<T>('GET', path, options),

	post: <T>(path: string, body: unknown, options?: Omit<RequestOptions, 'body'>) =>
		request<T>('POST', path, { ...options, body }),

	put: <T>(path: string, body: unknown, options?: Omit<RequestOptions, 'body'>) =>
		request<T>('PUT', path, { ...options, body }),

	delete: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
		request<T>('DELETE', path, options),

	raw
};
