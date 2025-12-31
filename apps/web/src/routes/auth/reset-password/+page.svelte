<script lang="ts">
	import { goto, refreshAll } from '$app/navigation';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Spinner from '$lib/components/Loaders/Spinner.svelte';
	import { LucideCheckLine } from '@lucide/svelte';
	import { authClient } from '$lib/auth-client';
	import toast from 'svelte-french-toast';
	import { enhance } from '$app/forms';

	let { data } = $props();
	// let { token, callbackURL } = data;
	let resetting = $state(false);
	let success = $state(false);

	//Reactive
	let newPassword = $state('');
	let confirmPassword = $state('');
	let isValidPassword = $derived.by(() => {
        const hasLength = newPassword.length >= 6;
		// const hasNumber = /\d/.test(password);
		// const hasUpper = /[A-Z]/.test(password);
		return hasLength; // && hasNumber && hasUpper;
	})
	let isValidSecondPassword = $derived.by(() => {
        const hasLength = confirmPassword.length >= 6;
		// const hasNumber = /\d/.test(password);
		// const hasUpper = /[A-Z]/.test(password);
		return hasLength && confirmPassword === newPassword; // && hasNumber && hasUpper;
	})

	const handleEnhance = () => {
	    success = false;
		resetting = true;

		return async ({ result, update }: any) => {
			if (result?.type === 'success') {
				const { newPassword } = result.data?.user;
				const { message } = result.data;

				const res = await authClient.resetPassword({
					newPassword,
					token: data?.token
				});

				if (res.error?.message || res.error?.code) {
					toast.error(res.error?.message ?? 'An error occurred');
				} else if(res.data?.status === true) {
					success = true;
					toast.success(result.data?.message ?? 'Password was reset.');
					goto('/auth/login', { replaceState: true });
				}
			} else if (result?.type === 'error' || result?.type === 'failure') {
				toast.error(result.error?.message ?? 'Unable to reset password');
			}

			// TODO: Restore update logic if signing form still resets after successful login
			// await update();
			resetting = false;
		};
	};
</script>

<main
	class="mx-auto px-8 dark:text-gray-400 flex flex-col min-h-full w-full max-w-xl items-center justify-start space-y-8"
>
	<PageHeader title="Reset your Password" />

	<div class="w-full flex flex-col items-center justify-center my-6 gap-3 h-full">
		{#if success}
			<LucideCheckLine />
			Password Reset! 😊
		{/if}

    		<form method="POST" class="space-y-4" use:enhance={handleEnhance}>
    			<div class="space-y-1">
    				<label for="newPassword" class="text-sm font-medium">New Password</label>
    				<input
    					id="newPassword"
    					name="newPassword"
    					type="password"
    					bind:value={newPassword}
    					required
    					disabled={resetting}
    					class="w-full rounded-lg border px-3 py-2 text-gray-800 dark:text-gray-800 text-xl font-medium focus:outline-none focus:ring focus:border-amber-600"
                        class:!isValidPassword={"border-red-600"}
    				/>
    			</div>

                <div class="space-y-1">
    				<label for="confirmPassword" class="text-sm font-medium">Confirm Password</label>
    				<input
    					id="confirmPassword"
    					name="confirmPassword"
    					type="password"
    					bind:value={confirmPassword}
    					required
    					disabled={resetting}
    					class="w-full rounded-lg border px-3 py-2 text-gray-800 dark:text-gray-800 text-xl font-medium focus:outline-none focus:ring focus:border-amber-600"
                        class:!isValidSecondPassword={"border-red-600"}
    				/>
    			</div>

    			<button
    				type="submit"
    				disabled={ !isValidPassword || !isValidSecondPassword || resetting }
    				class="mt-8 w-full rounded-lg bg-gray-800 dark:bg-amber-800 py-3 font-medium text-white hover:bg-amber-600 disabled:opacity-40 cursor-pointer transition-colors duration-100 ease-in-out"
    			>
    				{#if resetting} <Spinner size={24} /> Changing Password… {:else} Change Password {/if}
    			</button>
    		</form>
	</div>


</main>
