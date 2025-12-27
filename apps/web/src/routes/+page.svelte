<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { searchVehicles } from '$lib/api/vehicles';
	import type { Vehicle } from '$lib/models/vehicle.model';
	import { toast } from 'svelte-french-toast';
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import { cubicIn, cubicInOut } from 'svelte/easing';
	import VehicleListItem from '$lib/components/VehicleListItem.svelte';
	import { formatPlateInput } from '$lib/vehicles/plate';
	import { CircleXIcon } from '@lucide/svelte';

	let rawInput = $state<string>('');

	// Derived clean value (always valid)
	const cleanPlate = $derived.by(() => formatPlateInput(rawInput));

	// ✅ Side effects in $effect — debounced search + toast on truncate
	let searchTimeout: NodeJS.Timeout;

	// Optional: warn once if user pastes >12 chars
	$effect(() => {
		// Debounced search
		clearTimeout(searchTimeout);
		if (cleanPlate.length >= 2) {
			searchTimeout = setTimeout(search, 600);
		} else {
			vehicles = [];
			hasSearched = false;
		}

		if (rawInput.length > 12 && cleanPlate.length <= 12) {
			// user typed >12, but we truncated → notify once
			toast.error('Max 12 characters', { duration: 1200, icon: '⚠️' });
		}
	});

	let vehicles = $state<Vehicle[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let hasSearched = $state(false);

	// Debounce helper
	let debounceTimer: number;

	async function search() {
		hasSearched = true;
		loading = true;
		error = null;

		try {
			vehicles = await searchVehicles(cleanPlate.toLowerCase());
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Search failed';
			error = message; // local
			// toast.error(message); // global
		} finally {
			loading = false;
		}
	}

	function submitVehicle() {
		goto(`/vehicle/submit?plate=${cleanPlate}`);
	}

	function handleInput(e: any) {
		clearTimeout(debounceTimer);
		debounceTimer = window.setTimeout(search, 900);
		// Let user type freely, but visually enforce rules
		const input = e.target as HTMLInputElement;
		input.value = cleanPlate;
		// Keep $state in sync
		rawInput = input.value;
	}

	function handleBlur() {
		// Clean up *after* they’re done typing
		rawInput = cleanPlate.trim();
	}

	function handleKeyDown(e: any) {
		if (e.key === 'Escape') {
			rawInput = '';
			handleBlur();
		}
	}

	function handleVehicleClick(plateNumber: string) {
		goto(`/vehicle/${plateNumber}`);
	}

	function _resetForm() {
		rawInput = '';
		handleBlur();
		vehicles = [];
		loading = false;
		error = null;
		hasSearched = false;
	}

	// Cleanup on unmount
	onMount(() => {
		return () => clearTimeout(debounceTimer);
	});
</script>

<svelte:head>
	<title>Vehicle Search</title>
</svelte:head>

<main class="min-h-full w-full px-8 sm:px-6 items-start flex flex-col justify-center">
	<div class="w-full text-center">
		<div class="mb-6">
			<img src="./logos/Plates_BaiHa.svg" alt="" class="w-14 h-14 mx-auto" />
		</div>

		<h1 class="text-2xl font-normal text-center text-gray-900 dark:text-gray-100 mb-2">
			Vehicle Search
		</h1>

		<!-- Search Bar -->
		<div class="mb-4">
			<label for="search-reg" class="sr-only">Enter vehicle registration</label>
			<div class="relative max-w-md mx-auto">
			    <img src="/images/CoatOfArms.webp" alt="" class="w-12 h-12 mx-auto
   					absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center"
                />
    			<input
    				id="search-reg"
    				name="search-reg"
    				type="text"
    				bind:value={rawInput}
    				oninput={handleInput}
    				onblur={handleBlur}
    				onkeydown={handleKeyDown}
    				placeholder="ADB 3104"
    				aria-label="Enter vehicle registration (letters, numbers, optional single space)"
    				class="p-1 rounded-full border-gray-300 w-full
    				focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
    				placeholder:text-gray-500  placeholder:font-normal placeholder:text-center
    				plates text-6xl md:text-7xl text-center text-gray-800 dark:text-gray-800"
                    style="background-color: #DDD; color: #222"
    				autocomplete="off"
    				autoCapitalize="characters"
    				inputmode="text"
    			/>
      	        <button
                   in:fade={{ duration: 400, delay: 100 }}
                   out:fade={{ duration: 200 }}
   					type="button"
   					onclick={_resetForm}
                    class:hidden={rawInput === ''}
   					class="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-gray-500 hover:text-gray-700"
                       style="border:none; focus:outline-none; outline:none;"
   				>
   						<CircleXIcon size={36} />
   				</button>
			</div>
		</div>

		<!--div
			in:fade={{ duration: 400, delay: 100 }}
			out:fade={{ duration: 100 }}
			class="space-y-4 w-full max-w-xl mx-auto"
		>
    		<VehicleListItem
    			vehicle={{ id: '1234', plate: 'ABC 123', make: 'Toyota', model: 'Camry', year: 2022, color: '#FF1100', type: 'Sedan', forSale: true }}
    			onClick={handleVehicleClick}
    		/>
		</div-->


		<!-- Loading -->
		{#if loading}
			<div
				in:fade={{ duration: 300, delay: 100 }}
				out:fade={{ duration: 100 }}
				class="mx-auto space-y-4 max-w-md"
			>
				{#each { length: 3 } as _, i (i)}
					<div class="bg-white p-4 rounded-lg shadow animate-pulse">
						<div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
						<div class="h-4 bg-gray-200 rounded w-1/2"></div>
					</div>
				{/each}
			</div>
		{:else if error}
			<div
				in:fade={{ duration: 400, delay: 100 }}
				out:fade={{ duration: 100 }}
				class="mx-auto bg-red-50 border-l-4 border-red-500 p-4 rounded-lg w-full max-w-md"
			>
				<div class="flex items-center">
					<div class="shrink-0">
						<svg
							class="h-5 w-5 text-red-400"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div class="ml-3 text-start">
						<!--p class="text-sm text-red-700 font-medium">Error:</p-->
						<p class="text-sm text-red-600 py-3">{error}</p>
					</div>
				</div>
			</div>
		{:else if hasSearched && vehicles.length === 0 && !loading}
			<div
				in:fade={{ duration: 400, delay: 100 }}
				out:fade={{ duration: 100 }}
				class="text-center py-2 w-full max-w-md mx-auto"
			>
				<svg
					class="mx-auto h-12 w-12 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">No vehicles found</h3>
				<p class="mt-1 text-gray-500">Check the registration number and search again.</p>
				<button
					in:scale={{ duration: 800, start: 0.8, easing: cubicIn, delay: 1600 }}
					style="padding: 4px 16px"
					class="txt-btn mt-6"
					onclick={submitVehicle}
				>
					Add a Vehicle
				</button>
			</div>
		{:else if vehicles.length > 0}
			<div
				in:fade={{ duration: 400, delay: 100 }}
				out:fade={{ duration: 100 }}
				class="space-y-4 w-full max-w-xl mx-auto"
			>
				{#each vehicles as vehicle (vehicle.id)}
					<VehicleListItem {vehicle} onClick={handleVehicleClick} />
				{/each}
			</div>
		{:else}
			<!-- Initial state: no search yet -->
			<div
				in:fade={{ duration: 400, delay: 2000 }}
				out:fade={{ duration: 100 }}
				class="text-center py-4 text-gray-500 w-full max-w-md mx-auto"
			>
				Enter a registration number to begin searching.
			</div>
		{/if}
	</div>
</main>

<style>
</style>
