<script lang="ts">
	import { formatPlateInput } from '$lib/vehicles/plate';
	import { CircleXIcon } from '@lucide/svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		name?: string;
		value?: string;
		mode?: 'search' | 'input'; // determines behavior
		onChange?: (v: string) => void;
	}

	let {
		name = 'plate',
		value = '',
		mode = 'input', // 'input' | 'search'
		onChange
	}: Props = $props();

	let rawInput = $state(value);

	// Derived clean value (always valid)
	const cleanPlate = $derived.by(() => {
		if (typeof rawInput === 'string' && rawInput.length > 0) {
			return formatPlateInput(rawInput);
		}
		return '';
	});

	// Optional: warn once if user pastes >12 chars
	$effect(() => {
		onChange?.(cleanPlate);
	});

	function handleInput(e: any) {
		const input = e.target as HTMLInputElement;
		input.value = cleanPlate;
		rawInput = input.value;
	}

	function handleBlur() {
		// Clean up *after* they’re done typing
		rawInput = cleanPlate;
	}

	function handleKeyDown(e: any) {
		if (e.key === 'Escape') {
			rawInput = '';
			handleBlur();
		}
		if (e.key === 'Enter' && mode === 'search') {
			onChange?.(cleanPlate);
		}
	}

	function reset() {
		rawInput = '';
		onChange?.('');
	}
</script>

<div id="plates-input-container" class="relative w-full mx-auto shadow-lg dark:shadow-none">
	{#if name}
		<input type="hidden" {name} value={cleanPlate} />
	{/if}
	<img
		src="/images/CoatOfArms.webp"
		alt=""
		class="w-10 sm:w-12 lg:w-14 mx-auto ml-1
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
		class="
	focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
	placeholder:text-gray-400 dark:placeholder:text-gray-300
	plates text-6xl sm:text-7xl text-center emboss-extrude"
		autocomplete="off"
		autoCapitalize="characters"
		inputmode="text"
	/>
	<button
		in:fade={{ duration: 400, delay: 100 }}
		out:fade={{ duration: 200 }}
		type="button"
		onclick={reset}
		hidden={cleanPlate.length < 1}
		class="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-gray-500 hover:text-gray-700"
		style="border:none; focus:outline-none; outline:none;"
	>
		<CircleXIcon size={36} />
	</button>
</div>

<style>
	#plates-input-container {
		position: relative;
		width: 100%;
		margin: 0 auto;
	}

	#plates-input-container input {
		background-image: linear-gradient(to bottom, #dedede, #cecece);
		color: #222;
		width: 100%;
		border-radius: 1rem;
		border: 4px solid #444444;
		outline: 3px solid #EFEFEF;
		outline-offset: 1px;
		font-weight: 900;
		line-height: 1.3;
	}
	#plates-input-container input::placeholder {
		opacity: 0.35;
		color: #333;
		text-shadow: none;
	}
	.emboss-extrude {
		color: #48f; /* base text color */
		text-shadow:
			2px 2px 2px #00000060, /* shadow (bottom-right) */
			-3px -3px 1px rgba(255,255,255,0.95); /* highlight (top-left) */
	}
</style>
