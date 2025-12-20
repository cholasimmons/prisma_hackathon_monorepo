import { authClient } from '$lib/auth-client';
import { fail, redirect, type Actions } from '@sveltejs/kit'

// export function load({ locals }) {
//   if(locals.user) {
//     redirect(302, '/');
//   };
// };

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData()

    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '').trim()
    const rememberMe = data.get('rememberMe') === 'on';

    // VALIDATION — always here
    if (!email.includes('@') || email.length < 8) {
      return fail(400, { success: false, email, rememberMe, message: 'Invalid Email' })
    }

    if (password.length < 8) {
      return fail(400, { success: false, email, rememberMe, message: 'Invalid password' })
    }

    // AUTH — delegated
    // const result = await authClient.signIn.email({
    //     email,
    //     password,
    //     rememberMe,
    //     callbackURL: '/'
    // })

    // console.log(result);

    // if (result.error) {
    //    const message =  result.error.message ?? result.error.statusText ?? 'Sign-in failed';

    //   return fail(result.error.status ?? 409, {
    //     success: false,
    //     email,
    //     rememberMe,
    //     message
    //   })
    // } else if(result.data.user) {
    //   const user = result.data.user;
    //   const rdrct = result.data.redirect ?? true;
    //   const url = result.data.url ?? '/';
    //   // return fail(200, { user, success: true })
    //   // return { user, success: true, redirect, url, message: 'Sign-in successful' }
    //   throw redirect(302, rdrct ? url : '/')
    // }

    // fallback
    // return fail(500, { success: false, message: 'Unknown Error' });
    return { success: true, user: { email, rememberMe, password }, message: 'All systems go!' };
  }
} satisfies Actions;