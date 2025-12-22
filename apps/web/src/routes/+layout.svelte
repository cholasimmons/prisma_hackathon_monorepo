<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import toast, { Toaster } from 'svelte-french-toast';
	import { page } from '$app/state';

	// Supports weights 100-900
	import '@fontsource-variable/montserrat';
	import '@fontsource/rubik-mono-one';

	import { onMount } from 'svelte';
	import { initTheme, applyTheme } from '$lib/theme';
	import { goto, refreshAll } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import {
		LucideLightbulb,
		LightbulbOffIcon,
		CircleQuestionMark,
		HouseIcon,
		TriangleAlert
	} from '@lucide/svelte';
	import { authClient } from '$lib/auth-client.js';
	import { preloadMakeLogos } from '$lib/cache/preload-logos.js';

	let { children, data } = $props();
	let dark = $state(true);

	function logout() {
		authClient.signOut().then(() => {
			refreshAll();
		});
	}
	function gotoLogin() {
		goto('/login');
	}
	function gotoSignup() {
		goto('/signup');
	}

	function toggleTheme() {
		dark = !dark;
		applyTheme(dark ? 'dark' : 'light');
	}
	function about() {
		toast.success('a Simmons Studio project');
	}

	onMount(async () => {
		try {
			// const { registerSW } = await import('virtual:pwa-register');
			// registerSW({ immediate: true });

			initTheme();
			dark = document.documentElement.classList.contains('dark');

			preloadMakeLogos();
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
			class="container mx-auto max-w-7xl px-8 py-4 text-start text-gray-600 dark:text-gray-400 flex flex-row items-center"
		>
			<div class="grow space-x-4 flex flex-row items-center">
				{#if page.url.pathname !== '/'}
					<button
						class=" text-gray-700 dark:text-gray-300 hover:text-amber-600 px-2 py-1 cursor-pointer"
						onclick={() => goto('/')}
					>
						<HouseIcon />
					</button>
				{/if}

				{#if data?.user}
					<button onclick={() => goto('/profile')}>{data.user.name}</button>
				{/if}
			</div>
			<div class="shrink-0 space-x-4 flex flex-row items-center">
				{#if page.data?.user}
					<button
						class="border-red-900 border-2 text-red-400 px-6 py-1 rounded-2xl cursor-pointer"
						onclick={() => logout()}>Logout</button
					>
				{:else if page.url.pathname.startsWith('/login')}
					<button
						in:fade={{ duration: 400, delay: 250 }}
						out:fade={{ duration: 200 }}
						class="txt-btn"
						onclick={() => gotoSignup()}>Sign Up</button
					>
				{:else}
					<button
						in:fade={{ duration: 400, delay: 250 }}
						out:fade={{ duration: 200 }}
						class="txt-btn"
						onclick={() => gotoLogin()}>Login</button
					>
				{/if}
				<button
					class=" text-gray-700 dark:text-gray-300 hover:text-amber-600 px-1.5 py-1 cursor-pointer items-center"
					onclick={toggleTheme}
				>
					{#if dark}
						<LucideLightbulb />
					{:else}
						<LightbulbOffIcon />
					{/if}
				</button>
				<button
					class=" text-gray-700 dark:text-gray-300 hover:text-amber-600 px-2 py-1 cursor-pointer"
					onclick={() => about()}
				>
					<CircleQuestionMark />
				</button>
			</div>
		</header>

		<div class="grow flex flex-col w-full pt-4">
			{@render children()}
		</div>

		<footer class="text-center p-3">
			<a href="https://simmons.studio">
				<small
					class="px-6 py-1 text-gray-600 dark:text-gray-400 hover:text-amber-600 hover:font-bold transition-all duration-300"
				>
					Simmons Studio
				</small>
			</a>
		</footer>
	{/if}
</main>

<Toaster position="bottom-center" />
