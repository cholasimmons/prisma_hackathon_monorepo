<script>
	import { api } from '$lib/api/client';
	import KPI from '$lib/components/Charts/KPI.svelte';
	import Spinner from '$lib/components/Loaders/Spinner.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';

	// STATS
	let _users = $state(0);
	let _vehicles = $state(0);
	let _submissions = $state(0);
	let _photos = $state(0);
	let _loadingStats = $state(true);
	// let _errors = $state(0);

	function _fetchStats() {
		_loadingStats = true;

		api.get('/stats')
			.then(response => response.data)
			.then(data => {
				console.log("Received:",data);
				_users = data.users;
				_vehicles = data.vehicles;
				_submissions = data.submissions;
				_photos = data.photos;
				// _errors = data.errors;
			})
			.catch(error => {
	            toast.error(error?.message ?? error);
				console.error('Error fetching stats:', error);
			})
			.finally(() => {
				_loadingStats = false;
			});
	}

	onMount(() => {
		_fetchStats();
	});
</script>

<main
	class="mx-auto px-8 dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
	<PageHeader title="Admin Dashboard" />

	<div class="container mx-auto max-w-7xl px-6 py-6 space-y-6">

        <!-- KPI CARDS -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI title="Users" value={_loadingStats ? '...' : _users} />
            <KPI title="Vehicles" value={_loadingStats ? '...' : _vehicles} />
            <KPI title="Submissions" value={_loadingStats ? '...' : _submissions} />
            <KPI title="Photo Uploads" value={_loadingStats ? '...' : _photos} />
        </section>

        <!-- CHARTS -->
        <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="lg:col-span-2 card">Vehicle Activity</div>
            <div class="card">User Growth</div>
            <div class="card h-80">
              <!-- LayerCharts component -->
            </div>

        </section>

        <!-- TABLES / LOGS -->
        <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="lg:col-span-2 card">Recent Vehicle Submissions</div>
            <div class="card">System Logs</div>
        </section>

        </div>

</main>
