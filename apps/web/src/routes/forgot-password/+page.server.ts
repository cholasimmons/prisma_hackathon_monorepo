import { fail, redirect, type Actions } from '@sveltejs/kit'
import { authClient } from '$lib/auth-client';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData()

    const email = String(data.get('email') ?? '')

    // VALIDATION — always here
    if (!email.includes('@')) {
      return fail(400, { email, error: 'Invalid email' })
    }

    // AUTH — delegated
    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: '/login'
    })

    console.log(result);

    if (result.error) {
      return fail(401, {
        email,
        error: result.error.message ?? result.error.statusText ?? 'Password reset failed'
      })
    }

    if(result.data.status) {
      return { email, message: result.data.message, success: true }
    }

    throw redirect(302, '/login')
  }
} satisfies Actions;