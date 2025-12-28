<script lang="ts">
	import type { UserProfile } from '$lib/models/user.model';
	import { Verified, VerifiedIcon } from '@lucide/svelte';
    import { onMount } from 'svelte';

  const { user, onClose }: { user?: UserProfile; onClose: () => void } = $props();

  const defaultAvatar = '/images/default-avatar.png';

  onMount(() => {
    // user.set({ id: '1', email: 'user@example.com', name: 'User' });
  });

  function handleScrimClick(e: Event) {
      if (e.target === e.currentTarget && onClose) {
          onClose()
      }
  }

  function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape' && onClose) {
          onClose()
      }
  }

  function formatDate(dateString: Date) {
      return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
      }).format(new Date(dateString))
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8"
    onclick={handleScrimClick}
    role="dialog" tabindex="0"
    onkeydown={handleKeydown}
    aria-modal="true"
>
    <!-- Modal card -->
    <div class="bg-white dark:bg-gray-800 rounded-md shadow-xl max-w-lg w-full p-6 relative animate-in text-gray-800 dark:text-gray-200">
        <!-- Close button -->
        <button
            onclick={onClose}
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close modal"
        >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        {#if user}
            <!-- User details -->
            <div class="flex flex-col items-center text-center">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div class="flex flex-col items-center sm:items-end shrink">
                        <!-- Avatar -->
                        <img
                            src={user.image ?? defaultAvatar}
                            alt={user.name}
                            class="w-28 h-28 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-800"
                        />
                    </div>

                    <div class="flex flex-col items-center sm:items-start justify-center grow">
                        <!-- Name -->
                        <h2 class="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                            {user.name}
                        </h2>

                        <!-- Status badge -->
                        <div class="mb-4">
                            {#if user.banned}
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    title={user.banReason}>
                                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                    </svg>
                                    Banned
                                </span>
                            {:else}
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                    </svg>
                                    Active
                                </span>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Additional details -->
                <div class="w-full space-y-3 text-left">
                    {#if user.email}
                        <div class="flex items-center text-lg text-gray-700 dark:text-gray-300">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {user.email}
                            <span class={`ml-3 ${user.emailVerified ? 'text-green-600' : 'text-red-600'}`}
                                title={user.emailVerified ? 'Email Verified' : 'Email not Verified'}>
                                {#if user.emailVerified}
                                    <VerifiedIcon />
                                {:else}
                                    <Verified />
                                {/if}
                            </span>

                        </div>
                    {/if}

                    {#if user.id}
                        <div class="flex items-center text-md text-gray-700 dark:text-gray-300">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {user.id}
                        </div>
                    {/if}

                    <div class="flex items-center text-md text-gray-700 dark:text-gray-300" title="Created">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Created: {formatDate(user.createdAt)}
                    </div>
                </div>

                <!-- Action buttons -->
                <div class="flex gap-3 mt-6 w-full">
                    <button
                        class="flex-1"
                    >
                        Edit User
                    </button>
                    <button
                        onclick={onClose}
                        class="flex-1"
                    >
                        Close
                    </button>
                </div>
            </div>
        {/if}
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