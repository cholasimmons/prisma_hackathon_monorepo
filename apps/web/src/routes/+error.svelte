<script>
	const { error, status } = $props();
	import { page } from '$app/state';
	import { emojis } from './emojis.js';
</script>


<main
	class="container mx-auto max-w-xl px-8 py-4 dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-center "
>
	<h1 class="mb-1 dark:text-gray-200 text-7xl">{page?.status ?? emojis[500]}</h1>
	<p class="mb-8 text-sm">
        {page.error?.message}
	</p>


    <!--a href="/">Return home</a-->
</main>
