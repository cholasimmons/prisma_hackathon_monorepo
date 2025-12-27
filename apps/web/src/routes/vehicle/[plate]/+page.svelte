<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-french-toast';
	import { api, ApiError } from '$lib/api/client';
	import { page } from '$app/state';
	import type { Vehicle } from '$lib/models/vehicle.model';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { hexToColorName } from '$lib/color/colors';

	let _loading = $state(true);
	let _vehicle = $state<Vehicle | null>(null);

	$effect(() => {
		document.title = `Vehicle Details`;
	});

	const { plate } = page.params;
	// const { data } = $props();

	let makeLower: string | null = $state(null);
	let colorName: string = $state('Unknown');

	// 🖼️ Preload make logos on mount
	let makeLogoUrl = $state<string | null>(null);
	let logoLoading = $state(true);

	onMount(async () => {
		let res: Response | null = null;
		let serverMessage = '';

		console.log('encoded plate:', `/vehicles/${encodeURIComponent(plate!)}`);
		console.log('regular plate:', plate);
		console.log('concatenated plate:', "/vehicles/"+plate);

		try {
			const response = await api.get<Vehicle>("/vehicles/"+plate);
			const vehicle = response.data;
			console.log(vehicle);

			if (vehicle) {
				// 🔤 Make → lowercase
				makeLower = vehicle.make.toLowerCase();
				colorName = hexToColorName(vehicle.color);

				// Try to load logo from `/logos/toyota.svg`, etc.
				const logoPath = `/logos/${vehicle.make}`;

				res = await api.raw(logoPath, { method: 'HEAD' });
				if (res.ok) {
					makeLogoUrl = logoPath;
					const response = await res.json();
					serverMessage = response.message;
				} else {
					// Fallback to PNG
					const pngRes = await api.raw(`/logos/${vehicle.make}`, { method: 'HEAD' });
					if (pngRes.ok) makeLogoUrl = `/logos/${vehicle.make}`;
				}
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
			logoLoading = false;
		}
	});
</script>

<svelte:head>
	<title>Vehicle Results</title>
</svelte:head>

<main
	class="mx-auto px-8 dark:text-gray-400 flex flex-col min-h-full w-full max-w-xl items-center justify-start space-y-8"
>
	{#if _loading}
		<div class="h-2 w-36 bg-gray-200 animate-pulse rounded"></div>
	{:else if _vehicle}
		<!-- Plate (large) -->
		<PageHeader title={_vehicle.plate} description={_vehicle.make} />

		<!-- Make (with logo or text) -->
		<div class="flex justify-center items-center mb-10">
			{#if !logoLoading && makeLogoUrl}
				<img
					src={makeLogoUrl}
					alt={_vehicle.make}
					class="h-12 md:h-16 object-contain"
					loading="lazy"
				/>
			{:else if !logoLoading}
				<span class="text-2xl font-semibold text-gray-800">{_vehicle.make}</span>
			{:else}
				<div class="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
			{/if}
		</div>

		<!-- Photos Grid -->
		{#if _vehicle.photos && _vehicle.photos.length > 0}
			<div class="mb-8">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Photos</h2>
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					{#each _vehicle.photos as photo, i}
						<div class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
							<img
								src={photo.url}
								alt={`Photo ${i + 1} of ${_vehicle.plate}`}
								class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
								loading={i < 4 ? 'eager' : 'lazy'}
								decoding="async"
							/>
							<!-- Optional zoom hint -->
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
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Vehicle Info -->
		<div class="bg-white rounded-xl shadow p-6">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
				{#if _vehicle.model}
					<div><span class="font-medium">Model:</span> {_vehicle.model}</div>
				{/if}
				{#if _vehicle.color}
					<div>
						<span class="font-medium">Color:</span>
						<span class="capitalize">{colorName}</span>
					</div>
				{/if}
				{#if _vehicle.year}
					<div><span class="font-medium">Year:</span> {_vehicle.year}</div>
				{/if}
				<div><span class="font-medium">For Sale:</span> {_vehicle.forSale ? 'Yes' : 'No'}</div>
			</div>
		</div>
	{:else}
		<div class="mt-6 text-center">
			<a href="/" class="hover:underline">← Search another plate</a>
		</div>
	{/if}
</main>
