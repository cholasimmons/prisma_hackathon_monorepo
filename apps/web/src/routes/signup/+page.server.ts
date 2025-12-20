import { authClient } from '$lib/auth-client';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData()

    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '').trim()
    const confirmPassword = String(data.get('confirmPassword') ?? '').trim()
    const firstname = String(data.get('firstname') ?? '').trim()
    const lastname = String(data.get('lastname') ?? '').trim()
    const name = `${firstname} ${lastname}`

    // VALIDATION — always here
    if (password !== confirmPassword) {
      return fail(400, { success: false, email, name, message: 'Passwords do not match' })
    }

    if (!firstname || firstname.length < 2) {
      return fail(400, { success: false, email, name, message: 'Invalid First Name' })
    }

    if (!lastname || lastname.length < 2) {
      return fail(400, { success: false, email, name, message: 'Invalid Last Name' })
    }

    if (!email.includes('@') || email.length < 8) {
      return fail(400, { success: false, email, name, message: 'Invalid Email' })
    }

    if (password.length < 8) {
      return fail(400, { success: false, email, name, message: 'Invalid Password' })
    }

    // AUTH — delegated
    const result = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: '/login'
    })

    console.log('result:', result);

    if (result.error) {
      const message = result.error.message ?? result.error.statusText ?? 'Registration failed';

      console.log('error message:', result.error.status, message);
      return fail(result.error.status ?? 409, {
        // email,
        // name,
        success: false,
        message
      })
    }

    if(result.data?.user) {
      const { email, name } = result.data.user;
      console.log('server signup success:', email);
      // const token = result.data.token;
      return fail(200, { success: true, message: 'Registration successful', email, name })
      }

      // fallback
      return fail(500, { success: false, message: 'Unknown Error' });
  }
} satisfies Actions;