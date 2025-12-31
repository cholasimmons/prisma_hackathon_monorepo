<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { api, type ApiResponse } from '$lib/api/client';
	import { mySubmittedVehicles } from '$lib/api/vehicles';
	import { hexToColorName } from '$lib/color/colors';
	import type { UserProfile } from '$lib/models/user.model';
	import type { VehicleSubmission } from '$lib/models/vehicle.model';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { PageProps } from './$types';
	import Spinner from '$lib/components/Loaders/Spinner.svelte';
	import { Edit2Icon, Edit, Edit2, Edit3, ShieldCheckIcon, User } from '@lucide/svelte';
	import toast from 'svelte-french-toast';
	import { authClient } from '$lib/auth-client';
	import UserAvatar from '$lib/components/UserAvatar.svelte';

	const { data }: PageProps = $props();

	// let colorHex = $state('#000000');
	// let colorName = $derived.by(() => (colorHex ? hexToColorName(colorHex) : 'Black'));

	let submissions: VehicleSubmission[] | null = $state<VehicleSubmission[] | null>([]);
	let profile = $state<UserProfile | null>(null);
	let _fetchingSubmissions = $state(false);
	let _fetchingProfile = $state(false);
	let _avatar = $state('/images/default-avatar.png');
	let _loggingOut = $state(false);

	// User image upload
	let fileInput!: HTMLInputElement;
	let uploading = $state(false);

	function triggerFileSelect() {
		fileInput.click();
	}

	async function onFileSelected(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file || !(file instanceof File)) {
			toast.error('Invalid file selected');
			return;
		}

		const confirmed = confirm('Replace your current avatar?');
		if (!confirmed) return;

		await uploadAvatar(file);
	}

	async function uploadAvatar(file: File) {
		uploading = true;

		try {
    		const form = new FormData();
    		form.append('avatar', file);

            const res = await api.post<string>('/users/avatar', form);

            console.log('form POST response:', res);

    		if (!res) {
     			alert('Failed to upload to server');
     			uploading = false;
     			return;
    		}

    		toast.success('Image uploaded 🤗');

    		_avatar = res.data; // update locally
    		profile = { ...profile, image: res.data } as UserProfile;
		} catch(error){
			console.error('Error uploading avatar:', error);
			alert('Failed to upload avatar');
			return;
		} finally {
			uploading = false;
		}
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
			profile = response.data as UserProfile;
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

	function logout() {
		_loggingOut = true;
		authClient
			.signOut()
			.then(() => {
				_loggingOut = false;
				invalidateAll().then(() => {
					goto('/');
				});
			})
			.catch((error) => {
				console.error('Error logging out:', error);
				_loggingOut = false;
			})
			.finally(() => {
				_loggingOut = false;
			});
	}

	onMount(() => {
		profile = data.user as UserProfile;
		_fetchSubmissions();
		_fetchProfile();
		_avatar = data.user?.image || '/images/default-avatar.png';
	});
</script>

<main
	class="mx-auto dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
	<!--PageHeader title={`${toPossessive(data.user!.name)} Profile`} /-->

	<div
		class="grid grid-cols-1 md:grid-cols-2 place-items-center gap-4 text-gray-600 dark:text-gray-400"
	>
		<div class="relative group w-34 h-34">
			<div class="flex flex-col items-center justify-center">
				<button
					type="button"
					disabled={uploading}
					class="relative group w-34 h-34 rounded-full p-0 border-0 bg-transparent
                        	       focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                        	       focus-visible:ring-gray-400"
					onclick={uploading ? null : triggerFileSelect}
				>
				    <UserAvatar
				        src={_avatar}
				        className="w-24 h-24 rounded-full"
				    />
					<!-- <img
						in:fade={{ duration: 400 }}
						src={_avatar}
						alt={data.user?.name}
						class="w-full h-full rounded-full object-cover"
					/> -->

					<!-- Overlay -->
					<span
						class="absolute bottom-1 right-1 bg-transparent text-white
               		       p-1 rounded-full opacity-50 group-hover:opacity-100
               		       transition"
						aria-hidden="true"
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
			<h2 class="text-2xl font-semibold m-0 text-gray-800 dark:text-gray-200">{data.user!.name}</h2>
			<p class="mb-4">{data.user!.email}</p>

			{#if _fetchingProfile}
				<p class="flex gap-2 items-center justify-center text-gray-500 text-sm">
					<Spinner /> <span>Loading Profile...</span>
				</p>
			{:else}
				<p title={data.user?.role === 'admin' ? 'Admin' : null}
					in:fade={{ duration: 300 }}
					class="text-base flex items-center justify-center gap-3 {data.user!.role === 'admin' ? 'text-amber-500' : 'text-gray-500'} mb-6"
				>
					{#if data.user?.role === 'admin'}
						<ShieldCheckIcon size={24} /> Admin
					{:else}
						<User size={24} /> {#if submissions && submissions.length > 0} Contributor {:else} Participant {/if}
					{/if}
				</p>
			{/if}

			<small
				class={`rounded-full border-2 px-3 py-1 ${data.user!.emailVerified ? 'border-green-700 text-green-700 dark:text-green-100' : 'border-pink-700 text-pink-700 dark:text-pink-100'} `}
				>{data.user!.emailVerified ? 'Verified' : 'Not Verified'}</small
			>

			<div class="flex justify-between items-center">
				{#if data.user?.role === 'admin'}
					<button
						class="txt-btn mt-8 md:mt-2"
						aria-label="View Admin Dashboard"
						onclick={_gotoAdminDashboard}
					>
						Open Dashboard
					</button>
				{/if}

				<button
					class="txt-btn mt-8 md:mt-2"
					disabled={_loggingOut}
					aria-label="Log Out"
					onclick={logout}
				>
					{#if _loggingOut}
						<Spinner size={24} />
					{:else}
						Sign Out
					{/if}
				</button>
			</div>
		</div>
	</div>

	<section class="container mx-auto max-w-xl">
		<hr class="border-gray-400 dark:border-gray-600" />
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
		<p in:fade={{ duration: 300 }} class="text-gray-600 dark:text-gray-400">
			No submissions yet.
			<button
				in:fade={{ duration: 600, delay: 600 }}
				class="mt-4 py-1 px-6 text-sm"
				onclick={_fetchSubmissions}
			>
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
