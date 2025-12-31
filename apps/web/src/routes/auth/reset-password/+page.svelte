<script lang="ts">
	import { goto, refreshAll } from '$app/navigation';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Spinner from '$lib/components/Loaders/Spinner.svelte';
	import { EyeClosedIcon, EyeIcon, LucideCheckLine, LucideKey } from '@lucide/svelte';
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
	let isValidConfirmPassword = $derived.by(() => {
        const hasLength = confirmPassword.length >= 6;
		// const hasNumber = /\d/.test(password);
		// const hasUpper = /[A-Z]/.test(password);
		return hasLength && confirmPassword === newPassword; // && hasNumber && hasUpper;
	})
	let _showConfirmPassword = $state(false);

	const handleEnhance = () => {
	    success = false;
		resetting = true;

		return async ({ result, update }: any) => {
			if (result?.type === 'success') {
				const { newPassword } = result.data?.user;
				const { message } = result.data;

				const res = await authClient.resetPassword({
					newPassword,
					token: data.token!
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

		{#if data?.token && data.token.length > 64}
    		<form method="POST" class="space-y-4" use:enhance={handleEnhance}>
    			<div class="space-y-1">
    				<label for="newPassword" class={`text-sm font-medium ${isValidPassword ? '' : 'label-error'}`}>New Password</label>
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
    				<label for="confirmPassword" class={`text-sm font-medium ${isValidConfirmPassword ? '' : 'label-error'}`}>Confirm Password</label>
                    <div class="relative">
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
                        <!-- Eye icon button -->
    					<button
    						type="button"
    						hidden={confirmPassword.length === 0}
    						onclick={() => (_showConfirmPassword = !_showConfirmPassword)}
    						class="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-gray-500 hover:text-gray-700"
    						style="border:none; focus:outline-none; outline:none;"
    					>
    						{#if _showConfirmPassword}
    							<EyeClosedIcon />
    						{:else}
    							<EyeIcon />
    						{/if}
    					</button>
                    </div>
    			</div>

    			<button
    				type="submit"
    				disabled={ !isValidPassword || !isValidConfirmPassword || resetting }
    				class="mt-8 w-full flex items-center justify-center gap-3 rounded-lg bg-gray-800 dark:bg-amber-800 py-3 font-medium text-white hover:bg-amber-600 disabled:opacity-40 cursor-pointer transition-colors duration-100 ease-in-out"
    			>
    				{#if resetting} <Spinner size={24} /> Changing Password… {:else} Change Password {/if}
    			</button>
    		</form>
        {:else}
            <div class="mt-4 space-y-1 flex flex-col items-center">
                <LucideKey size={48} />
                <p class="mt-4 text-center text-xl font-medium text-gray-700 dark:text-gray-300">Authentication Failed!</p>
                <p class="text-center text-lg font-medium text-gray-500 dark:text-gray-400">Your reset link may have expired or been used already.</p>
            </div>
        {/if}
	</div>
</main>

<style>
    .label-success {
        color: seagreen
    }
    .label-error {
        color: salmon
    }
</style>