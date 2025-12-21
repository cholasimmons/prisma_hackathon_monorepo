<script lang="ts">
	import { enhance } from '$app/forms';
	import { authClient } from '$lib/auth-client';
	import toast from 'svelte-french-toast';
	// @ts-checkpe { PageProps } from './$types';
	// let { data, form }: PageProps = $props();
	let _resetting = $state(false);

	const handleEnhance = () => {
      // form submission finished
      _resetting = true;

      return async ({ result, update }:any) => {
        if (result?.type === 'success') {
          const { email } = result.data;
          // AUTH — delegated
          const response = await authClient.requestPasswordReset({
            email,
            redirectTo: '/login'
          })

          console.log(response);
          toast.success(result.data.message!);
        } else if (result?.type === 'error' || result?.type === 'failure') {
          toast.error(result.data.message);
        }

        await update();
        _resetting = false;
      }
    };
</script>

<main
	class="container mx-auto max-w-xl px-8 dark:text-gray-400 flex flex-col min-h-full w-full items-center justify-start space-y-8"
>
	<h1 class="mb-1 dark:text-gray-200 text-2xl">Forgot Password</h1>
	<p class="mb-8 text-sm">
	    Enter your email address, we'll send you a link to reset your password.
	</p>

	<form method="POST" class="space-y-4"
		use:enhance={handleEnhance}
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


        <button
			type="submit"
			disabled={_resetting}
			class="w-full rounded-lg bg-black py-2 font-medium dark:text-white hover:bg-amber-600  disabled:opacity-40 cursor-pointer transition-colors duration-100 ease-in-out"
		>
			{_resetting ? 'Resetting…' : 'Reset Password'}
		</button>
    </form>
</main>
