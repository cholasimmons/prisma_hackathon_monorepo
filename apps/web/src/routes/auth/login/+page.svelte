<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import Icon from '@iconify/svelte';
	import toast from 'svelte-french-toast';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Spinner from '$lib/components/Loaders/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import mono_config from '@config';

	const APP_URL = "https://plates.simmons.studio";

	let { data, form }: PageProps = $props();
	let _signingIn = $state(false);
	let _sendingLink = $state(false);
	let _resettingPassword = $state(false);

	// Reactive
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	let email = $state('');
	let password = $state('');
	let isValidEmail = $derived.by(() => {
	  return emailRegex.test(email)
	})
	let isValidPassword = $derived.by(() => {
        const hasLength = password.length >= mono_config.auth.password.minLength && password.length <= mono_config.auth.password.maxLength;
		const hasNumber = mono_config.auth.password.requireNumber ? /\d/.test(password) : true;
		const hasUpper = mono_config.auth.password.requireUppercase ? /[A-Z]/.test(password) : true;
		// const hasSpecial = mono_config.auth.password.requireSpecialChar ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true;
		return hasLength && hasNumber && hasUpper;
	})

	const GoogleIcon = 'flat-color-icons:google';
	const MicrosoftIcon = 'logos:microsoft-icon';
	const GithubIcon = 'ri:github-fill';
	const AppleIcon = 'skill-icons:apple-dark';

	const handleEnhance = () => {
		_signingIn = true;

		return async ({ result, update }: any) => {
			if (result?.type === 'success') {
				const { email, password, rememberMe } = result.data?.user;
				const { callbackURL } = result.data;

				const res = await authClient.signIn.email({
					email,
					password,
					rememberMe,
					callbackURL: callbackURL ?? (APP_URL + '/')
				});

				if (res.error?.message || res.error?.statusText) {
					toast.error(res.error?.message ?? res.error?.statusText);
				} else if (res.data?.redirect) {
					goto(res.data?.url ?? '/', { replaceState: true });
				} else {
					goto('/', { replaceState: true });
				}
			} else if (result?.type === 'error' || result?.type === 'failure') {
				toast.error(result.data?.message ?? 'Unable to sign in');
			}

			// TODO: Restore update logic if signing form still resets after successful login
			// await update();
			_signingIn = false;
		};
	};

	async function forgotPassword() {
	    if(!isValidEmail) {
			toast.error('Invalid email address');
			return;
		}

	    _resettingPassword = true;

		try{
    		await authClient.requestPasswordReset({
     			email,
     			redirectTo: (APP_URL + '/auth/reset-password')
    		}, { timeout: 8000 });

    		toast.success('Check your email! 😊');
		} catch(error){
		    console.error(error);
			toast.error('Reset link not sent');
		} finally {
		  _resettingPassword = false;
		}
	}

	async function sendVerificationLink() {
	    if(!isValidEmail) {
			toast.error('Invalid email address');
			return;
		}

	    _sendingLink = true;

		try{
    		await authClient.sendVerificationEmail({
   			email: email,
   			callbackURL: (APP_URL + '/')
    		}, {timeout: 8000});

    		toast.success('Verification email sent! 😊', { duration: 5000 });
		} catch(error){
		    console.error(error);
			toast.error('Unable to send verification email');
		} finally {
		  _sendingLink = false;
		}
	}
</script>

<main
	class="mx-auto px-8 dark:text-gray-400 flex flex-col min-h-full w-full max-w-xl items-center justify-start space-y-8"
>
	<PageHeader title="Log In" description="Welcome back. Enter your credentials to proceed." />

	<form method="POST" class="space-y-4" use:enhance={handleEnhance}>
		<div class="space-y-1">
			<label for="email" class={`text-sm font-medium ${isValidEmail ? '' : 'label-error'}`}>Email</label>
			<input
				id="email"
				name="email"
				type="email"
				bind:value={email}
				required
				disabled={_signingIn || _sendingLink}
				class="w-full rounded-lg border px-3 py-2 text-gray-800 dark:text-gray-800 text-xl font-medium focus:outline-none focus:ring focus:border-amber-600"
			/>
		</div>

		<div class="space-y-1">
			<label for="password" class={`text-sm font-medium ${isValidPassword ? '' : 'label-error'}`}>Password</label>
			<input
				id="password"
				name="password"
				type="password"
				bind:value={password}
				required
				disabled={_signingIn || _sendingLink}
				class="w-full rounded-lg border px-3 py-2 text-gray-800 dark:text-gray-800 text-xl font-medium focus:outline-none focus:ring focus:border-amber-600"
			/>
		</div>

		<div class="flex items-center justify-between text-sm">
			<label for="rememberMe" class="flex items-center gap-2">
				<input
					type="checkbox"
					id="rememberMe"
					name="rememberMe"
					disabled={_signingIn || _sendingLink}
					class="w-4 h-4"
				/>
				Remember me
			</label>

			<button type="button" onclick={forgotPassword} disabled={!isValidEmail || _resettingPassword || _signingIn}  style="padding: 0.5rem 1rem;">
				{#if _resettingPassword}
				    <Spinner size={18} /> Resetting Password…
				{:else}
				    Forgot password?
				{/if}
			</button>
		</div>

		<!-- {#if form?.success === false }
			<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
				{form.message}
			</p>
		{/if} -->

		<button
			type="submit"
			disabled={ !isValidEmail || !isValidPassword || _signingIn || _sendingLink || _resettingPassword}
			class="w-full rounded-lg bg-gray-800 dark:bg-amber-800 py-3 font-medium text-white hover:bg-amber-600  cursor-pointer transition-colors duration-100 ease-in-out"
		>
			{#if _signingIn} <Spinner size={24} /> Signing in… {:else} Sign in {/if}
		</button>
	</form>

	<div class="flex my-4 items-center gap-3 text-sm">
		<button in:fade={{ duration: 1000, delay: (1000 * 10) }} disabled={!isValidEmail || _sendingLink || _signingIn}
		onclick={sendVerificationLink} style="padding: 0.5rem 1rem">
			{#if _sendingLink}
			    <Spinner size={18} /> Sending Verification Link
			{:else}
			    Resend Verification Link
			{/if}
		</button>
	</div>

	<div class="hidden my-6 items-center gap-3 text-sm text-gray-400">
		<div class="h-px flex-1 bg-gray-200"></div>
		or continue with
		<div class="h-px flex-1 bg-gray-200"></div>
	</div>

	<!-- Social login -->
	<div class="hidden grid-cols-2 md:grid-cols-4 gap-4 mx-auto">
		<a
			title="Google is not available"
			href="/oauth/google"
			class="items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100/70 hover:dark:text-gray-800"
		>
			<Icon icon={GoogleIcon} />
			<span>Google</span>
		</a>

		<a
			href="/oauth/microsoft"
			class="items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100/70 hover:dark:text-gray-800"
		>
			<Icon icon={MicrosoftIcon} />
			<span>Microsoft</span>
		</a>

		<a
			href="/oauth/github"
			class="items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100/70 hover:dark:text-gray-800"
		>
			<Icon icon={GithubIcon} />
			<span>GitHub</span>
		</a>

		<a
			href="/oauth/apple"
			class="items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100/70 hover:dark:text-gray-800"
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

<style>
    .label-success {
        color: seagreen
    }
    .label-error {
        color: salmon
    }
</style>