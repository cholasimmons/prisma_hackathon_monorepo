<script lang="ts">
	import { goto, refreshAll } from '$app/navigation';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Spinner from '$lib/components/Loaders/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { LucideCheckLine } from '@lucide/svelte';

	// let { data }: PageProps = $props();
	let verifying = $state(true);
	let success = $state(false);

	onMount(async () => {
	    setTimeout(() => {
			success = true;
		}, 3000);
		setTimeout(async () => {
			await refreshAll();
			goto('/');
		}, 5000);
		// const token = data.token;
		// const callbackURL = data.callbackURL;
		// if(token) {
		// 	await verifyEmail(token, callbackURL);
		// } else {
		// 	toast.error('Invalid verification token');
		// }
	});
</script>

<main
	class="mx-auto px-8 dark:text-gray-400 flex flex-col min-h-full w-full max-w-xl items-center justify-start space-y-8"
>
	<PageHeader title="User Verification" />

	<div class="w-full flex flex-col items-center justify-center my-6 gap-3 h-full text-center">
		{#if verifying}
			<p class="flex justify-center items-center text-center gap-3"><Spinner size={18} />Verifying your Email Address...</p>
		{:else if success}
			<LucideCheckLine />
			Email Verified! 😊
		{:else}
			Could not Verify Email 😔
			<a href="/" in:fade={{ duration: 800, delay: 1000 }} class="hover:text-amber-600 p-4 mt-6"
				>Return home</a>
		{/if}
	</div>


</main>
