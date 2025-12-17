<script>
	const { error, status } = $props();
</script>

<h1 class="text-3xl">{status}</h1>

{#if status === 404}
	<p>Page not found.</p>
{:else if status === 403}
	<p>You do not have permission to view this page.</p>
{:else}
	<p>Something went wrong.</p>
{/if}

<a href="/">Return home</a>
