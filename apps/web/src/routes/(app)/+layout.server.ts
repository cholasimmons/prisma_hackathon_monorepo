import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from '../$types';
import { BUN_ENV } from "$env/static/private";

export const load: LayoutServerLoad = ({ locals }) => {
  if (BUN_ENV === 'development') {
    return {
      user: { id: '123', email: 'email@example.com', name: 'Frank Simmons', image: '/images/demo-avatar.png', role: 'admin', emailVerified: false },
    };
  } else {
    if (!locals.user) {
  		throw redirect(302, '/login');
  	}
  }

	// authenticated users proceed
	return {};
};
