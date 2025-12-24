import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
  const user = locals.user;

  if (!user) {
    throw redirect(302, '/login');
  }

  if (user.role !== 'admin') {
    return {
      ...user,
      role: 'admin'
    };
    // throw redirect(302, '/');
  }

  return {
    user
  };
};
