import { API_BASE_URL } from '$lib/env';
import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from "$app/environment";
import { authClient } from '$lib/auth-client';

export async function handle({ event, resolve }) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 3000);

  const cookie = event.request.headers.get('cookie') ?? '';
  console.log("cookie:", cookie)
  if(!cookie) {
    event.locals.user = null;
    event.locals.session = null;
    event.locals.apiDown = false; // API reachable, just unauthenticated
    return resolve(event)
  }

  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}/auth/get-session`, {
      headers: { 'Content-Type': 'application/json', cookie }, method: 'GET', signal: controller.signal
    });

    if(!res.ok) {
      event.locals.user = null;
      event.locals.session = null;
      event.locals.apiDown = false; // API reachable, just unauthenticated
      return resolve(event)
    }

    const data = await res.json();

    console.log("hooks:", data)

    // Make session and user available on server
    event.locals.session = data?.session ?? null;
    event.locals.user = data?.user ?? null;
    event.locals.apiDown = false; // API reachable, just unauthenticated

    return resolve(event)
  } catch (error) {
    event.locals.user = null;
    event.locals.session = null;
    event.locals.apiDown = true; // API unreachable

    return resolve(event)
  }
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
