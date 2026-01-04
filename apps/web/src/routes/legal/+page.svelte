<script>
	import PageHeader from "$lib/components/PageHeader.svelte";

</script>
<main
	class="mx-auto px-8 dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
	<PageHeader title="Legal" />

	<div class="grid grid-cols-2 gap-4 mt-8">
		<a href="/legal/privacy" class="rounded-xl border-2 dark:border-gray-700 hover:text-amber-600 hover:dark:border-gray-700">
		    <div class="px-8 py-4">
			Privacy Policy
			</div>
		</a>
		<a href="/legal/terms" class="rounded-xl border-2 dark:border-gray-700 hover:text-amber-600 hover:dark:border-gray-700">
		    <div class="px-12 py-4">
			Terms of Service
			</div>
		</a>
	</div>
</main>