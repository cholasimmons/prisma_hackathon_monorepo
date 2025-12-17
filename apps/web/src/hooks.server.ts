import { API_BASE_URL } from "$lib/env"
import type { Handle } from "@sveltejs/kit";

// export async function handle({ event, resolve }) {
//   // Fetch current session from Better Auth
//   const session = await authClient.getSession(
//     event.request.headers,
//   );

//   // Make session and user available on server
//   if (session) {
//     event.locals.session = session.session;
//     event.locals.user = session.user;
//   } else {
//     event.locals.session = null;
//     event.locals.user = null;
//   }

//   return svelteKitHandler({ event, resolve, auth, building });
// }

export const handle: Handle = async ({ event, resolve }) => {
  const res = await fetch(`${API_BASE_URL}/auth/get-session`, {
    headers: {
  		cookie: event.request.headers.get('cookie') ?? ''
  	}
  });

  if (!res.ok) {
    event.locals.user = null;
    event.locals.session = null;
  	return resolve(event)
  }

  const data = await res.json();

  event.locals.session = data?.session.session ?? null;
  event.locals.user = data?.session.user ?? null;

  console.log("user", event.locals.user)

  return resolve(event);
}