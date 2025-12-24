<script lang="ts">
	import { fade } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { api } from '$lib/api/client';
	import toast from 'svelte-french-toast';
	import type { VehicleSubmission } from '$lib/models/vehicle.model';
	import ColorPicker, { ChromeVariant } from 'svelte-awesome-color-picker';
	import { hexToColorName } from '$lib/color/colors';
	import { formatPlateInput } from '$lib/vehicles/plate';
	import ImageUploader from '$lib/components/ImageUploader.svelte';
	import { ThumbsUp } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { VehicleType, VEHICLE_TYPE_VALUES } from '$lib/models/vehicle.model';

	let vehicleType = $state<VehicleType | ''>('');
	let vehicleImages: File[] = [];

	let _submitting = $state(false);
	let _submitted = $state(false);

	let colorHex = $state('#000000');
	let colorName = $derived.by(() => {
		return colorHex ? hexToColorName(colorHex) : 'Black';
	});

	let rawInput = $state<string>('');

	// Derived clean value (always valid)
	const cleanPlate = $derived.by(() => formatPlateInput(rawInput));

	function handleInput(e: any) {
		// Let user type freely, but visually enforce rules
		const input = e.target as HTMLInputElement;
		input.value = cleanPlate;
		// Keep $state in sync
		rawInput = input.value;
	}

	const handleEnhance = () => {
		// form submission finished
		_submitting = true;

		return async ({ result, update }: any) => {
			await update();

			if (result?.type === 'success') {
				const { plate, make, color, colorName, model, year, forSale } = result.data;

				const formData = new FormData();
				formData.append('plate', plate);
				formData.append('make', make ?? '');
				formData.append('color', color ?? '');
				formData.append('model', model ?? '');
				formData.append('year', String(year ?? ''));
				formData.append('forSale', forSale ? 'true' : 'false');
				formData.append('image', vehicleImages[0]);

				// Append images from your bound ImageUpload component
				// vehicleImages.forEach((file) => formData.append('image', file));

				const response = await api.post<VehicleSubmission>('/vehicles/submit', formData, {
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				});

				if (response.success === true && response.message) {
					toast.success(response.message);
				} else if (response.success === false && response.message) {
					toast.error(response.message);
				}
			} else if (result?.type === 'error' || result?.type === 'failure') {
				toast.error(result.data.message);
			}

			_submitting = false;
		};
	};

	function handleImageChange(files: File[]) {
		vehicleImages = files;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		const form = e.currentTarget as HTMLFormElement;
		const formData = new FormData(form);

		// Append images manually
		vehicleImages.forEach((file) => {
			formData.append('image', file);
		});

		// Optional: do client-side validation
		if (vehicleImages.length > 3) {
			alert('Max 3 images allowed');
			return;
		}

		// Send form data to your API
		const res = await api.post<VehicleSubmission>('/vehicles', { formData });

		if (res.success) {
			toast.success(res.message ?? 'Vehicle submitted successfully');
		} else {
			toast.error(res.message ?? 'Failed to submit vehicle');
		}
	}
</script>

<main
	class="mx-auto px-8 py-4 dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
	{#if _submitted}
		<div
			in:fade={{ duration: 500, delay: 100 }}
			class="flex flex-col justify-center items-center my-12 space-y-2"
		>
			<ThumbsUp class="w-10 h-10 -rotate-[8deg] animate-bounce " />
			<p class="text-center text-2xl">Thank you for submitting a Vehicle!</p>
			<p class="mb-8 md:text-sm">Our team will review your submission shortly.</p>

			<button
				in:fade={{ duration: 600, delay: 3000 }}
				onclick={() => {
					goto('/');
				}}
				class="mt-6"
				style="padding: 6px 18px;">Back Home</button
			>
		</div>
	{:else}
		<PageHeader
			title="Submit a Vehicle"
			description="Your submission will be reviewed by our team."
		/>

		<form
			in:fade={{ duration: 500 }}
			method="POST"
			use:enhance={handleEnhance}
			class="space-y-4 max-w-lg mx-auto"
		>
			<!-- PLATE (Hero Field) -->
			<section class="text-center">
				<input
					name="plate"
					placeholder="ADB 3104"
					bind:value={rawInput}
					oninput={handleInput}
					type="text"
					aria-label="Enter vehicle registration (letters, numbers, optional single space)"
					class="w-full max-w-lg p-1 rounded-2xl
                    placeholder:font-normal placeholder:text-center
    				plates text-6xl text-center"
					required
					disabled={_submitting}
					autocomplete="off"
					autocorrect="off"
					autocapitalize="characters"
					inputmode="text"
					spellcheck="false"
					maxlength="12"
				/>
			</section>

			<!-- MAKE + MODEL -->
			<section class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
				<div>
					<label for="make" class="block text-sm text-gray-500 mb-1"> Make </label>
					<input
						id="make"
						name="make"
						inputmode="text"
						placeholder="Toyota"
						autocapitalize="words"
						class="w-full rounded-lg border px-3 py-2 text-gray-800 dark:text-gray-300 dark:bg-gray-600 focus:border-amber-600 focus:ring focus:outline-none text-xl font-medium"
						disabled={_submitting}
					/>
				</div>

				<div>
					<label for="model" class="block text-sm text-gray-500 mb-1"> Model </label>
					<input
						id="model"
						name="model"
						inputmode="text"
						autocapitalize="words"
						placeholder="Corolla"
						class="w-full rounded-lg border px-3 py-2 text-gray-800 dark:text-gray-800 text-xl font-medium"
						disabled={_submitting}
					/>
				</div>
			</section>

			<section class="flex flex-wrap gap-4 items-end mt-4">
				<!-- Color -->
				<div class="flex-1 min-w-32">
					<label hidden for="color" class="block text-sm text-gray-500 mb-1"> Color </label>
					<ColorPicker
						label={colorName}
						bind:hex={colorHex}
						components={ChromeVariant}
						sliderDirection="horizontal"
						--input-size="36px"
						--focus-color="amber"
					/>
					<input type="hidden" id="color" name="color" value={colorHex ?? ''} />
				</div>

				<!-- Year -->
				<div class="flex-1 min-w-38">
					<label hidden for="year" class="block text-sm text-gray-500 mb-1"> Year </label>
					<input
						id="year"
						type="number"
						inputmode="numeric"
						name="year"
						min="1900"
						pattern="\d{4}"
						max={new Date().getFullYear()}
						placeholder="Year"
						class="w-full rounded-lg border px-3 py-2 text-gray-800 dark:text-gray-800 text-xl font-medium"
					/>
				</div>

				<!-- Vehicle Type -->
				<div
					class="flex-[2_2_0%] min-w-50 items-center gap-3 h-10 mt-6 sm:mt-0 justify-center"
				>
					<!--label for="type" class="text-gray-500 text-sm">
						Type
					</label-->
					<select
						id="type"
						name="type"
						bind:value={vehicleType}
						class="border rounded px-3 py-2 w-full" style="width: 100%">

						<option value="" disabled>Select vehicle type</option>

						{#each VEHICLE_TYPE_VALUES as type}
							<option value={type}>
								{type.charAt(0).toUpperCase() + type.slice(1)}
							</option>
						{/each}
                    </select>
				</div>

				<!-- For Sale -->
				<div
					class="col-span-2 md:col-span-3 flex items-center gap-3 h-10 mt-6 sm:mt-0 justify-center"
				>
					<label for="forSale" class="text-gray-800 dark:text-gray-300 text-lg font-medium">
						<!--p class="hidden md:block">For sale?</p-->
						<p>Is this Vehicle for sale?</p>
					</label>
					<input id="forSale" type="checkbox" name="forSale" class="h-5 w-5" />
				</div>
			</section>

			<!-- Image Uploader -->
			<section class="block w-full mt-4">
				<ImageUploader accept="image/*" maxImages={1} onChange={handleImageChange} />
			</section>

			<button
				type="submit"
				disabled={_submitting}
				autocapitalize="on"
				class="w-full mt-8 rounded-lg bg-black dark:bg-amber-800 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-40 cursor-pointer transition-colors duration-100 ease-in-out"
			>
				{_submitting ? 'Submitting…' : 'Submit Vehicle'}
			</button>
		</form>
	{/if}
</main>

<style>
	:global(:root:not(.dark)) {
		--cp-bg-color: #1e2939;
		--cp-border-color: white;
		--cp-text-color: black;
		--cp-input-color: #1e2939;
		--cp-button-hover-color: #1e2939;
	}
	:global(:root.dark) {
		--cp-bg-color: #1e2939;
		--cp-border-color: white;
		--cp-text-color: white;
		--cp-input-color: #10182;
		--cp-button-hover-color: #555;
	}
</style>
