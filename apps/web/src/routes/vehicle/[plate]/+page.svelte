<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-french-toast';
	import { api, ApiError } from '$lib/api/client';
	import { page } from '$app/state';
	import type { Vehicle } from '$lib/models/vehicle.model';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { hexToColorName } from '$lib/color/colors';
	import Spinner from '$lib/components/Loaders/Spinner.svelte';
	import { fade, scale } from 'svelte/transition';

	let _loading = $state(true);
	let _vehicle = $state<Vehicle | null>(null);
	let _selectedPhoto = $state<string | null>(null);

	let makeLower: string | null = $state(null);
	let colorName: string = $state('Unknown');

	// 🖼️ Preload make logos on mount
	let makeLogoUrl = $state<string | null>(null);
	let logoLoading = $state(true);

	$effect(() => {
		document.title = `Vehicle Details`;
	});

	const { plate } = page.params;
	// const { data } = $props();

	onMount(async () => {
		//	let res: Response | null = null;
		let serverMessage = '';
		_loading = true;

		try {
			const response = await api.get<Vehicle>('/vehicles/' + plate);
			_vehicle = response.data;

			if (_vehicle) {
				// 🔤 Make → lowercase
				makeLower = _vehicle.make.toLowerCase();
				colorName = hexToColorName(_vehicle.color);

				// Try to load logo from `/logos/toyota.svg`, etc.
				const logoPath = `/logos/${makeLower}.svg`;
				makeLogoUrl = logoPath;

				// res = await api.raw(logoPath, { method: 'HEAD' });
				// if (res.ok) {
				// 	makeLogoUrl = logoPath;
				// 	const _response = await res.json();
				// 	serverMessage = _response.message;
				// } else {
				// 	// Fallback to PNG
				// 	const pngRes = await api.raw(`/logos/${vehicle.make}`, { method: 'HEAD' });
				// 	if (pngRes.ok) makeLogoUrl = `/logos/${vehicle.make}`;
				// }
			}
			_loading = false;
		} catch (e) {
			// silent fail → use text
			let err: string | null = null;

			if (e instanceof Error) {
				err = serverMessage ? serverMessage : (e.message ?? 'Network request failed.');
			}
			toast.error(err);
		} finally {
			_loading = false;
			logoLoading = false;
		}
	});

	function openPhoto(url: string) {
		_selectedPhoto = url;
	}

	function closePhoto() {
		_selectedPhoto = null;
	}
</script>

<svelte:head>
	<title>Vehicle Results</title>
</svelte:head>

<main
	class="mx-auto px-8 dark:text-gray-400 flex flex-col min-h-full w-full max-w-xl items-center justify-start space-y-8"
>
	<!-- Plate (large) -->
	<PageHeader title={plate ?? ' Loading Vehicle profile'} />

	{#if _loading}
		<div class="flex flex-col items-center justify-center space-y-3">
			<Spinner size={32} />
			<p class="text-sm text-gray-600 dark:text-gray-400 animate-pulse">Fetching vehicle details</p>
		</div>
	{:else if _vehicle}
		<div class="flex flex-col w-full space-y-6">
			<!-- Make Logo or Text -->
			<div class="flex justify-center items-center mb-8">
				{#if !logoLoading && makeLogoUrl}
					<img
						src={makeLogoUrl}
						alt={_vehicle.make}
						class="h-16 md:h-32 object-contain"
						loading="lazy"
					/>
				{:else if !logoLoading}
					<span class="text-2xl font-semibold text-gray-800">{_vehicle.make}</span>
				{:else}
					<div class="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
				{/if}
			</div>

			<!-- Photos Carousel / Grid -->
			{#if _vehicle.photos && _vehicle.photos.length > 0}
				<div class="mb-8">
					<h2 class="text-xl font-bold text-gray-900 mb-4">Photos</h2>

					<div class="flex flex-col md:flex-row gap-4">
						<!-- Thumbnails -->
						<div
							class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-3 md:w-1/4"
						>
							{#each _vehicle.photos as photo, i}
								<button
									type="button"
									class="group p-0 m-0 border-0 bg-transparent relative aspect-square overflow-hidden rounded-lg cursor-pointer"
									onclick={() => openPhoto(photo.url)}
								>
									<img
										src={photo.url}
										alt={`Photo ${i + 1} of ${_vehicle.plate}`}
										class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
										loading={i < 4 ? 'eager' : 'lazy'}
										decoding="async"
									/>
									<div
										class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-opacity flex items-center justify-center"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
											/>
										</svg>
									</div>
								</button>
							{/each}
						</div>

						<!-- Selected Image Preview -->
						<div class="md:w-3/4 flex items-center justify-center">
							{#if _selectedPhoto}
								<img
									src={_selectedPhoto}
									alt="Selected"
									class="w-full h-auto max-h-150 object-contain rounded-lg shadow-lg transition-all duration-300"
								/>
							{:else}
								<img
									src={_vehicle.photos[0].url}
									alt="Preview"
									class="w-full h-auto max-h-150 object-contain rounded-lg shadow-lg"
								/>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<!-- Vehicle Info Card -->
			<div class="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
				<h2 class="text-lg font-semibold mb-6">{_vehicle.make}</h2>
				<div class="text-lg md:text-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div><span class="font-medium">Model:</span> {_vehicle.model ?? 'Unspecified'}</div>

					<div><span class="font-medium">Type:</span> {_vehicle.type ?? 'Unspecified'}</div>

					<div><span class="font-medium">Year:</span> {_vehicle.year ?? 'N/A'}</div>

					<div>
						<span class="font-medium">Color:</span>
						<span class="capitalize">{colorName ?? 'Unspecified'}</span>
					</div>

					<div class="sm:col-span-2">
						<span class="font-medium">For Sale:</span>
						{_vehicle.forSale ? 'Yes' : 'No'}
					</div>
				</div>
			</div>

			<!-- Fullscreen Modal for Selected Photo -->
			{#if _selectedPhoto}
				<button
					class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
					onclick={closePhoto}
					transition:fade
				>
					<img
						src={_selectedPhoto}
						alt="Full view"
						class="max-h-full max-w-full object-contain rounded-lg shadow-lg"
						transition:scale={{ duration: 200 }}
					/>
				</button>
			{/if}
		</div>
	{/if}

	<div class="mt-6 text-center">
		<a href="/" class="hover:underline">← Search another plate</a>
	</div>
</main>
