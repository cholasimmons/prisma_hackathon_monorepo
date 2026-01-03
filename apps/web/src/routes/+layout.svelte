<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from 'svelte-french-toast';
	import { page } from '$app/state';
	import { fade, fly } from 'svelte/transition';

	import { onMount } from 'svelte';
	import { initTheme, applyTheme } from '$lib/theme';
	import { goto, invalidateAll } from '$app/navigation';
	import {
		CircleQuestionMark,
		HouseIcon,
		TriangleAlert,
		LucideSun,
		LucideMoon,
		LucideCirclePower
	} from '@lucide/svelte';
	import { authClient } from '$lib/auth-client';
	import InstallPrompt from '$lib/components/PWA/installPrompt.svelte';
	import Spinner from '$lib/components/Loaders/Spinner.svelte';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import { cubicInOut, cubicOut, elasticIn } from 'svelte/easing';

	let { children, data } = $props();
	let dark = $state(true);
	let loggingOut = $state(false);

	function gotoLogin() {
		goto('/auth/login');
	}
	function gotoSignup() {
		goto('/auth/signup');
	}

	function toggleTheme() {
		dark = !dark;
		applyTheme(dark ? 'dark' : 'light');
	}
	function gotoAbout() {
		goto('/about');
	}
	function gotoProfile() {
		goto('/profile');
	}
	function logout() {
	loggingOut = true;
      authClient.signOut().then(async () => {
        invalidateAll().then(() => {
          goto('/');
        }).finally(() => {
          loggingOut = false;
        });

      }).finally(() => {
        loggingOut = false;
      });
	}

	onMount(async () => {
		try {
			initTheme();
			dark = document.documentElement.classList.contains('dark');

			// preloadMakeLogos();
			document.documentElement.classList.add('hydrated');
		} catch (err) {
			// rejectLogos(err);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Vehicle Directory</title>
</svelte:head>

<main class="flex flex-col justify-start min-h-dvh min-w-dvw bg-gray-200 dark:bg-gray-800">
	{#if data.apiDown}
		<div class="h-full w-full flex items-center justify-center my-auto">
			<div class="rounded-md bg-red-50 dark:bg-red-950 p-6 text-red-700 dark:text-white">
				<TriangleAlert />
				<h1 class="mt-4 text-xl font-semibold">Service unavailable</h1>
				<p>The server is temporarily unreachable.</p>
			</div>
		</div>
	{:else}
		<header
			class="container mx-auto sticky top-0 z-30 max-w-2xl lg:max-w-4xl px-2 sm:px-4 md:px-8 lg:px-12 py-2 max-h-13
            text-start text-gray-600 dark:text-gray-400
            flex flex-row items-center backdrop-blur-lg
            after:absolute after:left-0 after:right-0 after:bottom-0
            after:h-0.5 after:content-['']
            after:bg-linear-to-r
            after:from-transparent
            after:to-transparent
            after:via-gray-500 dark:after:via-gray-500"
		>
			<div class="grow space-x-4 flex flex-row items-center">
				{#if page.url.pathname !== '/'}
					<button
						class="px-2 py-1"
						onclick={() => {
							goto('/');
						}}
					>
						<HouseIcon />
					</button>
				{/if}

				{#if data?.user && page.data.user.image}
					<button onclick={() => gotoProfile()}>
						<UserAvatar
							src={page.data.user.image}
							className="h-12 w-12"
						/>
					</button>
				{:else if data?.user}
					<button onclick={() => gotoProfile()}>{data.user.name}</button>
				{/if}
			</div>
			<div class="shrink-0 space-x-4 flex flex-row items-center">
				{#if !data?.user && page.url.pathname.startsWith('/auth/login')}
					<button
						in:fade={{ duration: 400, delay: 100 }}
						class="txt-btn"
						onclick={() => gotoSignup()}>Sign Up</button
					>
				{:else if !data?.user}
					<button
						in:fade={{ duration: 400, delay: 100 }}
						class="txt-btn"
						onclick={() => gotoLogin()}>Log In</button
					>
				{/if}

				<button onclick={toggleTheme}>
					{#if dark}
						<LucideMoon />
					{:else}
						<LucideSun />
					{/if}
				</button>
				<button
					class=" text-gray-700 dark:text-gray-300 hover:text-amber-600 px-2 py-1"
					onclick={gotoAbout}
				>
					<CircleQuestionMark />
				</button>
				{#if data.user}
    				<button
                        disabled={loggingOut}
    					class="hidden md:block text-red-700 dark:text-red-400 hover:text-amber-600 px-2"
    					onclick={logout}
    				>
                        {#if loggingOut}
                            <Spinner size={24} />
                        {:else}
                            <LucideCirclePower />
                        {/if}
    				</button>
                {/if}
			</div>
		</header>

		{#key page.url.pathname}
			<div in:fly={{ duration: 600, x: 10, opacity: 0, easing: cubicOut }} class="grow flex flex-col mx-auto pt-6 px-6 md:px-8 lg:px-12 items-center justify-start w-full">
				{@render children()}
			</div>
		{/key}

		<footer class="p-3 text-center">
			<!-- container mx-auto sticky bottom-0 max-w-4xl p3
                text-center text-gray-600 dark:text-gray-400
                flex flex-row items-center justify-center backdrop-blur-md
                after:absolute after:left-0 after:right-0 after:top-0
                after:h-0.5 after:content-['']
                after:bg-linear-to-r
                after:from-transparent
                after:to-transparent
                after:via-gray-500 dark:after:via-gray-500"> -->
			<a href="https://simmons.studio">
				<small
					class="text-center px-6 py-1 text-gray-600 dark:text-gray-400 hover:text-amber-600 hover:font-bold transition-all duration-300"
				>
					Simmons Studio
				</small>
			</a>
		</footer>
	{/if}
</main>

<InstallPrompt />

<Toaster position="bottom-center" />

{#await import('$lib/components/PWA/ReloadPrompt.svelte') then { default: ReloadPrompt }}
	<ReloadPrompt />
{/await}
