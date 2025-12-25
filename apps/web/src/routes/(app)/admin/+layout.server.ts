import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
  const user = locals.user;
  // const user = { id: '1', email: 'admin@example.com', role: 'admin', name: 'Frank Admin' };


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
