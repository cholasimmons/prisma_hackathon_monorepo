import mono_config from '@config';
import { fail, redirect, type Actions } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData()

    const emailRegex = mono_config.auth.email.regex || /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const email = String(data.get('email') ?? '').trim()

    // VALIDATION — always here
    if (!emailRegex.test(email) || email.length > mono_config.auth.email.maxLength) {
      return fail(400, { success: false, email, message: 'Invalid Email' })
    }

    return { user: { email }, message: 'Email address accepted', success: true }

  }
} satisfies Actions;