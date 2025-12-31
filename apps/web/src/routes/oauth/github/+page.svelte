<script>
	import { goto } from '$app/navigation';
	import { api } from '$lib/api/client';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Icon from '@iconify/svelte';
	import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	const GoogleIcon = 'flat-color-icons:google';
	const MicrosoftIcon = 'logos:microsoft-icon';
	const GithubIcon = 'ri:github-fill';
	const AppleIcon = 'skill-icons:apple-dark';

	onMount(async () => {
		try {
			await api.get('/oauth/github');
			goto('/');
		} catch (e) {
			console.error(e);
			goto('/auth/login');
		}
	});
</script>

<main
	class="mx-auto max-w-lg px-8 py-4 dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
	<PageHeader title="Github" description="OAuth" />

	<p class="animate-pulse my-18">Redirecting...</p>
	<h1><Icon icon={GithubIcon} width="64" height="64" /></h1>
</main>
