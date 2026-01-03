import { fail, type Actions } from '@sveltejs/kit';
import mono_config from "@config";

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    const emailRegex = mono_config.auth.email.regex || /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '').trim()
    const confirmPassword = String(data.get('confirmPassword') ?? '').trim()
    const firstname = String(data.get('firstname') ?? '').trim()
    const lastname = String(data.get('lastname') ?? '').trim()
    const name = `${firstname} ${lastname}`

   	const passwordHasLength = password.length >= mono_config.auth.password.maxLength || password.length <= mono_config.auth.password.minLength;
    const passwordHasNumber = mono_config.auth.password.requireNumber ? /\d/.test(password) : true;
    const passwordHasUpper = mono_config.auth.password.requireUppercase ? /[A-Z]/.test(password) : true;
		if (!passwordHasLength) {
			return fail(400, { success: false, email, name, message: 'Password invalid length' });
		}
		if (!passwordHasNumber) {
			return fail(400, { success: false, email, name, message: 'Password requires a number' });
		}
		if (!passwordHasUpper) {
			return fail(400, { success: false, email, name, message: 'Password requires an uppercase letter' });
		}
    if (password !== confirmPassword) {
      return fail(400, { success: false, email, name, message: 'Passwords do not match' })
    }

    if (!firstname || firstname.length < 2) {
      return fail(400, { success: false, email, name, message: 'Invalid First Name' })
    }

    if (!lastname || lastname.length < 2) {
      return fail(400, { success: false, email, name, message: 'Invalid Last Name' })
    }

    if (!emailRegex.test(email) || email.length > mono_config.auth.email.maxLength) {
      return fail(400, { success: false, email, name, message: 'Invalid Email' })
    }



    return { success: true, message: 'Registration successful', user: { email, name, password } }


  }
} satisfies Actions;