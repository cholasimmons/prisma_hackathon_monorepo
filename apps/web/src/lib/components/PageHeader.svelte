<script lang="ts">
	interface Props {
		title: string;
		description?: string;
	}

	const { title, description }: Props = $props();
</script>

<h1 class="mb-1 dark:text-gray-200 text-3xl">{title}</h1>
{#if description}
	<p class="mb-8 md:text-sm">{description}</p>
{/if}
