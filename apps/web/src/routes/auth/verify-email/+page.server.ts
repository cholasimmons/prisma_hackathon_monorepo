import { API_BASE_URL } from '$lib/env';
import { fail, type Actions } from '@sveltejs/kit';

export async function load({ locals, url }) {
  // const token = url.searchParams.get('token');
  const callbackURL = url.searchParams.get('callbackURL');

  return {
    callbackURL
  };
}