<script>
	import { fade } from 'svelte/transition';
</script>

<main
	class="container mx-auto px-8 py-4 text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
	<h1 class="text-gray-400 text-2xl">Submit Vehicle</h1>

	<p class="text-gray-200">
		You have come across a new feature.<br />
		A page currently under development
	</p>

	<a href="/" in:fade={{ duration: 1000, delay: 2000 }} class="hover:text-amber-600 p-4"
		>Return home</a
	>
</main>
