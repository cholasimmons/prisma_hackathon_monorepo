<script lang="ts">
	import type { IconProps } from "@lucide/svelte";
	import type { Component } from "svelte";
	import { fade } from "svelte/transition";

	interface Props {
		title: string;
		description?: string;
		endIcon?: Component<IconProps>;
		endAction?: () => void;
	}

	const { title, description, endIcon, endAction }: Props = $props();
</script>

<div class="w-full flex flex-row items-start justify-between mb-8">
    <!-- Start -->
    <div class="block w-8">
    </div>

    <!-- Main -->
    <div class="">
        <h1 class="mb-1 dark:text-gray-200 text-2xl">{title}</h1>
        {#if description}
        	<p class="md:text-sm">{description}</p>
        {/if}
    </div>

    <!-- End -->
    <div class="">
        {#if endIcon && endAction}
            {@const Icon = endIcon}
            <button in:fade={{ duration: 600, delay: 1000 }} class="mt-1 flex items-center justify-center" onclick={endAction} aria-label="Secondary Action">
                <Icon size={20} />
            </button>
        {/if}
    </div>
</div>
