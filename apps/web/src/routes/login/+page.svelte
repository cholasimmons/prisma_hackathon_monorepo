<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import Icon from '@iconify/svelte';
	import toast from 'svelte-french-toast';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';

	let { data, form }: PageProps = $props();
	let _signingIn = $state(false);

	const GoogleIcon = 'flat-color-icons:google';
	const MicrosoftIcon = 'logos:microsoft-icon';
	const GithubIcon = 'ri:github-fill';
	const AppleIcon = 'skill-icons:apple-dark';

	const handleEnhance = () => {
      _signingIn = true;

      return async ({ result, update }:any) => {
        if (result?.type === 'success') {
          const { email, password, rememberMe } = result.data?.user;

          const res = await authClient.signIn.email({
              email,
              password,
              rememberMe,
              callbackURL: '/'
          })

          if(res.error?.message || res.error?.statusText) {
            toast.error(res.error?.message ?? res.error?.statusText);
          } else if(res.data?.redirect){
            goto(res.data?.url ?? '/');
          } else {
            goto('/');
          }
        } else if (result?.type === 'error' || result?.type === 'failure') {
          toast.error(result.data?.message ?? 'Unable to sign in');
        }

        await update();
        _signingIn = false;
      }
    };
</script>

<main
	class="mx-auto px-8  dark:text-gray-400 flex flex-col min-h-full w-full max-w-xl items-center justify-start space-y-8 "
>
	<h1 class="mb-1 dark:text-gray-200 text-3xl">Log In</h1>
	<p class="mb-8 md:text-sm">Welcome back. Enter your details to proceed.</p>

	<form
		method="POST"
		class="space-y-4"
		use:enhance={handleEnhance}
	>
		<div class="space-y-1">
			<label for="email" class="text-sm font-medium">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				required
				class="w-full rounded-lg border px-3 py-2 text-gray-800 dark:text-gray-800 text-xl font-medium focus:outline-none focus:ring focus:border-amber-600 "
			/>
		</div>

		<div class="space-y-1">
			<label for="password" class="text-sm font-medium">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				required
				class="w-full rounded-lg border px-3 py-2 text-gray-800 dark:text-gray-800 text-xl font-medium focus:outline-none focus:ring focus:border-amber-600"
			/>
		</div>

		<div class="flex items-center justify-between text-sm">
			<label for="rememberMe" class="flex items-center gap-2">
				<input type="checkbox" id="rememberMe" name="rememberMe" />
				Remember me
			</label>

			<a href="/forgot-password" class="dark:text-amber-500 hover:underline"> Forgot password? </a>
		</div>

		<!-- {#if form?.success === false }
			<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
				{form.message}
			</p>
		{/if} -->

		<button
			type="submit"
			disabled={_signingIn}
			class="w-full rounded-lg bg-black dark:bg-amber-800 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-40 cursor-pointer transition-colors duration-100 ease-in-out"
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
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mx-auto">
		<a
			href="/oauth/google"
			class="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100/70 hover:dark:text-gray-800"
		>
			<Icon icon={GoogleIcon} />
			<span>Google</span>
		</a>

		<a
			href="/oauth/microsoft"
			class="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100/70 hover:dark:text-gray-800"
		>
			<Icon icon={MicrosoftIcon} />
			<span>Microsoft</span>
		</a>

		<a
			href="/oauth/github"
			class="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100/70 hover:dark:text-gray-800"
		>
			<Icon icon={GithubIcon} />
			<span>GitHub</span>
		</a>

		<a
			href="/oauth/apple"
			class="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100/70 hover:dark:text-gray-800"
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
