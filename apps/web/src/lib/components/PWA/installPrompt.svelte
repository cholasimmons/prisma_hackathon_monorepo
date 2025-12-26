<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment';
  import { pwaInfo } from 'virtual:pwa-info';

  // PWA variables
  let deferredPrompt: any
  let showInstallPrompt = $state(false);
  let isDismissed = false

  onMount(async () => {
    if (!browser) return

    if (pwaInfo) {
        const { useRegisterSW } = await import('virtual:pwa-register/svelte')
        useRegisterSW({
          immediate: true,
          onRegistered(r: any) {
            // uncomment following code if you want check for updates
            // r && setInterval(() => {
            //    console.log('Checking for sw update')
            //    r.update()
            // }, 20000 /* 20s for testing purposes */)
            console.log(`SW Registered: ${r}`)
          },
          onRegisterError(error: any) {
            console.log('SW registration error', error)
          }
        })
    }

    // Check if user already dismissed it
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)

    if (dismissedTime && dismissedTime > sevenDaysAgo) {
      console.log('Install prompt dismissed recently')
      return
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event fired')
      e.preventDefault()
      deferredPrompt = e

      // Show popup after 10 seconds
      setTimeout(() => {
        showInstallPrompt = true
        console.log('Showing install prompt')
      }, 10000)
    })

    // Hide prompt if app is already installed
    window.addEventListener('appinstalled', () => {
      console.log('App installed')
      showInstallPrompt = false
    })
  })

  async function installApp() {
    if (!deferredPrompt) {
      console.log('No deferred prompt available')
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log('User choice:', outcome)

    showInstallPrompt = false
    if (outcome === 'accepted') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    }
    deferredPrompt = null
  }

  function dismissPrompt() {
    showInstallPrompt = false
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    console.log('Install prompt dismissed')
  }

  const webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ''
</script>

<svelte:head>
	{@html webManifestLink}
</svelte:head>

{#if showInstallPrompt}
  <div class="install-prompt">
    <div class="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 shadow-lg max-w-xs relative">
      <button class="absolute top-2 right-2 text-2xl cursor-pointer text-gray-500 hover:text-gray-400 py-1 px-2" onclick={dismissPrompt}>
        ×
      </button>
      <div class="text-4xl text-center mb-2">
        🛞
      </div>
      <h3 class="mb-0 text-lg text-center text-gray-800 dark:text-gray-200">Install App</h3>
      <p class="mb-6 text-gray-600 dark:text-gray-400 text-base text-center">to your home screen</p>
      <div class="flex justify-between gap-2">
        <button class="flex bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded cursor-pointer font-medium"
            style="padding: 8px 16px"
           onclick={installApp}>
          Install
        </button>
        <button class="flex text-gray-500 px-4 py-2 rounded cursor-pointer"
           style="padding: 8px 16px"
          onclick={dismissPrompt}>
          Maybe Later
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .install-prompt {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 640px) {
    .install-prompt {
      bottom: 10px;
      right: 10px;
      left: 10px;
    }
  }
</style>