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

    return { user: { email }, message: 'Email address accepted', success: true }

  }
} satisfies Actions;