<script lang="ts">
	import PageHeader from "$lib/components/PageHeader.svelte";

  const lastUpdated = '2025-01-01'; // change when needed
</script>

<svelte:head>
  <title>Terms & Conditions | Plates</title>
</svelte:head>


<main
	class="mx-auto px-8 dark:text-gray-400 flex flex-col min-h-full max-w-2xl items-center justify-start space-y-8"
>
	<PageHeader title="Terms & Conditions" description={`Plates · Last updated: {lastUpdated}`} />

    <div class="mx-auto max-w-2xl px-4 py-12 space-y-6">

        <section class="space-y-4">
        <p>
            By accessing or using Plates, you agree to these Terms and Conditions. If you do
            not agree, you must not use the App.
        </p>
        </section>

        <section class="mt-10 space-y-3">
        <h2 class="text-xl font-semibold">Service Description</h2>

        <p>
            Plates is a crowd-sourced vehicle information platform. Participation is
            voluntary and free, with no promise of compensation or benefits.
        </p>
        </section>

        <section class="mt-10 space-y-3">
        <h2 class="text-xl font-semibold">User Accounts</h2>

        <p>
            Certain features require an account. Authentication may be performed using
            email/password or OAuth providers including Google, Apple, Microsoft, and GitHub.
        </p>
        </section>

        <section class="mt-10 space-y-3">
        <h2 class="text-xl font-semibold">User Content & License</h2>

        <p>
            Users retain ownership of submitted content. By submitting content, users grant
            Simmons Multimedia a perpetual, irrevocable, royalty-free license to use,
            modify, aggregate, publish, and distribute the content.
        </p>
        </section>

        <section class="mt-10 space-y-3">
        <h2 class="text-xl font-semibold">Moderation & Enforcement</h2>

        <p>
            We reserve the right to remove content, suspend or terminate accounts, and ban
            users at our discretion, without prior notice.
        </p>
        </section>

        <section class="mt-10 space-y-3">
        <h2 class="text-xl font-semibold">Limitation of Liability</h2>

        <p>
            Plates is provided “as is”. Simmons Multimedia is not liable for data inaccuracies,
            service interruptions, or losses arising from use of the App.
        </p>
        </section>

        <section class="mt-10 space-y-3">
        <h2 class="text-xl font-semibold">Governing Law</h2>

        <p>
            These Terms are governed by the laws of Zambia.
        </p>
        </section>

    <section class="mt-10">
        <p>
        Contact:
        <a href="mailto:apps@simmons.studio" class="text-amber-600 underline">
            apps@simmons.studio
        </a>
        </p>
    </section>
</div>
</main>