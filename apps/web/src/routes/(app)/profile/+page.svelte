<script lang="ts">
	import { goto } from '$app/navigation';
	import { api, type ApiResponse } from '$lib/api/client';
	import { mySubmittedVehicles } from '$lib/api/vehicles';
	import { hexToColorName } from '$lib/color/colors';
	import type { UserProfile } from '$lib/models/user.model';
	import type { VehicleSubmission } from '$lib/models/vehicle.model';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { PageProps } from './$types';
	import Spinner from '$lib/components/Loaders/Spinner.svelte';
	import { Edit2Icon, Edit, Edit2, Edit3 } from '@lucide/svelte';

	const { data }: PageProps = $props();

	// let colorHex = $state('#000000');
	// let colorName = $derived.by(() => (colorHex ? hexToColorName(colorHex) : 'Black'));

	let submissions: VehicleSubmission[] | null = $state<VehicleSubmission[] | null>([]);
	let _profile = $state<UserProfile | null>();
	let _fetchingSubmissions = $state(false);
	let _fetchingProfile = $state(false);
	let _avatar = $state('/images/default-avatar.png');

	// User image upload
	let fileInput!: HTMLInputElement;
	let uploading = $state(false);

	function triggerFileSelect() {
		fileInput.click();
	}

	async function onFileSelected(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;

		const confirmed = confirm('Replace your current avatar?');
		if (!confirmed) return;

		await uploadAvatar(file);
	}

	async function uploadAvatar(file: File) {
		uploading = true;

		const form = new FormData();
		form.append('avatar', file);

		const res = await api.post<string>('/users/avatar', form);

		if (!res) {
			alert('Failed to upload avatar');
			uploading = false;
			return;
		}

		_avatar = res.data; // update locally
		uploading = false;
	}

	function _gotoSubmitVehicle() {
		// Implement logic to submit a new vehicle
		goto('/vehicle/submit');
	}

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
	let response: ApiResponse<UserProfile> | null = null;
		try {
			_fetchingProfile = true;
			response = await api.get<UserProfile>('/auth/me');
			console.log("auth/me", response);
			_profile = response.data;
			_avatar = response.data?.image ? response.data.image : '/images/default-avatar.png';
		} catch (error) {
			console.error(response?.message ?? 'Error fetching User Profile:', error);
		} finally {
			_fetchingProfile = false;
		}
	};

	function _gotoAdminDashboard() {
		goto('/admin');
	}

	onMount(() => {
		_fetchSubmissions();
		_fetchProfile();
		_avatar = data.user?.image || '/images/default-avatar.png';
	});
</script>

<main class="mx-auto p-8 dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8">
	<!--PageHeader title={`${toPossessive(data.user!.name)} Profile`} /-->

	<div class="grid grid-cols-1 md:grid-cols-2 items-center justify-center space-y-4 text-gray-600 dark:text-gray-400">
		<div class="relative group w-34 h-34">
    		<div class="flex flex-col items-center justify-center">
                    <button
                       	type="button" disabled={uploading}
                       	class="relative group w-34 h-34 rounded-full p-0 border-0 bg-transparent
                        	       focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                        	       focus-visible:ring-gray-400"
                       	onclick={uploading ? null : triggerFileSelect}
                    >
                        <img in:fade={{ duration: 400 }} src={data.user?.image ?? _avatar} alt={data.user?.name}
                            class="w-full h-full rounded-full object-cover" />

                        <!-- Overlay -->
                       	<span class="absolute bottom-1 right-1 bg-transparent text-white
               		       p-1 rounded-full opacity-50 group-hover:opacity-100
               		       transition" aria-hidden="true"
                       	>
                            {#if uploading}
                                <Spinner size={20} />
                            {:else}
                          		<Edit size={14} />
                            {/if}
                        </span>

                        <input
                      		bind:this={fileInput}
                      		type="file"
                      		accept="image/*"
                      		class="hidden"
                      		onchange={onFileSelected}
                       	/>
                    </button>

    		</div>
		</div>

		<div class="flex flex-col items-center md:items-start justify-start space-y-2">
		    <h2 class="text-2xl font-semibold m-0">{data.user!.name}</h2>
            <p>{data.user!.email}</p>

      		{#if _fetchingProfile}
     			<p class="flex space-x-2 items-center justify-center text-gray-500 text-sm">
                    <Spinner /> <span>Loading Profile...</span>
                </p>
      		{:else if _profile}
     			<p class="text-base text-gray-500">{_profile.role}</p>
      		{:else}
     			<p class="text-sm text-gray-500">Profile not Found</p>
      		{/if}

      		<small class={`rounded-full px-3 py-1 ${data.user!.emailVerified ? 'bg-green-900' : 'bg-pink-900'} text-gray-200`}
     			>{data.user!.emailVerified ? 'Verified' : 'Not Verified'}</small
      		>

            {#if data.user?.role === 'admin'}
                <button class="txt-btn mt-8 md:mt-2"
                    aria-label="View Admin Dashboard"
                    onclick={_gotoAdminDashboard}
                >
                    Open Dashboard
                </button>
            {/if}
		</div>
	</div>

	<section class="container mx-auto max-w-xl">
	    <hr class="border-gray-300 dark:border-gray-600" />
	</section>

	<h2 class="mb-1 dark:text-gray-200 text-2xl">Vehicle Submissions</h2>
	<p class="mb-8 md:text-sm">Your Pending / Approved submissions</p>

	{#if _fetchingSubmissions}
		<p class="flex space-x-2 items-center justify-center text-amber-800 dark:text-amber-600">
    		<Spinner />
    		<span>Fetching your submissions...</span>
		</p>
	{:else if submissions && submissions.length > 0}
		<ul class="space-y-4">
			{#each submissions as submission}
				<li class="flex items-center space-x-4">
					<img
						src={submission.photos?.[0].url}
						alt={submission.photos?.length + ' photos for ' + submission.make}
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
		<p in:fade={{ duration: 300 }} class="text-gray-600 dark:text-gray-400">No submissions yet.
    		<button in:fade={{ duration: 600, delay: 600 }} class="mt-4 py-1 px-6 text-sm" onclick={_fetchSubmissions}>
    			Re-fetch?
    		</button>
		</p>


		<button
			in:fade={{ duration: 600, delay: 3000 }}
			class="mt-4 txt-btn"
			onclick={_gotoSubmitVehicle}
		>
			Submit a Vehicle
		</button>
	{/if}
</main>
