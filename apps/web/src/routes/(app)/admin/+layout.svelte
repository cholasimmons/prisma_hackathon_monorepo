<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	import { CarIcon, LayoutDashboardIcon, MailboxIcon, UsersIcon } from '@lucide/svelte';

	const { children, data } = $props();
	let open = $state(false);

	const links = [
		{ href: '/admin', label: 'Dashboard', icon: LayoutDashboardIcon },
		{ href: '/admin/users', label: 'Users', icon: UsersIcon },
		{ href: '/admin/vehicles', label: 'Vehicles', icon: CarIcon },
		{ href: '/admin/submissions', label: 'Submissions', icon: MailboxIcon }
	];

	onMount(() => {
		console.log('Admin layout mounted');
	});
</script>

<div class="min-h-full flex">
	<!-- Sidebar (lg+) -->
	<aside class="hidden lg:flex h-full w-64 flex-col bg-gray-300 dark:bg-gray-900">
		<nav class="space-y-1 text-gray-800 dark:text-gray-200">
			{#each links as link}
				<a
					href={link.href}
					class="flex items-center rounded px-8 py-6 text-lg hover:bg-black/10 dark:hover:bg-white/10"
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
			class="hidden md:flex lg:hidden h-14 border-b border-gray-500 px-4 items-center text-gray-800 dark:text-gray-200"
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
			class="flex md:hidden h-14 border-b border-gray-500 px-6 items-center justify-start text-gray-800 dark:text-gray-200"
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
				<button
					type="button"
					class="absolute inset-0 bg-black/40 hover:bg-none"
					in:fade={{ duration: 150 }}
					out:fade={{ duration: 150 }}
					onclick={() => (open = false)}
					aria-label="Close Menu"
				>
				</button>

				<!-- Drawer -->
				<aside
					class="absolute left-0 top-0 bottom-0 w-64 bg-gray-300 dark:bg-gray-900"
					in:fly={{ x: -300, duration: 200 }}
					out:fly={{ x: -300, duration: 200 }}
				>
					<nav class="gap-1 flex flex-col text-gray-800 dark:text-gray-200 mt-8">
    	                <div class="mb-8">
    						<img src="/logos/Plates_BaiHa.svg" alt="" class="w-14 h-14 mx-auto" />
    					</div>
						{#each links as link}
							<a
								href={link.href}
								class="flex items-center rounded px-4 py-6 text-lg hover:bg-black/10 dark:hover:bg-white/10"
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
</div>
