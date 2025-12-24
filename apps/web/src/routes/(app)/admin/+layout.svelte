<script lang="ts">
  import { onMount } from 'svelte';

  const { children, data } = $props();
  let open = $state(false);

  const links = [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/vehicles', label: 'Vehicles' },
      { href: '/admin/submissions', label: 'Submissions' },
  ];

  onMount(() => {
  	console.log('Admin layout mounted');
  });
</script>


<div class="min-h-full flex">
    <aside class="hidden lg:flex w-64 border-r p-4 flex-col bg-gray-300 dark:bg-gray-900">
        <nav class="space-y-2 text-3xl">
          {#each links as link}
            <a href={link.href} class="block hover:underline">
              {link.label}
            </a>
          {/each}
        </nav>
    </aside>

    <div class="grow flex flex-1 flex-col w-full">

        <!-- Top bar (md to lg) -->
        <header class="hidden md:flex lg:hidden h-14 border-b px-4 items-center text-gray-800 dark:text-gray-200">
            <nav class="flex gap-4">
            {#each links as link}
                <a href={link.href}>{link.label}</a>
            {/each}
            </nav>
        </header>

        <!-- Mobile header -->
        <header class="flex md:hidden h-14 border-b px-4 items-center justify-between text-gray-800 dark:text-gray-200">
            <span class="font-semibold">Menu</span>
            <button onclick={() => (open = true)}>☰</button>
        </header>

        <!-- Mobile drawer -->
        {#if open}
            <div class="fixed inset-0 z-40">
                <div tabindex="0"
                  role="button" class="absolute inset-0 bg-black/40"
                  onclick={() => (open = false)}
                  onkeydown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') open = false;
                    }}></div>
                <aside class="absolute left-0 top-0 bottom-0 w-64 bg-gray-300 dark:bg-gray-900 p-4">
                    <nav class="space-y-2 flex flex-col text-gray-800 dark:text-gray-200">
                    {#each links as link}
                        <a href={link.href} onclick={() => (open = false)}>
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