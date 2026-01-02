<script lang="ts">
	import type { UserProfile } from '$lib/models/user.model';
	import { LucideVerified, BadgeAlertIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import PageHeader from '../PageHeader.svelte';

	const { user, onClose }: { user?: UserProfile; onClose: () => void } = $props();

	const defaultAvatar = '/images/default-avatar.png';

	let username = $state(user?.name || null);
	let useremail = $state(user?.email || null);
	let userbanned = $state(user?.banned || false);
	let userbanReason = $state(user?.banReason || null);
	let userrole = $state(user?.role || 'user');
	let useravatar = $state(user?.image ?? defaultAvatar);

	let password = $state('');
	let confirmPassword = $state('');
	let showPasswordFields = $state(false);
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	// onMount(() => {
	// 	// user.set({ id: '1', email: 'user@example.com', name: 'User' });
	// });

	function handleScrimClick(e: Event) {
		if (e.target === e.currentTarget && onClose) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && onClose) {
			onClose();
		}
	}

	function formatDate(dateString: Date) {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(dateString));
	}

	function handleResendVerification() {
		console.log('Verification email sent successfully');
	}

	function handleImageUpload() {
		console.log('Uploaded Image successfully');
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8"
	onclick={handleScrimClick}
	role="dialog"
	tabindex="0"
	onkeydown={handleKeydown}
	aria-modal="true"
>
	<!-- Modal card -->
	<div
		class="bg-white dark:bg-gray-800 rounded-md shadow-xl max-w-2xl w-full p-6 relative animate-in text-gray-800 dark:text-gray-200"
	>
		<!-- Close button -->
		<button
			onclick={onClose}
			class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
			aria-label="Close modal"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>

		<!-- Form header -->
		<div class="flex flex-col items-center text-center mb-2">
			<PageHeader title={user ? 'Edit User' : 'Add New User'} />
		</div>

		<!-- User form -->
		<form class="space-y-4">
			<!-- Avatar upload/display -->
			<div class="flex flex-col items-center mb-6">
				<div class="relative">
					<img
						id="avatar-upload"
						src={useravatar}
						alt="User avatar"
						class="w-28 aspect-square rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-800"
					/>
					<label
						for="avatar-upload"
						class="absolute bottom-0 right-0 bg-amber-600 text-white p-2 rounded-full cursor-pointer hover:bg-amber-700 transition-colors"
						title="Upload image"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					</label>
					<input
						id="avatar-upload"
						type="file"
						accept="image/*"
						onchange={handleImageUpload}
						class="hidden"
					/>
				</div>
			</div>

			<!-- Form fields -->
			<div class="space-y-4">
			    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    				<!-- Name field -->
    				<div>
    					<label for="name" class="block text-sm mb-1">
    						Full Name *
    					</label>
    					<input
    						id="name"
    						type="text"
    						bind:value={username}
    						required
    						class="sm:text-xl w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
    						placeholder="Full name"
    					/>
    				</div>

                    <!-- Additional fields (optional - can be expanded based on your needs) -->
    				<div>
    					<label for="role" class="block text-sm mb-1">
    						Role
    					</label>
    					<select
    						id="role"
    						bind:value={userrole}
    						class="sm:text-xl w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
    					>
    						<option value="user">User</option>
    						<option value="admin">Admin</option>
    					</select>
    				</div>
				</div>

				<!-- Email field -->
				<div>
					<label
						for="email"
						class="block text-sm mb-1"
					>
						Email Address *
					</label>
					<input
						id="email"
						type="email"
						bind:value={useremail}
						required
						class="sm:text-xl w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						placeholder="user@example.com"
					/>
					{#if !user}
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
							A verification email will be sent to this address
						</p>
					{/if}
				</div>

				<!-- Password fields (only for new users or when changing password) -->
				{#if  showPasswordFields}
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
					<div>
						<label
							for="password"
							class="block text-sm mb-1"
						>
							{user ? 'New Password' : 'Password *'}
						</label>
						<input
							id="password"
							type="password"
							bind:value={password}
							required={!user}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
							placeholder={user ? 'Leave empty to keep current password' : 'Enter password'}
						/>
					</div>

					<div>
						<label
							for="confirmPassword"
							class="block text-sm mb-1"
						>
							Confirm Password {#if !user}*{/if}
						</label>
						<input
							id="confirmPassword"
							type="password"
							bind:value={confirmPassword}
							required={!user}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
							placeholder="Confirm password"
						/>
					</div>
				</div>
				{:else if user}
					<button
						type="button"
						onclick={() => (showPasswordFields = true)}
						class="text-sm hover:underline"
					>
						Change Password
					</button>
				{/if}

				<!-- Status field (only for editing existing users) -->
				{#if user}
					<div class="grid grid-cols-2 gap-4">
						<div>
							<h3 class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Account Status
							</h3>
							<div class="flex items-center space-x-4">
								<label class="flex items-center">
									<input
										type="radio"
										name="status"
										bind:value={userbanned}
										checked={!user?.banned}
										class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
									/>
									<span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
								</label>
								<label class="flex items-center">
									<input
										type="radio"
										name="status"
										bind:value={userbanned}
										class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
									/>
									<span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Banned</span>
								</label>
							</div>
						</div>

						{#if user?.banned}
							<div>
								<label
									for="banReason"
									class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Ban Reason
								</label>
								<input
									id="banReason"
									type="text"
									bind:value={userbanReason}
									class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
									placeholder="Reason for ban"
								/>
							</div>
						{/if}
					</div>

					<!-- Email verification status -->
					<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
						<div class="flex items-center">
							<span class={`mr-2 ${user?.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
								{#if user?.emailVerified}
									<LucideVerified />
								{:else}
									<BadgeAlertIcon />
								{/if}
							</span>
							<span class="text-sm">
								Email {user?.emailVerified ? 'Verified' : 'Not Verified'}
							</span>
						</div>
						{#if !user?.emailVerified}
							<button
								type="button"
								onclick={handleResendVerification}
								class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
							>
								Resend Verification
							</button>
						{/if}
					</div>
				{/if}


			</div>

			<!-- Error message (if any) -->
			{#if error}
				<div
					class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
				>
					<div class="flex items-center">
						<svg
							class="w-5 h-5 text-red-500 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span class="text-sm text-red-700 dark:text-red-400">{error}</span>
					</div>
				</div>
			{/if}

			<!-- Action buttons -->
			<div class="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
				<button
					type="button"
					onclick={onClose}
					class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
				>
					Cancel
				</button>
				<button
					type="submit"
					class="flex-1 txt-btn"
					disabled={isSubmitting}
				>
					{#if isSubmitting}
						<svg
							class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					{/if}
					{isSubmitting ? 'Saving...' : user ? 'Update User' : 'Create User'}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateY(-20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.animate-in {
		animation: slide-in 0.2s ease-out;
	}
</style>
