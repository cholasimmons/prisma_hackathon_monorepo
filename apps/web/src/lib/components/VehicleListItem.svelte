<script lang="ts">
	import { getMakeLogo } from '$lib/cache/vehicle-makes';
	import { hexToColorName } from '$lib/color/colors';
	import type { Vehicle } from '$lib/models/vehicle.model';
	import defaultThumbSvg from '$lib/assets/default-vehicle-thumb.svg';

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
	const defaultThumbnail = '/images/default-vehicle-thumb.svg'; // pre-packaged in app
	let fallbackThumbnail = defaultThumbnail;

	onMount(async () => {
	    if (!vehicle.make) {
			loadingMake = false;
			return;
		}

		makeSrc = await getMakeLogo(vehicle.make).then((src) => {
			return src;
		}).finally(() => {
			loadingMake = false;
		});

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
	class={`bg-white/70 dark:bg-black/30 border border-gray-300 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow max-h-24 overflow-hidden cursor-pointer `}
	onclick={() => onClick?.(vehicle)}
	onkeydown={(e) => e.key === 'Enter' && onClick?.(vehicle)}
>
	<div class="flex flex-row items-center justify-between w-full h-full">
		<!-- Logo -->
		<div class="shrink-0 text-sm h-full">
 			{#if loadingMake}
				<!-- Circular loader -->
				<div
   					class="flex items-center justify-center w-6 h-6 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin"
				></div>
 			{:else}
				<img
   					src={makeSrc}
   					alt={vehicle.make}
   					class="w-24 object-cover object-center bg-center"
   					loading="lazy"
				/>
 			{/if}
		</div>


		<!-- Main info -->
		<div class={`flex flex-row min-w-0 items-center justify-between grow ${size === 'sm' ? 'px-4' : 'px-6'} `}>
			<div class="flex flex-col shrink gap-2 items-start">
				<span
					class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
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
				<span
					class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium  "
					style="background-color: {vehicle.color}"
				>
					{colorName}
				</span>
			</div>

			<div class="flex flex-col grow items-center flex-wrap text-gray-900 dark:text-gray-100">
    			<h3 class="text-lg sm:text-2xl font-bold truncate m-0 p-0">
    				{vehicle.make}
    				{vehicle.model || '—'}
    			</h3>
                {#if vehicle.year}<span>{vehicle.year}</span>{/if}
			</div>


			<div class="text-xs sm:text-sm text-gray-600 flex gap-2 flex-wrap">
				&nbsp;
			</div>
		</div>

		<!-- Right side thumbnail -->
		<div
			class="w-36 h-24 overflow-hidden shrink-0 flex items-center justify-center">
			{#if loadingThumb}
				<!-- Circular loader -->
				<div
					class="flex items-center justify-center w-6 h-6 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin"
				></div>
			{:else}
				<img
					src={thumbSrc}
					alt={`Photo of ${vehicle.make} ${vehicle.model || 'vehicle'}`}
					class="w-full h-full object-cover fill-gray-800 bg-white"
					loading="lazy"
				/>
			{/if}
		</div>

	</div>
</div>
