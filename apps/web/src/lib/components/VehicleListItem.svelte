<script lang="ts">
	import { getMakeLogo } from '$lib/cache/vehicle-makes';
	import { hexToColorName } from '$lib/color/colors';
	import type { Vehicle } from '$lib/models/vehicle.model';
	import defaultThumbSvg from '$lib/assets/default-vehicle-thumb.svg';

	import { onMount } from 'svelte';
	const { vehicle, onClick }: Props = $props();

	type Props = {
		vehicle: Vehicle;
		onClick?: (plateNumber: string) => void;
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

		makeSrc = await getMakeLogo(vehicle.make)
			.then((src) => {
				return src;
			})
			.finally(() => {
				loadingMake = false;
			});

		colorName = hexToColorName(vehicle.color) ?? 'Unknown';

		if (vehicle.photos?.length) {
			const img = new Image();
			img.src = vehicle.photos[0].url;
			img.onload = () => {
				thumbSrc = vehicle.photos?.[0].url ?? fallbackThumbnail;
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
	class={`bg-white/70 dark:bg-black/30 border border-gray-300 dark:border-gray-700 rounded-lg hover:shadow-xl transition-shadow max-h-28 overflow-hidden cursor-pointer `}
	onclick={() => {
		onClick?.(vehicle.plate);
	}}
	onkeydown={(e) => {
		e.key === 'Enter' && onClick?.(vehicle.plate);
	}}
>
	<div class="flex flex-row items-center justify-evenly w-full h-full">
		<!-- Logo -->
		<div class="shrink-0 text-sm h-full">
			{#if loadingMake}
				<!-- Circular loader -->
				<div
					class="flex items-center justify-center w-6 h-6 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin"
				></div>
			{:else if makeSrc}
				<img
					src={makeSrc}
					alt={vehicle.make}
					class="p-1 w-20 object-fit object-center bg-center fill-red-500"
					loading="lazy"
				/>
			{/if}
		</div>

		<!-- Main info -->
		<div
			class={`flex flex-row min-w-0 items-center justify-between grow `}
			style="border-top: 4px solid {vehicle.color}"
		>
			<div class="flex flex-col shrink gap-2 items-start pl-2">

			</div>

			<div class="flex flex-col grow items-center flex-wrap text-gray-900 dark:text-gray-100 ">
				<h3 class="text-lg sm:text-2xl font-semibold truncate m-0 p-0">
					{vehicle.make}
					{vehicle.model}
				</h3>
				<div>
				    {#if vehicle.year}<span>{vehicle.year}</span>{/if}&nbsp;
				    {#if vehicle.type}<span>{vehicle.type}</span>{/if}
				</div>
				<span class="text-sm opacity-50">{vehicle.plate}</span>
			</div>

			<div class="text-xs sm:text-sm text-gray-600 flex gap-2 flex-wrap pr-4">
    			{#if vehicle.forSale}
    				<span
    					class="inline-flex items-center p-1 rounded-full hover:bg-amber-600 font-medium"
    					title="Vehicle is for sale"
    				>
    					🏷️
    				</span>
    			{/if}
			</div>
		</div>

		<!-- Right side thumbnail -->
		<div class="w-24 overflow-hidden shrink-0 flex items-center justify-center">
			{#if loadingThumb}
				<!-- Circular loader -->
				<div
					class="flex items-center justify-center w-6 h-6 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin"
				></div>
			{:else if thumbSrc}
				<img
					src={thumbSrc}
					alt={`Photo of ${vehicle.make} ${vehicle.model || 'vehicle'}`}
					class="p-2 h-full object-fit fill-gray-800"
					loading="lazy"
				/>
			{/if}
		</div>
	</div>
</div>
