import type { LayoutServerLoad } from './$types';

export async function load({ locals }) {
  return {
    user: locals.user ?? null
  };
};