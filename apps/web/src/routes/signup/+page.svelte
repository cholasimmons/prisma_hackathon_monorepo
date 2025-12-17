<script>
	import { fade } from 'svelte/transition';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let _signingUp = $state(false);

	async function signup() {
		try {
			_signingUp = true;
			const signedUp = await authClient.signUp.email({
				email: 'simmonsfrank@gmail.com',
				password: 'password',
				name: 'Zambian Citizen',
				callbackURL: '/'
			});
			_signingUp = false;
			console.log(signedUp);
			goto('/login');
		} catch (error) {
			console.error(error);
		} finally {
			_signingUp = false;
		}
	}
</script>

<main
	class="container mx-auto px-8 py-4 text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
	<h1 class="text-gray-400 text-2xl">Sign Up</h1>

	<p class="text-gray-200">
		You have come across a new feature.<br />
		A page currently under development
	</p>

	<button
		in:fade={{ duration: 500, delay: 8000 }}
		onclick={signup}
		disabled={_signingUp}
		class="border-2 py-2 px-6 rounded-full bg-gray-400/10 cursor-pointer disabled:border-red-800 disabled:text-red-800"
		>Demo Sign Up</button
	>

	<a href="/" in:fade={{ duration: 1000, delay: 2000 }} class="hover:text-amber-600 p-4"
		>Return home</a
	>
</main>
