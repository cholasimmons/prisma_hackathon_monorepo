<script lang="ts">
	import { fade } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import Icon from '@iconify/svelte';

	let { data, form }: PageProps = $props();
	let _signingIn = $state(false);

	const GoogleIcon = 'flat-color-icons:google';
	const MicrosoftIcon = 'logos:microsoft-icon';
	const GithubIcon = 'ri:github-fill';
	const AppleIcon = 'skill-icons:apple-dark';
</script>

<main
	class="mx-auto max-w-lg px-8 py-4 dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
	<h1 class="mb-1 dark:text-gray-200 text-2xl">Log In</h1>
	<p class="mb-8 text-sm">Welcome back. Enter your details to proceed.</p>

	<!-- <p class="text-gray-200">
		You have come across a new feature.<br />
		A page currently under development
	</p> -->

	<form
		method="POST"
		class="space-y-4"
		use:enhance={() => {
			_signingIn = true;
			return async () => {
				_signingIn = false;
			};
		}}
	>
		<div class="space-y-1">
			<label for="email" class="text-sm font-medium">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				required
				class="w-full rounded-lg border px-3 py-2 text-lg focus:outline-none focus:ring focus:border-amber-600"
			/>
		</div>

		<div class="space-y-1">
			<label for="password" class="text-sm font-medium">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				required
				class="w-full rounded-lg border px-3 py-2 text-lg focus:outline-none focus:ring focus:border-amber-600"
			/>
		</div>

		<div class="flex items-center justify-between text-sm">
			<label for="rememberMe" class="flex items-center gap-2">
				<input type="checkbox" id="rememberMe" name="rememberMe" />
				Remember me
			</label>

			<a href="/forgot-password" class="dark:text-amber-500 hover:underline"> Forgot password? </a>
		</div>

		{#if form?.error}
			<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
				{form.error}
			</p>
		{/if}

		<button
			type="submit"
			disabled={_signingIn}
			class="w-full rounded-lg bg-black py-2 font-medium dark:text-white hover:bg-amber-600 disabled:opacity-40 cursor-pointer transition-colors duration-100 ease-in-out"
		>
			{_signingIn ? 'Signing in…' : 'Sign in'}
		</button>
	</form>

	<div class="my-6 flex items-center gap-3 text-sm text-gray-400">
		<div class="h-px flex-1 bg-gray-200"></div>
		or continue with
		<div class="h-px flex-1 bg-gray-200"></div>
	</div>

	<!-- Social login -->
	<div class="flex space-x-3">
		<a
			href="/auth/sign-in/google"
			class="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100 hover:dark:text-gray-800"
		>
			<Icon icon={GoogleIcon} />
			<span>Google</span>
		</a>

		<a
			href="/auth/sign-in/microsoft"
			class="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100 hover:dark:text-gray-800"
		>
			<Icon icon={MicrosoftIcon} />
			<span>Microsoft</span>
		</a>

		<a
			href="/auth/sign-in/github"
			class="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100 hover:dark:text-gray-800"
		>
			<Icon icon={GithubIcon} />
			<span>GitHub</span>
		</a>

		<a
			href="/auth/sign-in/apple"
			class="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100 hover:dark:text-gray-800"
		>
			<Icon icon={AppleIcon} />
			<span>Apple</span>
		</a>
	</div>

	<!-- <button
		in:fade={{ duration: 500, delay: 8000 }}
		onclick={login}
		disabled={_signingIn}
		class="border-2 py-2 px-6 rounded-full bg-gray-400/10 cursor-pointer disabled:border-red-800 disabled:text-red-800"
		>Demo Log In</button
	> -->

	<!-- <a href="/" in:fade={{ duration: 1000, delay: 2000 }} class="hover:text-amber-600 p-4 mt-6"
		>Return home</a
	 -->
</main>
