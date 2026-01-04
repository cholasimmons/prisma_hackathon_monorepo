<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	import { CarIcon, GalleryThumbnailsIcon, LayoutDashboardIcon, LucideTriangleAlert, MailboxIcon, UsersIcon } from '@lucide/svelte';
	import { page } from '$app/state';

	const { children, data } = $props();
	let open = $state(false);

	const links = [
		{ href: '/admin', label: 'Dashboard', icon: LayoutDashboardIcon },
		{ href: '/admin/users', label: 'Users', icon: UsersIcon },
		{ href: '/admin/vehicles', label: 'Vehicles', icon: CarIcon },
		{ href: '/admin/submissions', label: 'Submissions', icon: MailboxIcon },
		{ href: '/admin/photos', label: 'Photos', icon: GalleryThumbnailsIcon }
	];

	onMount(() => {
		console.log('Admin layout mounted');
	});
</script>

<div class="min-h-full flex w-full">
    {#if data.user?.role !== 'admin'}
        <div class="flex flex-1 flex-col w-full text-gray-600 dark:text-gray-300 my-18">
            <div class="flex flex-col items-center justify-center h-full">
                <LucideTriangleAlert width="64" height="64" />
                <p class="text-xl font-bold mt-6">Access Denied</p>
                <p class="text-gray-500">You do not have permission to access this page.</p>
            </div>
        </div>
    {:else}


	<!-- Sidebar (lg+) -->
	<aside class="hidden lg:flex min-h-screen w-64 flex-col bg-gray-300 dark:bg-gray-900 sticky top-16 self-start ">
		<nav class="space-y-1 text-gray-800 dark:text-gray-200">
			{#each links as link}
				<a class:active={page.url.pathname === link.href}
					href={link.href}
				>
					<link.icon class="h-5 w-5 shrink-0 mr-4" aria-hidden="true" />
					{link.label}
				</a>
			{/each}
		</nav>
	</aside>

	<div class="flex flex-1 flex-col w-full">
		<!-- Top bar (md to lg) -->
		<header
			class="hidden md:flex lg:hidden mx-auto h-14 px-4 items-center text-gray-800 dark:text-gray-200"
		>
			<nav class="flex gap-4">
				{#each links as link}
					<a href={link.href} class="flex items-center rounded px-3 py-2 hover:bg-black/10 dark:hover:bg-white/10"
						>
						<link.icon class="h-5 w-5 shrink-0 mr-4" aria-hidden="true" />
						{link.label}</a
					>
				{/each}
			</nav>
		</header>

		<!-- Mobile header -->
		<header
			class="flex md:hidden max-h-14 border-b border-gray-500 w-full items-center justify-start text-gray-800 dark:text-gray-200"
		>
			<!--span class="font-semibold">Menu</span-->
			<button
				type="button"
				class="h-10 w-10 rounded flex items-center justify-center hover:bg-black/40 dark:hover:bg-white/50"
				onclick={() => (open = true)}
				aria-label="Open Menu">☰</button
			>
		</header>

		<!-- Mobile drawer -->
		{#if open}
			<div class="fixed inset-0 z-40">
				<!-- Backdrop -->
				<div aria-label="Close Menu" role="button" tabindex="0"
    				in:fade={{ duration: 150 }}
    				out:fade={{ duration: 150 }}
					class="fixed inset-0 z-30 bg-black/50 hover:bg-none"
					onclick={() => (open = false)} onkeypress={() => (open = false)}
				></div>

				<!-- Drawer -->
				<aside
					class="absolute left-0 top-0 bottom-0 w-64 bg-gray-300 dark:bg-gray-900 z-40"
					in:fly={{ x: -300, duration: 200 }}
					out:fly={{ x: -300, duration: 200 }}
				>
					<nav class="gap-1 flex flex-col text-gray-800 dark:text-gray-200 py-18">
    	           <!--div class="mb-8">
    						<img src="/logos/Plates_BaiHa.svg" alt="" class="w-14 h-14 mx-auto" />
    					</div-->
						{#each links as link}
							<a
								href={link.href}
								class="flex items-center rounded p-4 text-lg hover:bg-black/10 dark:hover:bg-white/10"
								onclick={() => (open = false)}
							>
							<link.icon class="h-5 w-5 shrink-0 mr-4" aria-hidden="true" />
								{link.label}
							</a>
						{/each}
					</nav>
				</aside>
			</div>
		{/if}

		<!-- Page content -->
		<main class="flex-1 p-6">
			{@render children()}
		</main>
	</div>
	{/if}
</div>



<style>
    aside > nav > a {
        display: flex;
        align-items: center;
        justify-content: start;
        padding: 24px 24px;
        font-size: 16px;
        transition: background-color 0.2s ease-in-out;
    }
    aside > nav > a.active {
        color: #fff;
        border-right-width: 4px;
        border-right-color: #fff;
        border-radius: 0;
    }
</style>