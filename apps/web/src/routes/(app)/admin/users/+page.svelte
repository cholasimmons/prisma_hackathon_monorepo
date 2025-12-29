<script lang="ts">
	import { api } from '$lib/api/client';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { onMount } from 'svelte';
	import Spinner from '$lib/components/Loaders/Spinner.svelte';
	import type { UserProfile } from '$lib/models/user.model';
	import { fade } from 'svelte/transition';
	import UserModal from '$lib/components/Modals/UserModal.svelte';
	import UserDataTable from '$lib/components/Tables/UserDataTable.svelte';
	import toast from 'svelte-french-toast';
	import { UserPlusIcon, UserPlus } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import AddUserModal from '$lib/components/Modals/AddUserModal.svelte';

	const data: UserProfile[] = [
		{
			id: '1',
			email: 'user1@example.com',
			name: 'User One',
			role: 'admin',
			image: null,
			emailVerified: true,
			banned: true,
			banReason: 'Insulting Admins',
			banExpires: new Date('2026-01-01T00:00:00Z'),
			createdAt: new Date('2023-01-01T00:00:00Z'),
			updatedAt: new Date('2023-01-01T00:00:00Z')
		},
		{
			id: '2',
			email: 'user2@example.com',
			name: 'User Two',
			role: 'user',
			image: null,
			emailVerified: true,
			banned: true,
			banReason: 'Posting false content',
			banExpires: new Date('2023-02-01T00:00:00Z'),
			createdAt: new Date('2023-02-01T00:00:00Z'),
			updatedAt: new Date('2023-02-01T00:00:00Z')
		},
		{
			id: '3',
			email: 'user3@example.com',
			name: 'User Three',
			role: 'user',
			image: null,
			emailVerified: true,
			banned: true,
			banReason: 'Spamming users',
			banExpires: new Date('2023-03-01T00:00:00Z'),
			createdAt: new Date('2023-03-01T00:00:00Z'),
			updatedAt: new Date('2023-03-01T00:00:00Z')
		},
		{
			id: '4',
			email: 'user4@example.com',
			name: 'User Four',
			role: 'user',
			image: null,
			emailVerified: true,
			banned: true,
			banReason: 'Uploading fake images',
			banExpires: new Date('2023-04-01T00:00:00Z'),
			createdAt: new Date('2023-04-01T00:00:00Z'),
			updatedAt: new Date('2023-04-01T00:00:00Z')
		},
		{
			id: '5',
			email: 'user5@example.com',
			name: 'User Five',
			role: 'user',
			image: null,
			emailVerified: true,
			banned: false,
			banReason: '',
			banExpires: new Date('2026-01-01T00:00:00Z'),
			createdAt: new Date('2023-05-01T00:00:00Z'),
			updatedAt: new Date('2023-05-01T00:00:00Z')
		},
		{
			id: '6',
			email: 'user6@example.com',
			name: 'User Six',
			role: 'admin',
			image: '/images/demo-avatar.png',
			emailVerified: false,
			banned: false,
			banReason: '',
			banExpires: null,
			createdAt: new Date('2023-06-01T00:00:00Z'),
			updatedAt: new Date('2023-06-01T00:00:00Z')
		},
		{
			id: '7',
			email: 'user7@example.com',
			name: 'User Seven',
			role: 'user',
			image: null,
			emailVerified: false,
			banned: false,
			banReason: '',
			banExpires: null,
			createdAt: new Date('2023-07-01T00:00:00Z'),
			updatedAt: new Date('2023-07-01T00:00:00Z')
		},
		{
			id: '8',
			email: 'user8@example.com',
			name: 'User Eight',
			role: 'user',
			image: null,
			emailVerified: false,
			banned: false,
			banReason: '',
			banExpires: null,
			createdAt: new Date('2023-08-01T00:00:00Z'),
			updatedAt: new Date('2023-08-01T00:00:00Z')
		},
		{
			id: '9',
			email: 'user9@example.com',
			name: 'User Nine',
			role: 'user',
			image: null,
			emailVerified: false,
			banned: false,
			banReason: '',
			banExpires: null,
			createdAt: new Date('2023-09-01T00:00:00Z'),
			updatedAt: new Date('2023-09-01T00:00:00Z')
		},
		{
			id: '10',
			email: 'user10@example.com',
			name: 'User Ten',
			role: 'user',
			image: null,
			emailVerified: false,
			banned: true,
			banReason: 'Spamming',
			banExpires: new Date('2023-10-01T00:00:00Z'),
			createdAt: new Date('2023-10-01T00:00:00Z'),
			updatedAt: new Date('2023-10-01T00:00:00Z')
		},
		{
			id: '11',
			email: 'user11@example.com',
			name: 'User Eleven',
			role: 'user',
			image: null,
			emailVerified: false,
			banned: false,
			banReason: '',
			banExpires: null,
			createdAt: new Date('2023-11-01T00:00:00Z'),
			updatedAt: new Date('2023-11-01T00:00:00Z')
		},
		{
			id: '12',
			email: 'user12@example.com',
			name: 'User Twelve',
			role: 'user',
			image: null,
			emailVerified: false,
			banned: false,
			banReason: '',
			banExpires: null,
			createdAt: new Date('2023-12-01T00:00:00Z'),
			updatedAt: new Date('2023-12-01T00:00:00Z')
		}
	];

	// Users
	let users = $state<UserProfile[]>(data);
	let selectedUser = $state<UserProfile | null>(null);
	let showAddUserModal = $state<boolean>(false);
	let addingUser = $state<boolean>(false);
	let addedUser = $state<boolean>(false);
	let loading = $state(true);
	let error = $state<string | null>(null);

	function handleTableClick(user: UserProfile) {
		// User click => opens modal
		selectedUser = user;
	}

	function _fetchUsers() {
		loading = true;
		try {
			api
				.get<UserProfile[]>('/users')
				.then((response) => {
					users = response.data;
					toast.success(users.length + ' Users found');
				})
				.catch((error) => {
					error = error.message ?? error;
					toast.error(error);
				})
				.finally(() => {
					loading = false;
				});
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		_fetchUsers();
	});
</script>

<main
	class="py-4 dark:text-gray-400 flex flex-col min-h-full w-full items-stretch justify-start space-y-8"
>
	<PageHeader
		title="Admin | Users"
		description="Manage users on the platform."
		endIcon={UserPlusIcon}
		endAction={() => {
			showAddUserModal = true;
		}}
	/>

	<div class="flex flex-col w-full space-y-2">
		{#if loading}
			<div class="flex w-full items-center justify-center">
				<Spinner size={32} />
			</div>
		{:else if users.length > 0}
			<div in:fade={{ duration: 500 }} class="flex w-full overflow-hidden">
				<UserDataTable data={users} onClick={handleTableClick} />
			</div>
		{:else}
			<div class="flex w-full items-center justify-center">
				<p class="text-gray-600 dark:text-gray-400">No users found.</p>
				{#if error}
					<small>{error}</small>
				{/if}
				<button onclick={_fetchUsers} class="txt-btn"> Re-fetch </button>
			</div>
		{/if}
		<!-- {#each data as user, i}
            <div in:fade={{ duration: 200 * i }} class="flex flex-row w-full justify-between items-center hover:bg-black/10 cursor-pointer px-4 py-2">
                <div class="flex flex-row grow items-center space-x-4">
                    <div class={`w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700`}>
                        <img src={user.image ?? _avatar} alt={user.name} class="w-full h-full object-cover rounded-full" />
                    </div>
                                        <div class={`h-3 w-3 aspect-square bg-${user.banned ? 'red' : 'green'}-600 rounded-full`}>&nbsp;</div>
                    <div class="flex flex-col">
                        <div class="text-lg font-medium text-gray-800 dark:text-gray-300">{user.name}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                    </div>
                </div>
                <div class="flex flex-row shrink items-end justify-center space-x-4">
                    <div class={`text-sm text-${user.role === 'admin' ? 'amber' : 'gray'}-500`} title={user.role === 'admin' ? 'Admin' : 'User'}>{#if user.role === 'admin'} <ShieldCheckIcon /> {:else} <User /> {/if}</div>
                    <div class={`text-sm text-${user.banned ? 'red' : 'green'}-600`} title={user.banned ? 'Banned: '+user.banReason : ''}>{#if user.banned} <CircleAlertIcon /> {:else} <CircleCheckIcon /> {/if}</div>
                </div>

                <div class="hidden md:flex shrink mx-4 text-gray-500/60">|</div>

                <div class="hidden md:flex flex-row shrink items-end justify-center space-x-4">
                    <div class="text-sm text-gray-500 hover:text-gray-400" title="Edit User"><EditIcon /></div>
                    <div class="text-sm text-gray-500 hover:text-gray-400" title="Ban User"><Trash2Icon /></div>
                </div>
            </div>
        {/each} -->
	</div>
</main>

{#if selectedUser}
	<UserModal user={selectedUser} onClose={() => (selectedUser = null)} />
{/if}

{#if showAddUserModal}
	<AddUserModal onClose={() => (showAddUserModal = false)} />
{/if}
