<script lang="ts">
	import { onMount } from 'svelte';
	import { searchVehicles } from '$lib/api/vehicles';
	import type { Vehicle } from '$lib/models/vehicle.model';
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import { cubicIn } from 'svelte/easing';
	import VehicleListItem from '$lib/components/VehicleListItem.svelte';
	import PlatesInput from '$lib/components/PlatesInput.svelte';

	let numberPlate = $state<string>('');
	let vehicles = $state<Vehicle[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let hasSearched = $state(false);

	// Debounce helper
	let debounceTimer: number;

	async function search(plate: string) {
		hasSearched = false;
		loading = true;
		error = null;

		try {
			vehicles = await searchVehicles(plate);
			hasSearched = true;
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Search failed';
			error = message; // local
			// toast.error(message); // global
		} finally {
			loading = false;
		}
	}

	function submitVehicle() {
		goto(`/vehicle/submit?plate=${numberPlate}`);
	}

	function onPlateChange(plate: string) {
		numberPlate = plate;

		clearTimeout(debounceTimer);

		if (plate.length < 2) {
			vehicles = [];
			error = null;
			loading = false;
			hasSearched = false;
			return;
		}

		debounceTimer = window.setTimeout(() => {
			search(plate);
		}, 600);
	}

	function handleVehicleClick(plateNumber: string) {
		goto(`/vehicle/${plateNumber}`);
	}

	// Cleanup on unmount
	onMount(() => {
		return () => clearTimeout(debounceTimer);
	});
</script>

<svelte:head>
	<title>Vehicle Search</title>
</svelte:head>

<main class="min-h-full w-full items-center flex flex-col justify-start">
	<div class="max-w-md lg:max-w-lg flex flex-col mx-auto w-full text-center">
		<div class="mb-6">
			<img src="./logos/Plates_BaiHa.svg" alt="" class="w-14 h-14 mx-auto" />
		</div>

		<h1 class="text-2xl font-normal text-center text-gray-900 dark:text-gray-100 mb-4">
			Vehicle Search
		</h1>

		<!-- Search Bar -->
		<div class="mb-4">
			<label for="search-reg" class="sr-only">Enter vehicle registration</label>
			<PlatesInput mode="search" name="plate" onChange={onPlateChange} />
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
				class="mx-auto space-y-4 w-full"
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
				class="mx-auto bg-red-50 border-l-4 border-red-500 p-4 rounded-lg w-full"
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
				class="text-center py-2 w-full mx-auto"
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
				class="space-y-4 w-full mx-auto"
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
				class="text-center py-4 text-gray-500 w-full mx-auto"
			>
				Enter a registration number to begin searching.
			</div>
		{/if}
	</div>
</main>

<style>
</style>
