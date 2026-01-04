<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import toast, { Toaster } from 'svelte-french-toast';
	import { page } from '$app/state';
	import { fade, fly } from 'svelte/transition';
	import { onDestroy, onMount, tick } from 'svelte';
	import { initTheme, applyTheme } from '$lib/theme';
	import { goto, invalidateAll } from '$app/navigation';
	import {
		CircleQuestionMark,
		HouseIcon,
		TriangleAlert,
		LucideSun,
		LucideMoon,
		LucideCirclePower,
		LucideCar,
		LucideShieldUser,
		LucideMenu,
		LucideHome,
		LucideUser,
		LucideCircleQuestionMark,
		LucideUserLock,
		LucideCircleUser,
		LucideTextAlignStart,
		LucideCarFront,

		LucideBadge

	} from '@lucide/svelte';
	import { authClient } from '$lib/auth-client';
	import InstallPrompt from '$lib/components/PWA/installPrompt.svelte';
	import Spinner from '$lib/components/Loaders/Spinner.svelte';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import { cubicOut } from 'svelte/easing';
	import mono_config from '@config';

	let { children, data } = $props();
	let dark = $state(true);
	let loggingOut = $state(false);

	let drawerOpen = $state(false);
	let media: MediaQueryList;

	function closeDrawer() {
		drawerOpen = false;
	}

	function toggleTheme() {
		dark = !dark;
		applyTheme(dark ? 'dark' : 'light');
	}

	function gotoLogin() {
		goto('/auth/login');
	}
	function gotoSignup() {
		goto('/auth/signup');
	}
	function gotoSubmit() {
		goto('/vehicle/submit');
	}
	function gotoAbout() {
		goto('/about');
	}
	function gotoProfile() {
		goto('/profile');
	}
	function gotoDashboard() {
		goto('/admin');
	}
	function logout() {
	  loggingOut = true;
      authClient.signOut().then(async () => {
        invalidateAll().then(() => {
          drawerOpen = false;
          goto('/');
        }).finally(() => {
          loggingOut = false;
        });
      }).catch((error) => {
        toast.error("Unable to log out")
      }).finally(() => {
        loggingOut = false;
      });
	}

	onMount(async () => {
		try {
			initTheme();
			dark = document.documentElement.classList.contains('dark');

			// preloadMakeLogos();
			document.documentElement.classList.add('hydrated');
		} catch (err) {
			// rejectLogos(err);
		}

		media = window.matchMedia('(min-width: 768px)');
		const handler = () => {
			if (media.matches) {
				drawerOpen = false;
			}
		};

		media.addEventListener('change', handler);
		onDestroy(() => media.removeEventListener('change', handler));
	});

	async function handleNavClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.closest('a')) {
			await tick();      // let navigation start
			drawerOpen = false;
		}
	}

	async function handleNavKeyPress(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		if (target.closest('a')) {
			await tick();      // let navigation start
			drawerOpen = false;
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Vehicle Directory</title>
</svelte:head>

<main class="flex flex-col justify-start min-h-dvh min-w-dvw bg-gray-200 dark:bg-gray-800">
	{#if data.apiDown}
		<div class="h-full w-full flex items-center justify-center my-auto">
			<div class="rounded-md bg-red-50 dark:bg-red-950 p-6 text-red-700 dark:text-white">
				<TriangleAlert />
				<h1 class="mt-4 text-xl font-semibold">Service unavailable</h1>
				<p>The server is temporarily unreachable.</p>
			</div>
		</div>
	{:else}
		<header
			class="container mx-auto sticky top-0 max-w-2xl lg:max-w-4xl px-2 sm:px-4 md:px-8 lg:px-12 py-2 max-h-13
            text-start text-gray-600 dark:text-gray-400
            flex flex-row items-center backdrop-blur-lg
            after:absolute after:left-0 after:right-0 after:bottom-0
            after:h-0.5 after:content-['']
            after:bg-linear-to-r
            after:from-transparent
            after:to-transparent
            after:via-gray-500 dark:after:via-gray-500 z-50"
		>
			<div class="grow space-x-4 flex flex-row items-center">
				{#if page.url.pathname !== '/'}
					<button
						class="px-2 py-1"
						onclick={() => {
							goto('/');
						}}
						title="Home"
					>
						<HouseIcon />
					</button>
				{/if}

				{#if data?.user && page.data.user.image}
					<button onclick={() => gotoProfile()} style="padding: none, background: none;">
						<UserAvatar
							src={page.data.user.image}
							className="h-10 w-10"
						/>
					</button>
				{:else if data?.user}
					<button onclick={() => gotoProfile()}>{data.user.name}</button>
				{/if}
			</div>

			<div class="shrink-0 space-x-4 flex flex-row items-center">
				{#if !data?.user && page.url.pathname.startsWith('/auth/login')}
					<button
						in:fade={{ duration: 400, delay: 100 }}
						class="txt-btn"
						onclick={() => gotoSignup()}>Sign Up</button
					>
				{:else if !data?.user}
					<button
						in:fade={{ duration: 400, delay: 100 }}
						class="txt-btn"
						onclick={() => gotoLogin()}>Log In</button
					>
				{/if}

				<div class="hidden md:flex gap-x-3">
				    <!-- {#if data.user?.role === 'admin'}
				    <button onclick={gotoDashboard} class={page.url.pathname.startsWith("/admin") ? "text-amber-600" : ""}>
    					<LucideShieldUser />
    				</button>
                    {/if} -->
                    {#if data.user}
				    <button onclick={gotoProfile} class:active={page.url.pathname.startsWith("/profile")}
						title="User Profile">
       					<LucideUser size={24} />
    				</button>
                    {/if}

                    <button onclick={gotoSubmit} class:active={page.url.pathname.startsWith("/vehicle")}
                        title="Submit a Vehicle">
    					<LucideCar size={24} />
    				</button>

                    <button onclick={gotoAbout} class:active={page.url.pathname.startsWith("/about")}
                        title="About App">
    					<CircleQuestionMark size={22} />
    				</button>
				</div>


				<button onclick={toggleTheme} title="Toggle Theme">
					{#if dark}
						<LucideMoon size={20} />
					{:else}
						<LucideSun size={20} />
					{/if}
				</button>
				<!--
				{#if data.user}
    				<button
                        disabled={loggingOut}
    					class="hidden md:block text-red-700 dark:text-red-400 hover:text-amber-600 px-2"
    					onclick={logout}
    				>
                        {#if loggingOut}
                            <Spinner size={24} />
                        {:else}
                            <LucideCirclePower />
                        {/if}
    				</button>
                {/if} -->

				<div class="flex gap-x-2 md:hidden pr-2">
    				<button onclick={() => (drawerOpen = !drawerOpen)}>
        					<LucideMenu />
    				</button>
				</div>
			</div>
		</header>


		{#if drawerOpen}
			<div aria-label="Close Drawer" role="button" tabindex="0"
				class="fixed inset-0 z-40 bg-black/50 md:hidden"
				onclick={closeDrawer} onkeypress={closeDrawer}
			></div>
		{/if}

        <!-- Drawer -->
        <aside
			class="
				fixed top-0 left-0 z-40 h-full w-64 bg-gray-900
				transform transition-transform duration-400 ease-out
				md:hidden
			"
			class:translate-x-0={drawerOpen}
			class:-translate-x-full={!drawerOpen}
>
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div role="navigation" class="p-4 pr-0 space-y-1 py-18 text-gray-400"
			    onclick={handleNavClick} onkeypress={handleNavKeyPress}>
				<a href="/" class:active={page.url.pathname === "/"}><LucideHome size={16} /> Search</a>
				<a href="/profile" class:active={page.url.pathname.startsWith("/profile")}><LucideUser size={16} /> Profile</a>
				<a href="/vehicle/submit" class:active={page.url.pathname.startsWith("/vehicle/submit")}><LucideCarFront size={16} /> Submit</a>
				<hr />
				<a href="/about" class:active={page.url.pathname.startsWith("/about")}><LucideCircleQuestionMark size={16} /> About App</a>
				<a href="/legal/terms" class:active={page.url.pathname.startsWith("/legal/terms")}><LucideTextAlignStart size={16} /> Terms / Conditions</a>
				<a href="/legal/privacy" class:active={page.url.pathname.startsWith("/legal/privacy")}><LucideUserLock size={16} /> Privacy Policy</a>
				<hr />
				{#if data.user && data.user.role === 'admin'}
				    <a href="/admin" class:active={page.url.pathname.startsWith("/admin")}><LucideShieldUser size={16} /> Dashboard</a>
				{/if}
				{#if data.user}
				    <button style="background:none; padding-left: 0;" onclick={logout}>
						{#if loggingOut}
                            <Spinner size={16} />
                        {:else}
                       	    <LucideCirclePower size={16} />
                        {/if}
						Logout
					</button>
				{:else}
				    <button style="background:none; padding-left: 0;" onclick={gotoLogin}>
                   	    <LucideCircleUser size={16} />
						Login
					</button>
                {/if}
			</div>
        </aside>



		{#key page.url.pathname}
			<div in:fly={{ duration: 600, x: 10, opacity: 0, easing: cubicOut }} class="grow flex flex-col mx-auto pt-6 px-6 md:px-8 lg:px-12 items-center justify-start w-full">
				{@render children()}
			</div>
		{/key}

		<footer class="p-3 text-center">
			<!-- container mx-auto sticky bottom-0 max-w-4xl p3
                text-center text-gray-600 dark:text-gray-400
                flex flex-row items-center justify-center backdrop-blur-md
                after:absolute after:left-0 after:right-0 after:top-0
                after:h-0.5 after:content-['']
                after:bg-linear-to-r
                after:from-transparent
                after:to-transparent
                after:via-gray-500 dark:after:via-gray-500"> -->
			<a href={mono_config.credit.url}>
				<small
					class="text-center px-6 py-1 text-gray-600 dark:text-gray-400 hover:text-amber-600 hover:font-bold transition-all duration-300"
				>
				{mono_config.credit.author}
				</small>
			</a>
		</footer>
	{/if}
</main>

<InstallPrompt />

<Toaster position="bottom-center" />

{#await import('$lib/components/PWA/ReloadPrompt.svelte') then { default: ReloadPrompt }}
	<ReloadPrompt />
{/await}



<style>
    div[role="navigation"] a {
        display: flex;
        align-items: center;
        column-gap: calc(var(--spacing) * 2) /* 0.5rem = 8px */;
        padding: 0.5rem 0;
        color: inherit;
        text-decoration: none;
    }
    div[role="navigation"] a:hover {
        color: white;
    }
    div[role="navigation"] a.active {
        color: #FE9A00;
        border-right: 6px solid #FE9A00;
        border-radius: 0;
    }

    header button.active {
        color: #FE9A00;
    }

    hr {
        padding: 0.5rem 0;
        color: #444
    }
</style>