<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import toast from 'svelte-french-toast';
	import { EyeClosedIcon, EyeOffIcon, EyeIcon } from '@lucide/svelte';
	import { authClient } from '$lib/auth-client';
	import PageHeader from '$lib/components/PageHeader.svelte';

	let { data, form }: PageProps = $props();
	let _signingUp = $state(false);
	let _showConfirmPassword = $state(false);

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
					callbackURL: '/login'
				});

				if (res.error?.message || res.error?.statusText) {
					toast.error(res.error?.message ?? res.error?.statusText);
				} else if (res.data?.user) {
					toast.success('Account created successfully');
				}
			} else if (result?.type === 'error' || result?.type === 'failure') {
				toast.error(result.data.message);
			}

			await update();
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
				<label for="firstname" class="text-sm font-medium">First Name</label>
				<input
					id="firstname"
					name="firstname"
					type="text"
					required
					class="w-full rounded-lg border px-3 py-2 text-lg md:text-2xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
				/>
			</div>
			<div class="space-y-1">
				<label for="lastname" class="text-sm font-medium">Last Name</label>
				<input
					id="lastname"
					name="lastname"
					type="text"
					required
					class="w-full rounded-lg border px-3 py-2 text-lg md:text-2xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
				/>
			</div>
		</div>

		<div class="space-y-1 text-gray-800 dark:text-gray-300">
			<label for="email" class="text-sm font-medium">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				required
				class="w-full rounded-lg border px-3 py-2 text-lg md:text-2xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
			/>
		</div>

		<div
			class="grid grid-cols-1 gap-4 md:grid-cols-2 text-gray-800 dark:text-gray-300 text-lg md:text-xl"
		>
			<div class="space-y-1">
				<label for="password" class="text-sm font-medium">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					class="w-full rounded-lg border px-3 py-2 text-lg md:text-xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
				/>
			</div>

			<div class="space-y-1">
				<label for="confirmPassword" class="text-sm font-medium">Confirm Password</label>
				<div class="relative">
					<input
						id="confirmPassword"
						name="confirmPassword"
						type={_showConfirmPassword ? 'text' : 'password'}
						required
						class="w-full rounded-lg border px-3 py-2 text-lg md:text-xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
					/>

					<!-- Eye icon button -->
					<button
						type="button"
						onclick={() => (_showConfirmPassword = !_showConfirmPassword)}
						class="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
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
				disabled={_signingUp}
				class="w-full rounded-full md:max-w-sm mx-auto bg-black dark:bg-amber-800 py-3 font-medium text-white hover:bg-amber-600 md:text-xl disabled:opacity-40 cursor-pointer transition-colors duration-100 ease-in-out"
			>
				{_signingUp ? 'Signing up…' : 'Sign up'}
			</button>
		</div>
	</form>
</main>
