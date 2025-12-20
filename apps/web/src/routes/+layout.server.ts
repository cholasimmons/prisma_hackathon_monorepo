import type { AuthUser } from '$lib/models/auth.model.js';

export function load({ locals }) {
  return {
    user: locals.user ?? null,
    apiDown: locals.apiDown
  };
};