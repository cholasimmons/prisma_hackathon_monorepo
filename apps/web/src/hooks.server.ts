import { API_BASE_URL } from '$lib/env';
import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from "$app/environment";
import { authClient } from '$lib/auth-client';

export async function handle({ event, resolve }) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 3000);

  let response: Response;

  const cookie = event.request.headers.get('cookie');
  // const sessionToken = event.cookies.get('better-auth.session_token') ?? '';

  // console.log("cookie:", cookie)
  // console.log("sessionToken:", sessionToken)

  try {
    if(cookie) {
      response = await fetch(`${API_BASE_URL}/auth/get-session`, {
        headers: {
          // 'Content-Type': 'application/json',
          cookie: cookie ?? ''
        }, method: 'GET', signal: controller.signal, credentials: 'include',
      });

      if(!response.ok) {
        event.locals.user = null;
        event.locals.session = null;
        event.locals.apiDown = true; // API unreachable
        return resolve(event)
      }

      const data = await response.json();
      event.locals.user = data?.session.user ?? null;
      event.locals.session = data?.session.session ?? null;
      event.locals.apiDown = false; // API reachable, just unauthenticated

      console.log("[Hooks] ", data.user.name)

      return resolve(event)
    } else {
      event.locals.user = null;
      event.locals.session = null;
      event.locals.apiDown = false; // API unreachable

      return resolve(event)
    }
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
