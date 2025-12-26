<script lang="ts">
	import toast from 'svelte-french-toast';
	import { CircleHelpIcon } from '@lucide/svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
</script>

<main
	class="mx-auto px-8 dark:text-gray-400 flex flex-col min-h-full w-full max-w-xl items-center justify-start space-y-8"
>
	<PageHeader title="About Plates" />

	<CircleHelpIcon />

	<div class="flex flex-col items-center justify-center space-y-4 mt-8 text-gray-800 dark:text-gray-200">
		<p>
			Plates is a simple crowd-sourced vehicle database built with SvelteKit, Tailwind CSS & 💖.
			<br/>It's designed to be responsive, simple, and easy to use.
		</p>
		<img src="/images/Simmons_S_Logo_SM_2025_2.png" alt="Simmons Studio logo" class="w-20 h-20" />
		<p>
		    Plates was initially developed &AMP; maintained by <a href="https://simmons.studio" target="simmons" rel="noopener noreferrer">Simmons Multimedia</a> for a Prisma hackathon, but is now open to the community as a free training resource.
		</p>

		<img
            src="/images/Simmons_Logo_SM_2025_1.png"
            alt="Simmons Multimedia"
            class="h-8 dark:hidden"
        />
        <img
            src="/images/Simmons_Logo_SM_2025_2.png"
            alt="Simmons Multimedia"
            class="h-8 hidden dark:block"
        />

        <div class="flex items-center justify-center mt-12">
            <a class="" href="/legal/terms">Terms & Conditions</a>
            <span class="mx-2">|</span>
            <a class="" href="/legal/privacy">Privacy Policy</a>
        </div>
	</div>

</main>
