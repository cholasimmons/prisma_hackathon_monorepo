<script lang="ts">
    import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let _signingUp = $state(false);

	onMount(() => {
	  form = null;
	});

</script>

<main
	class="mx-auto px-8 py-4 dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
    <h1 class="mb-1 dark:text-gray-200 text-3xl">Sign Up</h1>
	<p class="mb-8 md:text-sm">
	    Create an account to create submissions.
	</p>

	<form
		method="POST"
		class="space-y-4"
		use:enhance={() => {
			_signingUp = true;
			return async () => {
				_signingUp = false;
			};
		}}
	>

	    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
    	    <div class="space-y-1">
          		<label for="firstname" class="text-sm font-medium">First Name</label>
          		<input
         			id="firstname"
         			name="firstname"
         			type="text"
         			required
         			class="w-full rounded-lg border px-3 py-2 text-lg focus:outline-none focus:ring focus:border-amber-600"
          		/>
           	</div>
            <div class="space-y-1">
          		<label for="lastname" class="text-sm font-medium">Last Name</label>
          		<input
         			id="lastname"
         			name="lastname"
         			type="text"
         			required
         			class="w-full rounded-lg border px-3 py-2 text-lg focus:outline-none focus:ring focus:border-amber-600"
          		/>
           	</div>
    	</div>

	    <div class="space-y-1">
    		<label for="email" class="text-sm font-medium">Email</label>
    		<input
    			id="email"
    			name="email"
    			type="email"
    			required
    			class="w-full rounded-lg border px-3 py-2 text-lg md:text-2xl focus:outline-none focus:ring focus:border-amber-600"
    		/>
    	</div>

    	<div class="space-y-1">
    		<label for="password" class="text-sm font-medium">Password</label>
    		<input
    			id="password"
    			name="password"
    			type="password"
    			required
    			class="w-full rounded-lg border px-3 py-2 text-lg focus:outline-none focus:ring focus:border-amber-600"
    		/>
    	</div>

    	{#if form?.success === false}
    		<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
    			{form?.message ?? 'Unable to process form'}
    		</p>
        {:else if form?.success}
            <p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600">
                {form?.message}
            </p>
    	{/if}

     <div class="flex justify-center">
         <button type="submit"
        		disabled={_signingUp}
        		class="w-full rounded-full md:max-w-sm mx-auto bg-black dark:bg-amber-800 py-3 font-medium text-white hover:bg-amber-600 md:text-xl disabled:opacity-40 cursor-pointer transition-colors duration-100 ease-in-out"
        	>
        		{_signingUp ? 'Signing up…' : 'Sign up'}
        	</button>
     </div>
	</form>
</main>
