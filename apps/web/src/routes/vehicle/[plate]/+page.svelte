<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { Vehicle } from '$lib/models/vehicle.model';
	import { toast } from 'svelte-french-toast';
	import { api, ApiError } from '$lib/api/client';

	$effect(() => {
		document.title = `${$page.data.vehicle.plate} • Vehicle Details`;
	});

	const { vehicle } = $page.data;

	// 🔤 Make → lowercase
	const makeLower = vehicle.make.toLowerCase();

	// 🖼️ Preload make logos on mount
	let makeLogoUrl = $state<string | null>(null);
	let logoLoading = $state(true);

	onMount(async () => {
		let res: Response | null = null;
		let serverMessage = '';

		try {
			// Try to load logo from `/logos/toyota.svg`, etc.
			const logoPath = `/logos/${makeLower}.svg`;

			res = await api.raw(logoPath, { method: 'HEAD' });
			if (res.ok) {
				makeLogoUrl = logoPath;
				const response = await res.json();
				serverMessage = response.message;
			} else {
				// Fallback to PNG
				const pngRes = await api.raw(`/logos/${makeLower}.webp`, { method: 'HEAD' });
				if (pngRes.ok) makeLogoUrl = `/logos/${makeLower}.webp`;
			}
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

<main class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6">
	<div class="max-w-4xl mx-auto px-4 py-8">
		<!-- Plate (large) -->
		<div class="text-center mb-8">
			<span
				class="inline-block bg-blue-600 text-white font-['License_Plate'] text-5xl md:text-6xl px-6 py-3 rounded tracking-wider shadow-md"
			>
				{vehicle.plate}
			</span>
		</div>

		<!-- Make (with logo or text) -->
		<div class="flex justify-center items-center mb-10">
			{#if !logoLoading && makeLogoUrl}
				<img
					src={makeLogoUrl}
					alt={vehicle.make}
					class="h-12 md:h-16 object-contain"
					loading="lazy"
				/>
			{:else if !logoLoading}
				<span class="text-2xl font-semibold text-gray-800">{vehicle.make}</span>
			{:else}
				<div class="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
			{/if}
		</div>

		<!-- Photos Grid -->
		{#if vehicle.photos && vehicle.photos.length > 0}
			<div class="mb-8">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Photos</h2>
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					{#each vehicle.photos as url, i}
						<div class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
							<img
								src={url}
								alt={`Photo ${i + 1} of ${vehicle.plate}`}
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
				{#if vehicle.model}
					<div><span class="font-medium">Model:</span> {vehicle.model}</div>
				{/if}
				{#if vehicle.color}
					<div>
						<span class="font-medium">Color:</span> <span class="capitalize">{vehicle.color}</span>
					</div>
				{/if}
				{#if vehicle.year}
					<div><span class="font-medium">Year:</span> {vehicle.year}</div>
				{/if}
				<div><span class="font-medium">For Sale:</span> {vehicle.forSale ? 'Yes' : 'No'}</div>
			</div>
		</div>

		<div class="mt-6 text-center">
			<a href="/" class="text-blue-600 hover:underline">← Search another plate</a>
		</div>
	</div>
</main>
