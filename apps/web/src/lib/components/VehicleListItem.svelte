<script lang="ts">
	import type { Vehicle } from '$lib/models/vehicle.model';

	import { onMount } from 'svelte';
	const {
		vehicle,
		onClick,
		size = 'md'
	}: { vehicle: Vehicle; onClick: () => void; size?: 'sm' | 'md' } = $props();

	// Reactive state for thumbnail
	let imgSrc = <string | null>$state(null);
	let loading = $state(true);
	let loadError = $state(false);
	let imgRef = $state<HTMLImageElement | null>(null);

	// Preloaded default thumbnail
	const defaultThumbnail = '/images/default-vehicle-thumb.jpg'; // pre-packaged in app
	let fallbackThumbnail = defaultThumbnail;

	onMount(() => {
		if (vehicle.photos?.length) {
			const img = new Image();
			img.src = vehicle.photos[0].photo;
			img.onload = () => {
				imgSrc = vehicle.photos?.[0].photo ?? fallbackThumbnail;
				loading = false;
			};
			img.onerror = () => {
				loadError = true;
				imgSrc = fallbackThumbnail;
				loading = false;
			};
		} else {
			// No photo provided, use fallback
			imgSrc = fallbackThumbnail;
			loading = false;
		}
	});
</script>

<a
	href={`/vehicle/${vehicle!.plate}`}
	class="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
	onclick={onClick}
	class:sm:p-2={size === 'sm'}
	class:md:p-4={size === 'md'}
>
	<div class="flex items-center gap-3">
		<!-- Thumbnail -->
		<div
			class="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center"
		>
			{#if loading}
				<!-- Circular loader -->
				<div
					class="w-6 h-6 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin"
				></div>
			{:else}
				<img
					src={imgSrc}
					alt={`Photo of ${vehicle.make} ${vehicle.model || 'vehicle'}`}
					class="w-full h-full object-cover"
					loading="lazy"
				/>
			{/if}
		</div>

		<!-- Main info -->
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-1 flex-wrap">
				<span
					class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
				>
					{vehicle.plate}
				</span>
				{#if vehicle.forSale}
					<span
						class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
					>
						🏷️ For Sale
					</span>
				{/if}
			</div>

			<h3 class="text-sm sm:text-base font-semibold truncate">
				{vehicle.make}
				{vehicle.model || '—'}
			</h3>

			<div class="text-xs sm:text-sm text-gray-600 flex gap-2 flex-wrap">
				{#if vehicle.year}<span>{vehicle.year}</span>{/if}
				<span class="capitalize">{vehicle.color || '—'}</span>
			</div>
		</div>

		<!-- Right side placeholder (optional) -->
		<!-- <div class="flex-shrink-0 text-gray-400 text-xs sm:text-sm">
			{#if vehicle.mileage}
				<span>{vehicle.mileage} km</span>
			{/if}
		</div> -->
	</div>
</a>
