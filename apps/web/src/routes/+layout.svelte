<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import toast, { Toaster } from 'svelte-french-toast';
	import { page } from '$app/state';

	// Supports weights 100-900
	import '@fontsource-variable/montserrat';
	import '@fontsource/rubik-mono-one';

	import { onMount } from 'svelte';
	import { logos, fetchLogos } from '$lib/state/logos.svelte';
	import { authClient } from '$lib/auth-client';
	import { goto, refreshAll } from '$app/navigation';

	let { children } = $props();

	// This promise will be linked to toast.promise
	let resolveLogos: any, rejectLogos: any;
	const logosPromise = new Promise((resolve, reject) => {
		resolveLogos = resolve;
		rejectLogos = reject;
	});

	// Immediately show "loading…" toast
	// toast.promise(logosPromise, {
	// 	loading: 'Fetching logos...',
	// 	success: 'Logos saved!',
	// 	error: 'Could not fetch logos'
	// });

	function logout() {
		authClient.signOut().then(() => {
			console.log('User signed out');
			refreshAll();
		});
	}
	function login() {
		goto('/login');
		// authClient.signIn.email({email, password, callbackURL: '/', rememberMe: true}).then(() => {
		// 	console.log('User signed out');
		// 	refreshAll();
		// });
	}

	function about() {
		toast.success('a Simmons Studio project');
	}

	onMount(() => {
		try {
			fetchLogos()
				.then(() => {
					resolveLogos();
					console.log(logos().length + ' logos found. ');
				})
				.catch(() => rejectLogos());
			// toast('Welcome!', { icon: '👋' });
		} catch (err) {
			rejectLogos(err);
		}
	});

	// 		const topMakes = [
	// 	'toyota',
	// 	'ford',
	// 	'honda',
	// 	'nissan',
	// 	'bmw',
	// 	'mazda',
	// 	'chevrolet',
	// 	'audi',
	// 	'lexus',
	// 	'volkswagen',
	// 	'subaru',
	// 	'hyundai',
	// 	'jeep',
	// 	'kia',
	// 	'mercedes-benz',
	// 	'porsche',
	// 	'volvo',
	// 	'alfa-romeo',
	// 	'aston-martin',
	// 	'bentley',
	// 	'dodge',
	// 	'fiat',
	// 	'gmc',
	// 	'infiniti',
	// 	'jaguar',
	// 	'land-rover',
	// 	'lincoln',
	// 	'lotus',
	// 	'maserati',
	// 	'mini',
	// 	'nissan',
	// 	'opel',
	// 	'peugeot',
	// 	'ram',
	// 	'rolls-royce',
	// 	'saab',
	// 	'ssangyong',
	// 	'suzuki',
	// 	'tesla'
	// ];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Vehicle Directory</title>
</svelte:head>

<main class="flex flex-col justify-start min-h-dvh w-full bg-gray-100 dark:bg-gray-800">
	<header
		class="container mx-auto max-w-7xl px-8 py-4 text-start text-gray-400 flex flex-row w-full items-center"
	>
		<div class="grow">
			{#if page.data?.user}
				${page.data.user.name}
			{:else}
				<p>Welcome!</p>
			{/if}
		</div>
		<div class="shrink-0 space-x-2">
			{#if page.data?.user}
				<button
					class="border-red-900 border-2 text-red-400 px-6 py-1 rounded-2xl cursor-pointer"
					onclick={() => logout()}>Logout</button
				>
			{:else}
				<button
					class="border-amber-600 border-2 text-amber-600 hover:border-amber-500 hover:text-amber-500 hover:bg-amber-500/20 px-6 py-1 rounded-2xl cursor-pointer"
					onclick={() => login()}>Login</button
				>
			{/if}
			<button
				class="bg-amber-600 border-2 border-amber-600 text-gray-800 hover:text-white hover:bg-gray-800 px-2 py-1 rounded-full cursor-pointer"
				onclick={() => about()}>❔</button
			>
		</div>
	</header>

	<div class="grow flex flex-col w-full pt-4">
		{@render children()}
	</div>

	<footer class="py-4 text-center">
		<a href="https://simmons.studio">
			<small class="text-gray-400 hover:text-amber-600 hover:font-bold transition-all duration-300">
				Simmons Studio
			</small>
		</a>
	</footer>
</main>

<Toaster position="bottom-center" />
