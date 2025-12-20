import { authClient } from '$lib/auth-client';
import { fail, redirect, type Actions } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData()

    const email = String(data.get('email') ?? '').trim()

    // VALIDATION — always here
    if (!email.includes('@') || email.length < 8) {
      return fail(400, { success: false, email, message: 'Invalid Email' })
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
        message: result.error.message ?? result.error.statusText ?? 'Password reset failed'
      })
    }

    if(result.data.status) {
      return { email, message: result.data.message, success: true }
    }

    // fallback
    return fail(500, { success: false, message: 'Unknown Error' });
  }
} satisfies Actions;