<script>
	import { api } from '$lib/api/client';
	import Icon from '@iconify/svelte';
	import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	const GoogleIcon = 'flat-color-icons:google';
	const MicrosoftIcon = 'logos:microsoft-icon';
	const GithubIcon = 'ri:github-fill';
	const AppleIcon = 'skill-icons:apple-dark';

	onMount(async () => {
		try {
			await api.get('/oauth/apple');
			redirect(301, '/');
		} catch (e) {
			console.error(e);
			redirect(301, '/login');
		}
	});
</script>

<main
	class="mx-auto max-w-lg px-8 py-4 dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
	<h1 class="mb-1 dark:text-gray-200 text-4xl">Apple</h1>
	<p class="mb-8">OAuth</p>

	<p class="animate-pulse my-18">Redirecting...</p>
	<h1><Icon icon={AppleIcon} width="64" height="64" /></h1>
</main>
