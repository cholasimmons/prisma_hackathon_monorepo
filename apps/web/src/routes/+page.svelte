<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { searchVehicles } from '$lib/api/vehicles';
	import type { Vehicle } from '$lib/models/vehicle.model';
	import { toast } from 'svelte-french-toast';
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import { cubicIn, cubicInOut } from 'svelte/easing';

	let rawInput = $state<string>('');

	// Derived clean value (always valid)
	const cleanPlate = $derived.by(() => {
		// 1. Uppercase
		let v = rawInput.toUpperCase();

		// 2. Remove invalid chars: keep A-Z, 0-9, space
		v = v.replace(/[^A-Z0-9 ]/g, '');

		// 3: Collapse all whitespace → single space
		v = v.replace(/\s+/g, ' ');

		// 4. Enforce max ONE space total — but allow typing "ABC " mid-input
		const spaces = (v.match(/ /g) || []).length;
		if (spaces > 2) {
			// Keep only first 3 parts (e.g. "A B C D" → "A B C")
			const parts = v.split(' ').filter((p) => p);
			v = parts.slice(0, 3).join(' '); // max 2 spaces → 3 parts

			// Too many spaces → keep only first space
			// const firstSpace = v.indexOf(' ');
			// v = v.slice(0, firstSpace + 1) + v.slice(firstSpace + 1).replace(/ /g, '');
		}

		// 5. Enforce max 12 chars (including space)
		v = v.slice(0, 12);

		// 5. Final cleanup: trim *only* if not actively typing a trailing space
		// → if last char is space and length < 12, keep it (user is mid-typing)
		// → otherwise, trim
		if (v.endsWith(' ') && v.length < 12) {
			// Keep trailing space while typing (e.g. "ABC ")
			return v;
		} else {
			return v.trim(); // Final clean
		}
	});

	// ✅ Side effects in $effect — debounced search + toast on truncate
	let searchTimeout: NodeJS.Timeout;

	// Optional: warn once if user pastes >12 chars
	$effect(() => {
		const id = setTimeout(() => {
			if (rawInput !== cleanPlate) {
				rawInput = cleanPlate;
			}
		}, 300); // slight delay → lets space “stick” briefly
		// return () => clearTimeout(id);

		// Debounced search
		clearTimeout(searchTimeout);
		if (cleanPlate.length >= 2) {
			searchTimeout = setTimeout(search, 600);
		} else {
			vehicles = [];
		}

		if (rawInput.length > 12 && cleanPlate.length <= 12) {
			// user typed >12, but we truncated → notify once
			toast('Max 12 characters', { duration: 1200, icon: '⚠️' });
		}
	});

	let vehicles = $state<Vehicle[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	// Debounce helper
	let debounceTimer: number;

	async function search() {
		loading = true;
		error = null;

		try {
			vehicles = await searchVehicles(cleanPlate.toLowerCase());
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Search failed';
			error = message; // local
			toast.error(message); // global
		} finally {
			loading = false;
		}
	}

	function submitVehicle() {
		// Implement logic to submit a new vehicle
		goto('/submit');
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

	// Cleanup on unmount
	onMount(() => {
		return () => clearTimeout(debounceTimer);
	});
</script>

<svelte:head>
	<title>Vehicle Search</title>
</svelte:head>

<main class="min-h-full min-w-full p-8 sm:px-6 items-start flex flex-col justify-center">
	<div class="w-full mx-auto text-center">
		<div class="mb-10">
			<img src="./logos/Plates_BaiHa.svg" alt="" class="w-18 h-18 mx-auto" />
		</div>

		<h1 class="text-2xl font-normal text-center text-gray-900 dark:text-gray-100 mb-4">
			Vehicle Search
		</h1>

		<!-- Search Bar -->
		<div class="relative mb-6">
			<label for="search-reg" class="sr-only">Enter vehicle registration</label>
			<input id="search-reg"
			    name="search-reg"
				type="text"
				bind:value={rawInput}
				oninput={handleInput}
				onblur={handleBlur}
				onkeydown={handleKeyDown}
				placeholder="ADB 3104"
				aria-label="Enter vehicle registration (letters, numbers, optional single space)"
				class="w-full max-w-sm p-1 rounded-2xl shadow-md
				 border-gray-300
				focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
				bg-gray-500 dark:bg-gray-700
				placeholder:text-gray-300 dark:placeholder:text-gray-500 placeholder:font-normal placeholder:text-center
				plates text-7xl text-center text-gray-100 dark:text-gray-300"
				autocomplete="off"
				autoCapitalize="characters"
				inputmode="text"
			/>
			<!-- <p id="search-help" class="mt-2 text-sm text-gray-500 text-center">
				Enter a vehicle registration number to search
			</p> -->
		</div>

		<!-- Loading -->
		{#if loading}
			<div
				in:fade={{ duration: 300, delay: 100 }}
				out:fade={{ duration: 100 }}
				class="mx-auto space-y-4 w-full max-w-md"
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
				class="bg-red-50 border-l-4 border-red-500 p-4 rounded"
			>
				<div class="flex">
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
						<p class="text-sm text-red-700 font-medium">Error:</p>
						<p class="text-sm text-red-600">{error}</p>
					</div>
				</div>
			</div>
		{:else if vehicles.length === 0 && cleanPlate.trim() && !loading}
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
					class="mt-6 px-4 py-2 rounded-full bg-amber-600 text-white hover:bg-amber-800 transition-colors cursor-pointer"
					onclick={() => submitVehicle()}
				>
					Add a Vehicle
				</button>
			</div>
		{:else if vehicles.length > 0}
			<div
				in:fade={{ duration: 400, delay: 100 }}
				out:fade={{ duration: 100 }}
				class="space-y-4 w-full max-w-md mx-auto"
			>
				{#each vehicles as vehicle (vehicle.id)}
					<div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
						<div class="p-4 sm:p-5">
							<div class="flex flex-col sm:flex-row gap-4">
								<!-- Photo (if exists) -->
								{#if vehicle.photos}
									<div class="shrink-0 w-20 h-20 rounded overflow-hidden bg-gray-100">
										<img
											src={vehicle.photos[0].photo}
											alt={`Photo of ${vehicle.make} ${vehicle.model || 'vehicle'}`}
											class="w-full h-full object-cover"
											loading="lazy"
											onerror={() => "this.style.display='none'"}
										/>
									</div>
								{/if}

								<!-- Info -->
								<div class="grow">
									<div class="flex flex-wrap items-baseline gap-2 mb-1">
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

									<h3 class="text-lg font-semibold text-gray-900">
										{vehicle.make}
										{vehicle.model || '—'}
									</h3>

									<div class="mt-1 text-sm text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
										{#if vehicle.year}
											<span>{vehicle.year}</span>
										{/if}
										<span class="capitalize">{vehicle.color || '—'}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Initial state: no search yet -->
			<div
				in:fade={{ duration: 400, delay: 3000 }}
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
