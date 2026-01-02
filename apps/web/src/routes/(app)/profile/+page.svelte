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
	import { Edit, ShieldCheckIcon, User, BanIcon, LucideRefreshCw, LucideCircleCheck, LucideEdit } from '@lucide/svelte';
	import toast from 'svelte-french-toast';
	import { authClient } from '$lib/auth-client';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	const { data }: PageProps = $props();

	let submissions = $state<VehicleSubmission[] | null>([]);
	let profile = $state<UserProfile | null>(null);
	let _fetchingSubmissions = $state(false);
	let _fetchingProfile = $state(false);
	let _avatar = $state<string | null>(null);
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

	async function _fetchSubmissions() {
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
		console.log('Layout S3 Endpoint:', data.s3Endpoint);
		// _fetchProfile();
		// _avatar = data.user?.image || null;
	});
</script>

<main
	class="mx-auto dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
	<!--PageHeader title={`${toPossessive(data.user!.name)} Profile`} /-->

	<div
		class="grid grid-cols-1 md:grid-cols-2 place-items-center gap-4 text-gray-600 dark:text-gray-400"
	>
		<div class="relative group w-40 aspect-square">
			<div class="flex flex-col items-center justify-start">
				<button
					type="button"
					disabled={uploading}
					class="relative group w-full rounded-full p-0 border-0 bg-transparent
                        	       focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                        	       focus-visible:ring-gray-400 "
					onclick={uploading ? null : triggerFileSelect}
				>
				    <UserAvatar
				        src={data.user?.image || null}
				        className="w-full"
				    />
					<!-- <img
						in:fade={{ duration: 400 }}
						src={_avatar}
						alt={data.user?.name}
						class="w-full h-full rounded-full object-cover"
					/> -->

					<!-- Overlay -->
					<span
						class="absolute bottom-2 right-2 bg-transparent text-white
               		       p-1 rounded-full opacity-50 group-hover:opacity-100
               		       transition"
						aria-hidden="true"
					>
						{#if uploading}
							<Spinner size={20} />
						{:else}
							<LucideEdit size={14} />
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
			<h2 class="flex items-center justify-center gap-1 text-2xl font-semibold m-0 text-gray-800 dark:text-gray-200">{data.user!.name}&nbsp;
			{#if !data.user?.emailVerified}
				<span class="text-pink-600" title="Email not verified"><BanIcon size={16} /></span>
			{:else}
				<span class="text-gray-600 dark:text-gray-500" ><LucideCircleCheck size={16} /></span>
			{/if}
			</h2>
			<p class="mb-4">{data.user!.email}</p>

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

			<!--small
				class={`rounded-full border-2 px-3 py-1 ${data.user!.emailVerified ? 'border-green-700 text-green-700 dark:text-green-100' : 'border-pink-700 text-pink-700 dark:text-pink-100'} `}
				>{data.user!.emailVerified ? 'Verified' : 'Not Verified'}</small
			-->

			<div class="flex justify-between items-center gap-3">
				{#if data.user?.role === 'admin'}
					<button
						class="txt-btn mt-8 md:mt-2"
						aria-label="View Admin Dashboard"
						onclick={_gotoAdminDashboard}
					>
						Dashboard
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

	<section class="container mx-auto">
		<hr class="border-gray-400 dark:border-gray-600" />
	</section>

	<PageHeader title="Vehicle Submissions" description="Your Pending / Approved submissions"
	    endIcon={LucideRefreshCw} endAction={_fetchSubmissions}/>

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
						alt={submission.photos?.length + ' / ' + submission.make}
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
		<p in:fade={{ duration: 300 }} class="flex items-center justify-center text-gray-600 dark:text-gray-400">
			No submissions yet.
			<!-- <button
				in:fade={{ duration: 600, delay: 600 }}
				class="py-1 px-6 text-sm"
				onclick={_fetchSubmissions}
			>
				Re-fetch?
			</button> -->
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
