<script lang="ts">
	import type { Vehicle } from '$lib/models/vehicle.model';
	import { LucideVerified, VerifiedIcon } from '@lucide/svelte';

    const { vehicle, onClose }: { vehicle: Vehicle; onClose: () => void } = $props();


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
    <div class="bg-white dark:bg-gray-800 rounded-md shadow-xl max-w-2xl w-full p-6 relative animate-in text-gray-800 dark:text-gray-200">
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

        {#if vehicle}
            <!-- User details -->
            <div class="flex flex-col items-center text-center">
                <div class="grid grid-cols-1 sm:grid-cols-6 gap-6 mb-8">
                    <div class="col-span-2 flex flex-col items-center sm:items-end justify-center shrink">
                        <!-- Avatar -->
                        <img
                            src={`/logos/${vehicle.make.toLowerCase()}.svg`}
                            alt=" "
                            class="w-28 h-28 rounded-lg object-cover bg-gray-800 ring-4 ring-gray-100 dark:ring-gray-800"
                        />
                    </div>

                    <div class="col-span-4 flex flex-col items-center sm:items-start justify-center grow">
                        <!-- Name -->
                        <h2 class="text-xl font-medium text-gray-800 dark:text-white mb-2">
                            {vehicle.make} {vehicle.model} <span class="text-lg font-normal">( {vehicle.year} )</span>
                        </h2>

                        <!-- Vehicle Type -->
                        <div class="mb-4">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium gap-2 ${vehicle.isActive ? 'bg-green-800/40 text-green-200 dark:bg-green-800/40 dark:text-green-400' : 'bg-red-800/40 text-red-200 dark:bg-red-800/40 dark:text-red-400'}">
                                {#if vehicle.isActive}
                                    <LucideVerified width="12" height="12" />
                                {:else}
                                    <VerifiedIcon width="12" height="12" />
                                {/if}
                                {vehicle.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Additional details -->
                <div class="w-full space-y-3 text-left">
                    {#if vehicle.forSale}
                        <div class="flex items-center text-lg text-gray-700 dark:text-gray-300">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {vehicle.forSale ? 'For Sale' : 'Not For Sale'}
                        </div>
                    {/if}

                    {#if vehicle.id}
                        <div class="flex items-center text-md text-gray-700 dark:text-gray-300">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {vehicle.id}
                        </div>
                    {/if}

                    {#if vehicle.updatedAt}
                        <div class="flex items-center text-md text-gray-700 dark:text-gray-300" title="Created">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Updated: {formatDate(vehicle.updatedAt)}
                        </div>
                    {/if}
                </div>

                <!-- Action buttons -->
                <div class="flex gap-3 mt-6 w-full">
                    <button
                        class="flex-1"
                    >
                        Edit Vehicle
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