<script lang="ts">
	import { CircleQuestionMark } from '@lucide/svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import LegalRow from '$lib/components/LegalRow.svelte';
	import { PUBLIC_APP_URL } from '$env/static/public';
	import mono_config from '@config';
</script>

<main
	class="mx-auto dark:text-gray-400 flex flex-col min-h-full container max-w-2xl items-center justify-start space-y-8"
>
	<PageHeader title="About Plates" />
	<CircleQuestionMark />

	<div
		class="flex flex-col items-center justify-center space-y-4 mt-8 text-gray-800 dark:text-gray-200 w-full"
	>
		<p>
			Plates is a simple crowd-sourced vehicle database built with SvelteKit, Tailwind CSS & lots of
			💖. It's designed as a responsive, simple, and easy to use app.
		</p>
		<p>
			Participants submit vehicles to the database including make, model and photos. The system
			evaluates entries to ensure accuracy and completeness. Once approved, vehicles are added to
			the public database. The database is open to the public and can be accessed <a
				href={PUBLIC_APP_URL}>on this app</a
			>.
		</p>
		<img src="/images/Simmons_S_Logo_SM_2025_2.png" alt="Simmons Studio logo" class="h-24 py-2" />
		<p>
			Plates was initially developed &AMP; maintained by <a
				href="https://simmons.studio"
				target="simmons"
				rel="noopener noreferrer">Simmons Multimedia</a
			> for a Prisma hackathon, but is now open to the community as a free training resource.
		</p>

		<img
			src="/images/Simmons_Logo_SM_2025_1.png"
			alt="Simmons Multimedia"
			class="h-12 py-2 dark:hidden"
		/>
		<img
			src="/images/Simmons_Logo_SM_2025_2.png"
			alt="Simmons Multimedia"
			class="h-12 py-2 hidden dark:block"
		/>

		<p>
			Please report any bugs or issues to <a href={mono_config.app.email}
				>{mono_config.credit.author}</a
			>
			or <a href={`${mono_config.app.github}/issues/new`}>GitHub</a>. Feature suggestions are also
			welcome.
		</p>

		<LegalRow />
	</div>
</main>
