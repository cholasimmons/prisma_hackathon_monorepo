import { fail, redirect, type Actions } from '@sveltejs/kit'
import { authClient } from '$lib/auth-client';

// export function load({ locals }) {
//   if(locals.user) {
//     redirect(302, '/');
//   };
// };

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData()

    const email = String(data.get('email') ?? '')
    const password = String(data.get('password') ?? '')
    const rememberMe = data.get('rememberMe') === 'on';

    // VALIDATION — always here
    if (!email.includes('@')) {
      return fail(400, { email, rememberMe, error: 'Invalid email' })
    }

    if (password.length < 8) {
      return fail(400, { email, rememberMe, error: 'Invalid password' })
    }

    // AUTH — delegated
    const result = await authClient.signIn.email({
      email,
      password,
      rememberMe,
      callbackURL: '/'
    })

    console.log(result);

    if (result.error) {
      return fail(401, {
        email,
        rememberMe,
        error: result.error.statusText ?? 'Sign-in failed'
      })
    }

    if(result.data.redirect && result.data.url) {
      // return { email, rememberMe, success: true }
      throw redirect(302, result.data.url)
    }

    throw redirect(302, '/')
  }
} satisfies Actions;