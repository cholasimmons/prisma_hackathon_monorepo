import type { AuthUser } from '$lib/models/auth.model.js';

export function load({ locals }) {
  return {
    user: locals.user ?? null,
    session: locals.session ?? null,
    apiDown: locals.apiDown ?? false
  };
};