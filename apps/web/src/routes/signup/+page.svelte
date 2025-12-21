<script lang="ts">
    import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import toast from 'svelte-french-toast';
	import { EyeClosedIcon, EyeOffIcon, EyeIcon } from '@lucide/svelte';
	import { authClient } from '$lib/auth-client';

	let { data, form }: PageProps = $props();
	let _signingUp = $state(false);
	let _showConfirmPassword = $state(false);

	const handleEnhance = () => {
      // form submission finished
      _signingUp = true;

      return async ({ result, update }:any) => {
        if (result?.type === 'success') {
          const { email, name, password } = result?.data.user;

          // AUTH — delegated
          const res = await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: '/login'
          })

          console.log('response:', res);
          toast.success(result.data.message!);
        } else if (result?.type === 'error' || result?.type === 'failure') {
          toast.error(result.data.message);
        }

        await update();
        _signingUp = false;
      }
    };
</script>

<main
	class="mx-auto px-8  dark:text-gray-400 flex flex-col min-h-full w-full max-w-xl items-center justify-start space-y-8"
>
    <h1 class="mb-1 dark:text-gray-200 text-3xl">Sign Up</h1>
	<p class="mb-8 md:text-sm">
	    Create an account to create submissions.
	</p>

	<form
		method="POST"
		class="space-y-4"
		use:enhance={handleEnhance}
	>

	    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 text-gray-800 dark:text-gray-300 text-lg md:text-2xl">
    	    <div class="space-y-1">
          		<label for="firstname" class="text-sm font-medium">First Name</label>
          		<input
         			id="firstname"
         			name="firstname"
         			type="text"
         			required
         			class="w-full rounded-lg border px-3 py-2 text-lg md:text-2xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
          		/>
           	</div>
            <div class="space-y-1">
          		<label for="lastname" class="text-sm font-medium">Last Name</label>
          		<input
         			id="lastname"
         			name="lastname"
         			type="text"
         			required
         			class="w-full rounded-lg border px-3 py-2 text-lg md:text-2xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
          		/>
           	</div>
    	</div>

	    <div class="space-y-1 text-gray-800 dark:text-gray-300">
    		<label for="email" class="text-sm font-medium">Email</label>
    		<input
    			id="email"
    			name="email"
    			type="email"
    			required
    			class="w-full rounded-lg border px-3 py-2 text-lg md:text-2xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
    		/>
    	</div>

     <div class="grid grid-cols-1 gap-4 md:grid-cols-2 text-gray-800 dark:text-gray-300 text-lg md:text-xl">
    	<div class="space-y-1 ">
    		<label for="password" class="text-sm font-medium">Password</label>
    		<input
    			id="password"
    			name="password"
    			type="password"
    			required
    			class="w-full rounded-lg border px-3 py-2 text-lg md:text-xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
    		/>
    	</div>

        <div class="relative space-y-1 items-center">
      		<label for="confirmPassword" class="text-sm font-medium">Confirm Password</label>
      		<input
     			id="confirmPassword"
     			name="confirmPassword"
     			type={_showConfirmPassword ? 'text' : 'password'}
     			required
     			class="w-full rounded-lg border px-3 py-2 text-lg md:text-xl text-gray-800 focus:outline-none focus:ring focus:border-amber-600 font-medium"
      		/>

            <!-- Eye icon button -->
            <button
                type="button"
                onclick={() => (_showConfirmPassword = !_showConfirmPassword)}
                class="absolute right-3 top-0 bottom-0 my-auto h-6 w-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
                {#if _showConfirmPassword}
                    <EyeClosedIcon/>
                {:else}
                    <EyeIcon/>
                {/if}
            </button>
       	</div>
     </div>


     <p class="text-sm font-medium">By signing up, you agree to our <a href="/terms" class="text-amber-600 hover:underline">Terms of Service</a> and <a href="/privacy" class="text-amber-600 hover:underline">Privacy Policy</a>.</p>

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