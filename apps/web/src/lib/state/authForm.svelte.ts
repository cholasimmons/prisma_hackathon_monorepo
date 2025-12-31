export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export let firstname = $state('');
export let lastname = $state('');
export let email = $state('');
export let password = $state('');
export let confirmPassword = $state('');


export const isValidFirstname = $derived.by(() => {
  return firstname.length >= 2;
});

export const isValidLastname = $derived.by(() => {
  return lastname.length >= 2;
});

export const isValidEmail = $derived.by(() => {
  return emailRegex.test(email);
});

export const isValidPassword = $derived.by(() => {
  const hasLength = password.length >= 6;
	// const hasNumber = /\d/.test(password);
	// const hasUpper = /[A-Z]/.test(password);
  return hasLength; // && hasNumber && hasUpper;
});

export const isValidConfirmPassword = $derived.by(() => {
  const hasLength = password.length >= 6;
	// const hasNumber = /\d/.test(password);
	// const hasUpper = /[A-Z]/.test(password);
	const isEqual = password === confirmPassword;
  return hasLength && isEqual;
});



export function resetAuthForm() {
  email = '';
  password = '';
  firstname = '';
  lastname = '';
  confirmPassword = '';
}
