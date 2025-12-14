<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import toast, { Toaster } from 'svelte-french-toast';

	// Supports weights 100-900
	import '@fontsource-variable/montserrat';
	import '@fontsource/rubik-mono-one';

	import { onMount } from 'svelte';
	import { logos, fetchLogos } from '$lib/state/logos.svelte';

	let { children } = $props();

	// This promise will be linked to toast.promise
	let resolveLogos: any, rejectLogos: any;
	const logosPromise = new Promise((resolve, reject) => {
		resolveLogos = resolve;
		rejectLogos = reject;
	});

	// Immediately show "loading…" toast
	toast.promise(logosPromise, {
		loading: 'Fetching logos...',
		success: 'Logos saved!',
		error: 'Could not fetch logos'
	});

	onMount(() => {
		try {
			fetchLogos()
				.then(() => {
					resolveLogos();
					console.log(logos.length + ' logos found. ');
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

<main class="flex flex-col justify-center min-h-screen w-full bg-gray-100 dark:bg-gray-800">
	<div class="grow flex justify-center w-full pt-12">{@render children()}</div>
	<footer class="py-4 text-center">
		<a href="https://simmons.studio">
			<small class="text-gray-400 hover:text-amber-600 hover:font-bold transition-all duration-300">
				Simmons Studio
			</small>
		</a>
	</footer>
</main>

<Toaster position="bottom-center" />
