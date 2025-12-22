<script lang="ts">
	import { getMakeLogo } from '$lib/cache/vehicle-makes';
	import { hexToColorName } from '$lib/color/colors';
	import type { Vehicle } from '$lib/models/vehicle.model';

	import { onMount } from 'svelte';
	const {
		vehicle,
		onClick,
		size = 'md'
	}: Props = $props();

	type Props = {
		vehicle: Vehicle;
		onClick?: (vehicle: Vehicle) => void;
		size?: 'sm' | 'md';
	};
	// Reactive state for thumbnail
	let thumbSrc = $state<string | null>(null);
	let makeSrc = $state<string | null>(null);
	let loadingThumb = $state(true);
	let loadingMake = $state(true);
	let loadError = $state(false);
	let colorName = $state<string | null>(null);

	// Preloaded default thumbnail
	const defaultThumbnail = '/images/default-vehicle-thumb.jpg'; // pre-packaged in app
	let fallbackThumbnail = defaultThumbnail;

	onMount(async () => {
	    if (!vehicle.make) {
			loadingMake = false;
			return;
		}

		makeSrc = await getMakeLogo(vehicle.make);
		loadingMake = false;

		colorName = hexToColorName(vehicle.color) ?? 'Unknown';

		if (vehicle.photos?.length) {
			const img = new Image();
			img.src = vehicle.photos[0].photo;
			img.onload = () => {
				thumbSrc = vehicle.photos?.[0].photo ?? fallbackThumbnail;
				loadingThumb = false;
			};
			img.onerror = () => {
				loadError = true;
				thumbSrc = fallbackThumbnail;
				loadingThumb = false;
			};
		} else {
			// No photo provided, use fallback
			thumbSrc = fallbackThumbnail;
			loadingThumb = false;
		}
	});
</script>

<div
    role="link"
    tabindex="0"
	class={`bg-white/50 rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden cursor-pointer ${size === 'sm' ? 'p-2' : 'p-4'}`}
	onclick={() => onClick?.(vehicle)}
	onkeydown={(e) => e.key === 'Enter' && onClick?.(vehicle)}
>
	<div class="flex items-center gap-3">
		<!-- Logo -->
		<div class="shrink-0 text-gray-400 text-xs sm:text-sm">
			{#if vehicle.make}
    			{#if loadingMake}
    				<!-- Circular loader -->
    				<div
    					class="w-6 h-6 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin"
    				></div>
    			{:else}
    				<img
    					src={makeSrc}
    					alt={vehicle.make}
    					class="w-full h-full object-cover"
    					loading="lazy"
    				/>
    			{/if}
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
				<span>{colorName || 'Unspecified Color'}</span>
			</div>
		</div>

		<!-- Right side thumbnail -->
		<div
			class="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
			{#if loadingThumb}
				<!-- Circular loader -->
				<div
					class="w-6 h-6 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin"
				></div>
			{:else}
				<img
					src={thumbSrc}
					alt={`Photo of ${vehicle.make} ${vehicle.model || 'vehicle'}`}
					class="w-full h-full object-cover"
					loading="lazy"
				/>
			{/if}
		</div>

	</div>
</div>
