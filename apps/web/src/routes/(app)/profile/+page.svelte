<script lang="ts">
	import { goto } from '$app/navigation';
	import { api, type ApiResponse } from '$lib/api/client';
	import { mySubmittedVehicles } from '$lib/api/vehicles';
	import { hexToColorName } from '$lib/color/colors';
	import type { AuthUser } from '$lib/models/auth.model';
	import type { UserProfile } from '$lib/models/user.model';
	import type { VehicleSubmission } from '$lib/models/vehicle.model';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { PageProps } from './$types';
	import PageHeader from '$lib/components/PageHeader.svelte';

	const { data }: PageProps = $props();

	// let colorHex = $state('#000000');
	// let colorName = $derived.by(() => (colorHex ? hexToColorName(colorHex) : 'Black'));

	let submissions: VehicleSubmission[] | null = $state<VehicleSubmission[] | null>([]);
	let _profile = $state<UserProfile | null>();
	let _fetchingSubmissions = $state(false);
	let _fetchingProfile = $state(false);

	let _fetchSubmissions = async () => {
		try {
			_fetchingSubmissions = true;
			submissions = await mySubmittedVehicles();
		} catch (error) {
			console.error('Error fetching submissions:', error);
		} finally {
			_fetchingSubmissions = false;
		}
	};

	let _fetchProfile = async () => {
		try {
			_fetchingProfile = true;
			const response: ApiResponse<UserProfile> = await api.get<UserProfile>('/auth/me');
			_profile = response.data;
		} catch (error) {
			console.error('Error fetching User Profile:', error);
		} finally {
			_fetchingProfile = false;
		}
	};

	onMount(() => {
		_fetchSubmissions();
		_fetchProfile();
	});
</script>

<main
	class="mx-auto px-8 py-4 dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
	<PageHeader title={`${data.user!.name}'s Profile`} description="Your active Profile" />

	<div class="flex flex-col items-center justify-center space-y-4 text-gray-600 dark:text-gray-400">
		<img src={data.user!.image} alt={data.user!.name} class="w-32 h-32 rounded-full" />
		<h2 class="text-xl font-bold">{data.user!.name}</h2>
		<p>{data.user!.email}</p>
		{#if _fetchingProfile}
			<p class="text-gray-500 animate-pulse">Loading Profile...</p>
		{:else if _profile}
			<p class="text-base text-gray-500">{_profile.role}</p>
		{:else}
			<p class="text-sm text-gray-500">Profile not Found</p>
		{/if}

		<small class="rounded-full px-4 py-2"
			>{data.user!.emailVerified ? 'Verified' : 'Not Verified'}</small
		>
	</div>

	<hr class="border-gray-300 dark:border-gray-600 w-full" />

	<h2 class="mb-1 dark:text-gray-200 text-2xl">Vehicle Submissions</h2>
	<p class="mb-8 md:text-sm">Pending / Approved submissions</p>

	{#if _fetchingSubmissions}
		<p class="text-gray-600 dark:text-gray-400 animate-ping">Collecting Submissions...</p>
	{:else if submissions && submissions.length > 0}
		<ul class="space-y-4">
			{#each submissions as submission}
				<li class="flex items-center space-x-4">
					<img
						src={submission.photos?.[0].url}
						alt={submission.make}
						class="w-16 h-16 rounded-md"
					/>
					<div class="text-gray-700 dark:text-gray-300">
						<h3 class="text-lg font-bold">{submission.make} {submission.model}</h3>
						{#if submission.year}
							<p>{submission.year}</p>
						{/if}
						{#if submission.color}
							<p>{hexToColorName(submission.color)}</p>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-gray-600 dark:text-gray-400">No submissions yet</p>

		<button in:fade={{ duration: 600 }} class="mt-8 py-2 px-4 rounded" onclick={_fetchSubmissions}>
			Refetch
		</button>

		<button
			in:fade={{ duration: 600, delay: 3000 }}
			class="mt-4 font-bold py-2 px-4 rounded"
			onclick={() => {
				goto('/submit');
			}}
		>
			Submit a Vehicle
		</button>
	{/if}
</main>
