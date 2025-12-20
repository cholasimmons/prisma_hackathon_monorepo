import { fail, redirect, type Actions } from '@sveltejs/kit'
import { authClient } from '$lib/auth-client';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData()

    const email = String(data.get('email') ?? '')
    const password = String(data.get('password') ?? '')
    const name = String(data.get('name') ?? '')

    // VALIDATION — always here
    if (!email.includes('@')) {
      return fail(400, { email, name, error: 'Invalid email' })
    }

    if (password.length < 8) {
      return fail(400, { email, name, error: 'Invalid password' })
    }

    // AUTH — delegated
    const result = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: '/login'
    })

    console.log(result);

    if (result.error) {
      return fail(401, {
        email,
        name,
        success: false,
        message: result.error.statusText ?? 'Registration failed'
      })
    }

    if(result.data.user && result.data.token) {
      const { email, name } = result.data.user;
      // const token = result.data.token;
      return { email, name, success: true, message: 'Registration successful' }
      }

    // throw redirect(302, '/')
  }
} satisfies Actions;