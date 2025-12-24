<script lang="ts">
  import { onMount } from 'svelte';

  const { children, data } = $props();
  let open = $state(false);

  const links = [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/vehicles', label: 'Vehicles' },
      { href: '/admin/submissions', label: 'Vehicle Submissions' },
  ];

  onMount(() => {
  	console.log('Admin layout mounted');
  });
</script>


<div class="min-h-screen flex">
    <aside class="hidden lg:flex w-64 border-r p-4 flex-col">
        <nav class="space-y-2">
          {#each links as link}
            <a href={link.href} class="block hover:underline">
              {link.label}
            </a>
          {/each}
        </nav>
    </aside>

    <div class="grow flex flex-1 flex-col w-full">

        <!-- Top bar (md to lg) -->
        <header class="hidden md:flex lg:hidden h-14 border-b px-4 items-center">
            <nav class="flex gap-4">
            {#each links as link}
                <a href={link.href}>{link.label}</a>
            {/each}
            </nav>
        </header>

        <!-- Mobile header -->
        <header class="flex md:hidden h-14 border-b px-4 items-center justify-between">
            <span class="font-semibold">Admin</span>
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
                <aside class="absolute left-0 top-0 bottom-0 w-64 bg-white p-4">
                    <nav class="space-y-2">
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