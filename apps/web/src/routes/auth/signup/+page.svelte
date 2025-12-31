<script lang="ts">
	import { enhance } from '$app/forms';
	import toast from 'svelte-french-toast';
	import { EyeClosedIcon, EyeOffIcon, EyeIcon } from '@lucide/svelte';
	import { authClient } from '$lib/auth-client';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { PUBLIC_APP_URL } from '$env/static/public';
	import { goto } from '$app/navigation';

	const APP_URL = PUBLIC_APP_URL;

	let _signingUp = $state(false);
	let _showConfirmPassword = $state(false);

	// Reactive
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   	let firstname = $state('');
    let lastname = $state('');
    let email = $state('');
    let password = $state('');
    let confirmPassword = $state('');

    const isValidFirstname = $derived.by(() => {
      return firstname.length >= 2;
    });

    const isValidLastname = $derived.by(() => {
      return lastname.length >= 2;
    });

    const isValidEmail = $derived.by(() => {
      return emailRegex.test(email);
    });

    const isValidPassword = $derived.by(() => {
      const hasLength = password.length >= 6;
    		// const hasNumber = /\d/.test(password);
    		// const hasUpper = /[A-Z]/.test(password);
      return hasLength; // && hasNumber && hasUpper;
    });

    const isValidConfirmPassword = $derived.by(() => {
      const hasLength = password.length >= 6;
    		// const hasNumber = /\d/.test(password);
    		// const hasUpper = /[A-Z]/.test(password);
    		const isEqual = password === confirmPassword;
      return hasLength && isEqual;
    });

    const isValidForm = $derived.by(() => {
      return isValidFirstname && isValidLastname && isValidEmail && isValidPassword && isValidConfirmPassword;
    })



	const handleEnhance = () => {
		// form submission finished
		_signingUp = true;

		return async ({ result, update }: any) => {
			if (result?.type === 'success') {
				const { email, name, password } = result?.data.user;

				// AUTH — delegated
				const res = await authClient.signUp.email({
					email,
					password,
					name,
					callbackURL: (APP_URL + '/')
				});

				if (res.error?.message || res.error?.statusText) {
					toast.error(res.error?.message ?? res.error?.statusText, { duration: 5000 });
				} else if (res.data?.user) {
					toast.success('Account created successfully', { duration: 5000 });
					goto('/', { replaceState: true })
				}
			} else if (result?.type === 'error' || result?.type === 'failure') {
				toast.error(result.data.message, { duration: 5000 });
			}

			// await update();
			_signingUp = false;
		};
	};
</script>

<main
	class="mx-auto dark:text-gray-400 flex flex-col min-h-full w-full max-w-xl items-center justify-start space-y-8"
>
	<PageHeader title="Sign Up" description="Create an account to create submissions." />

	<form method="POST" class="space-y-4" use:enhance={handleEnhance}>
		<div class="grid grid-cols-2 gap-4 text-gray-800 dark:text-gray-300 text-lg md:text-2xl">
			<div class="space-y-1">
				<label for="firstname" class={`text-sm font-medium ${isValidFirstname ? '' : 'label-error'}`}>First Name</label>
				<input
					id="firstname"
					name="firstname"
					type="text"
					bind:value={firstname}
					required
					class="w-full rounded-lg border px-3 py-2 text-lg md:text-2xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
				/>
			</div>
			<div class="space-y-1">
				<label for="lastname" class={`text-sm font-medium ${isValidLastname ? '' : 'label-error'}`}>Last Name</label>
				<input
					id="lastname"
					name="lastname"
					type="text"
					bind:value={lastname}
					required
					class="w-full rounded-lg border px-3 py-2 text-lg md:text-2xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
				/>
			</div>
		</div>

		<div class="space-y-1 text-gray-800 dark:text-gray-300">
			<label for="email" class={`text-sm font-medium ${isValidEmail ? '' : 'label-error'}`}>Email</label>
			<input
				id="email"
				name="email"
				type="email"
				bind:value={email}
				required
				class="w-full rounded-lg border px-3 py-2 text-lg md:text-2xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
			/>
		</div>

		<div
			class="grid grid-cols-1 gap-4 md:grid-cols-2 text-gray-800 dark:text-gray-300 text-lg md:text-xl"
		>
			<div class="space-y-1">
				<label for="password" class={`text-sm font-medium ${isValidPassword ? '' : 'label-error'}`}>Password</label>
				<input
					id="password"
					name="password"
					type="password"
					bind:value={password}
					required
					class="w-full rounded-lg border px-3 py-2 text-lg md:text-xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
				/>
			</div>

			<div class="space-y-1">
				<label for="confirmPassword" class={`text-sm font-medium ${isValidConfirmPassword ? '' : 'label-error'}`}>Confirm Password</label>
				<div class="relative">
					<input
						id="confirmPassword"
						name="confirmPassword"
						type={_showConfirmPassword ? 'text' : 'password'}
						bind:value={confirmPassword}
						required
						class="w-full rounded-lg border px-3 py-2 text-lg md:text-xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
					/>

					<!-- Eye icon button -->
					<button
						type="button"
						hidden={confirmPassword.length === 0}
						onclick={() => (_showConfirmPassword = !_showConfirmPassword)}
						class="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-gray-500 hover:text-gray-700"
						style="border:none; focus:outline-none; outline:none;"
					>
						{#if _showConfirmPassword}
							<EyeClosedIcon />
						{:else}
							<EyeIcon />
						{/if}
					</button>
				</div>
			</div>
		</div>

		<p class="text-sm font-medium my-8">
			By signing up, you agree to our <a href="/legal/terms" class="text-amber-600 hover:underline"
				>Terms of Service</a
			>
			and <a href="/legal/privacy" class="text-amber-600 hover:underline">Privacy Policy</a>.
		</p>

		<div class="flex justify-center">
			<button
				type="submit"
				disabled={_signingUp || !isValidForm}
				class="w-full rounded-full md:max-w-sm mx-auto bg-black dark:bg-amber-800 py-3 font-medium text-white hover:bg-amber-600 md:text-xl disabled:opacity-40 cursor-pointer transition-colors duration-100 ease-in-out"
			>
				{_signingUp ? 'Signing up…' : 'Sign up'}
			</button>
		</div>
	</form>
</main>


<style>
    .label-success {
        color: seagreen
    }
    .label-error {
        color: salmon
    }
</style>