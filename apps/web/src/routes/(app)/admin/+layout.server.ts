import { BUN_ENV } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
  if(BUN_ENV === 'production') {
    if (!locals.user || locals.user.role !== 'admin') {
      return { user: null }
      // throw redirect(302, '/login');
    }
    return { user: locals.user };
  } else if(BUN_ENV === 'development') {
    return { user: { id: '1', email: 'admin@example.com', emailVerified: false, role: 'admin', name: 'Frank Simmons' } };
  } else {
    if (!locals.user || locals.user.role !== 'admin') {
      return { user: null }
      // throw redirect(302, '/login');
    }

    return { user: locals.user };
  }
};
