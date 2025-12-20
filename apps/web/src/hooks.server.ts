import { API_BASE_URL } from '$lib/env';
import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from "$app/environment";
import { authClient } from '$lib/auth-client';

export async function handle({ event, resolve }) {
  const headers = event.request.headers;
  const res = await fetch(`${API_BASE_URL}/auth/get-session`, {
    headers, credentials: 'include', method: 'GET'
  });

  const data = await res.json();

  // Fetch current session from Better Auth
  // const { data } = await authClient.getSession();

  console.log("hooks:", data)

  // Make session and user available on server
  event.locals.session = data?.session ?? null;
  event.locals.user = data?.user ?? null;

  return resolve(event)
  // return svelteKitHandler({ event, resolve, authClient, building });
}

// const handle: Handle = async ({ event, resolve }) => {
//   const headers = event.request.headers;
//   // const session = await auth.api.getSession({headers});
//   //
//   const res = await fetch(`${API_BASE_URL}/auth/get-session`, {
//     headers, credentials: 'include'
//   });

//   console.log(res)

// 	if (!res.ok) {
// 	  event.locals.user = null;
// 	  event.locals.session = null;
// 		return resolve(event)
// 	}

//   const session = await res.json();
//   console.log(session)

// 	event.locals.session = session?.session ?? null;
// 	event.locals.user = session?.user ?? null;

// 	console.log('[hooks] session', event.locals.session);
// 	console.log('[hooks] user', event.locals.user);

// 	return resolve(event);
// };
