<script lang="ts">
	import PageHeader from "$lib/components/PageHeader.svelte";

  const lastUpdated = '2025-01-01'; // change when needed
</script>

<svelte:head>
  <title>Privacy Policy | Plates</title>
</svelte:head>


<main
	class="mx-auto px-8 dark:text-gray-400 flex flex-col min-h-full w-full max-w-2xl items-center justify-start space-y-8"
>
	<PageHeader title="Privacy Policy" description={`Plates · Last updated: ${lastUpdated}`} />

    <div class="mx-auto max-w-2xl px-4 py-12 space-y-6">

        <section class="space-y-4">
            <p>
            Plates (“the App”) is operated by <strong>Simmons Multimedia</strong>.
            This Privacy Policy explains how we collect, use, store, and protect personal
            information when you use our web application and Progressive Web App (PWA).
            </p>

            <p>
            <strong>Jurisdiction:</strong> Zambia<br />
            <strong>Contact:</strong>
            <a href="mailto:apps@simmons.studio" class="text-amber-600 underline">
                apps@simmons.studio
            </a>
            </p>
        </section>

        <section class="mt-10 space-y-3">
            <h2 class="text-xl font-semibold">Information We Collect</h2>

            <ul class="list-disc pl-6 space-y-1">
            <li>Full name</li>
            <li>Email address</li>
            <li>Profile photo (optional)</li>
            <li>IP address</li>
            <li>Browser and device information</li>
            <li>Application logs and error data</li>
            </ul>
        </section>

        <section class="mt-10 space-y-3">
            <h2 class="text-xl font-semibold">User-Submitted Content</h2>

            <p>
            Users may submit vehicle entries and images of vehicles only. Submission of
            personal, private, or sensitive information is not permitted.
            </p>

            <p>
            Vehicle data submitted to the platform is aggregated and compiled into system
            records. While users retain ownership of their submissions, all compiled vehicle
            data becomes the property of Simmons Multimedia.
            </p>
        </section>

        <section class="mt-10 space-y-3">
            <h2 class="text-xl font-semibold">Authentication & Cookies</h2>

            <p>
            We use session-based authentication cookies managed server-side via BetterAuth.
            No advertising, tracking, or marketing cookies are used.
            </p>
        </section>

        <section class="mt-10 space-y-3">
            <h2 class="text-xl font-semibold">Data Retention & Deletion</h2>

            <p>
            Users may request account deletion at any time. A 30-day grace period applies
            before permanent deletion. No backups are retained.
            </p>
        </section>

        <section class="mt-10 space-y-3">
            <h2 class="text-xl font-semibold">Security</h2>

            <p>
            We apply reasonable technical and organizational measures to protect user data.
            No system can be guaranteed fully secure.
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