import { PUBLIC_API_BASE_URL } from '$env/static/public';

// Response shape expected from *all* Elysia endpoints
export interface ApiResponse<T = unknown> {
	data: T;
	message: string; // always present — success or error reason
	code?: number; // e.g. 200, 201
	// status?: 'success' | 'error';
	success?: boolean;
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
		// public readonly status: 'error',
		public readonly originalError?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

function isAbortError(err: unknown) {
	return err instanceof DOMException && err.name === 'AbortError';
}

/**
 * Hard timeout: aborts the underlying fetch, not just Promise.race.
 * Also supports a caller-provided AbortSignal (e.g., SvelteKit event signal).
 */
async function fetchWithTimeout(
	fetchFn: typeof fetch,
	url: string,
	init: RequestInit,
	timeoutMs: number
): Promise<Response> {
	const controller = new AbortController();

	// If caller provided a signal, abort our controller when caller aborts too.
	const upstream = init.signal;
	const onUpstreamAbort = () => controller.abort();

	if (upstream) {
		if (upstream.aborted) controller.abort();
		else upstream.addEventListener('abort', onUpstreamAbort, { once: true });
	}

	const id = setTimeout(() => controller.abort(), timeoutMs);

	try {
		return await fetchFn(url, { ...init, signal: controller.signal });
	} finally {
		clearTimeout(id);
		if (upstream) upstream.removeEventListener('abort', onUpstreamAbort);
	}
}

/**
 * Factory so you can inject SvelteKit's event-scoped fetch:
 * - in +page.server.ts / +page.ts: createApi(event.fetch)
 * - elsewhere (client-only): createApi(fetch)
 */
export function createApi(fetchFn: typeof fetch) {
	async function request<T>(
		method: string,
		path: string,
		options: { body?: unknown; signal?: AbortSignal } & RequestOptions = {}
	): Promise<ApiResponse<T>> {
		const { timeout = 10_000, retries = 2, headers = {}, body, signal } = options;

		const url = new URL(path, PUBLIC_API_BASE_URL).href;
		const isFormData = body instanceof FormData;

		const baseHeaders: HeadersInit = {
			...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
			...headers
		};

		for (let attempt = 0; attempt <= retries; attempt++) {
			try {
				const fetchOptions: RequestInit = {
					method,
					headers: baseHeaders,
					credentials: 'include', // ✅ This belongs here
					signal // optional: allows callers (and SvelteKit) to abort too
				};

				if (isFormData) {
					fetchOptions.body = body as FormData;
				} else if (body !== undefined) {
					fetchOptions.body = JSON.stringify(body);
				}

				const response = await fetchWithTimeout(fetchFn, url, fetchOptions, timeout);

				let responseBody: ApiResponse<T>;
				try {
					responseBody = await response.json();
				} catch (e) {
					// console.error(e)
					throw new ApiError(`Invalid JSON response from ${url}`, response.status || 500);
				}

				// ✅ Always use `.message` for UX (success or error)
				if (responseBody.success === false) {
					throw new ApiError(
						responseBody.message || 'An unknown error occurred',
						responseBody.code || 500,
						'error'
					);
				}

				return responseBody;
			} catch (err) {
				const isFinalAttempt = attempt === retries;

				// If aborted (timeout or upstream abort), do not retry unless you explicitly want that.
				if (isAbortError(err)) {
					throw new ApiError(`Request timed out after ${timeout}ms`, 408, 'error');
				}

				if (isFinalAttempt) {
					// Final error — expose `.message`
					if (err instanceof ApiError) throw err;
					if (err instanceof Error) {
						throw new ApiError(err.message || 'Network request failed', 500, 'error');
					}
					throw new ApiError('Request failed', 500, 'error');
				}

				// Exponential backoff
				await sleep(500 * Math.pow(2, attempt));
			}
		}

		throw new Error('Unreachable');
	}

	// ✅ NEW: raw fetch passthrough (returns Response)
	async function raw(
		input: string | URL | Request,
		init: RequestInit & { timeout?: number } = {}
	): Promise<Response> {
		const url =
			input instanceof Request
				? input.url
				: input instanceof URL
					? input.href
					: new URL(input, PUBLIC_API_BASE_URL).href;

		const { timeout = 10_000, ...rest } = init;

		// ✅ do NOT inject 'Content-Type' blindly (breaks FormData/GET/etc).
		const fetchInit: RequestInit = {
			...rest,
			credentials: 'include'
		};

		return fetchWithTimeout(fetchFn, url, fetchInit, timeout);
	}

	// ✅ Fluent API
	return {
		get: <T>(path: string, options?: Omit<RequestOptions, 'body'> & { signal?: AbortSignal }) =>
			request<T>('GET', path, options),

		post: <T>(
			path: string,
			body: unknown,
			options?: Omit<RequestOptions, 'body'> & { signal?: AbortSignal }
		) => request<T>('POST', path, { ...options, body }),

		put: <T>(
			path: string,
			body: unknown,
			options?: Omit<RequestOptions, 'body'> & { signal?: AbortSignal }
		) => request<T>('PUT', path, { ...options, body }),

		delete: <T>(path: string, options?: Omit<RequestOptions, 'body'> & { signal?: AbortSignal }) =>
			request<T>('DELETE', path, options),

		raw
	};
}

export const api = createApi(fetch);
