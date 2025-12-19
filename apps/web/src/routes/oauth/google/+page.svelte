<script>
	import Icon from '@iconify/svelte';
	const GoogleIcon = 'flat-color-icons:google';
</script>

<main
	class="mx-auto max-w-lg px-8 py-4 dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
	<h1 class="mb-1 dark:text-gray-200 text-4xl">Google</h1>
	<p class="mb-8">OAuth</p>

	<p class="animate-pulse my-18">Redirecting...</p>
	<h1><Icon icon={GoogleIcon} width="64" height="64" /></h1>
</main>
