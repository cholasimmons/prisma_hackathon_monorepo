import type { AuthUser } from '$lib/models/auth.model.js';
import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
  if(locals.user) {
    redirect(302, '/');
  };
};