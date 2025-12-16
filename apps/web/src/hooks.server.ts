import { API_BASE_URL } from "$lib/env"
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const res = await fetch(`${API_BASE_URL}/auth/get-session`);
  console.log("r",res)
  const data = await res.json();
  console.log("d",data);
  // event.locals.user = data.user ?? null;
  return resolve(event);
}