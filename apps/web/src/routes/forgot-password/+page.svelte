<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
	let _resetting = $state(false);

</script>

<main
	class="container mx-auto max-w-xl px-8 py-4 dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
	<h1 class="mb-1 dark:text-gray-200 text-2xl">Forgot Password</h1>
	<p class="mb-8 text-sm">
	    Enter your email address, we'll send you a link to reset your password.
	</p>

	<!-- <p class="text-gray-200">
		You have come across a new feature.<br />
		A page currently under development
	</p> -->

	<form method="POST" class="space-y-4"
		use:enhance={() => {
			_resetting = true
			return async () => {
				_resetting = false
			}
		}}
    >

        <div class="space-y-1">
			<label for="email" class="text-sm font-medium">Email</label>
			<input
			    id="email"
				name="email"
				type="email"
				required
				class="w-full rounded-lg border px-3 py-2 text-lg focus:outline-none focus:ring focus:border-amber-600"
			/>
		</div>


    	{#if form?.error}
       		<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
				{form.error}
			</p>
		{:else if form?.success}
    		<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600">
    			{form.message ?? `Email sent!`}
    		</p>
        {/if}

        <button
			type="submit"
			disabled={_resetting}
			class="w-full rounded-lg bg-black py-2 font-medium dark:text-white hover:bg-amber-600  disabled:opacity-40 cursor-pointer transition-colors duration-100 ease-in-out"
		>
			{_resetting ? 'Resetting…' : 'Reset Password'}
		</button>
    </form>
</main>
