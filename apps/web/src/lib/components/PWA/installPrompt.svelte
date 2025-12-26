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
    <div class="prompt-content">
      <button class="close-btn" onclick={dismissPrompt}>
        ×
      </button>
      <div class="prompt-icon">
        📱
      </div>
      <h3>Install App</h3>
      <p>Get quick access from your home screen</p>
      <div class="prompt-actions">
        <button class="install-btn" onclick={installApp}>
          Install
        </button>
        <button class="later-btn" onclick={dismissPrompt}>
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

  .prompt-content {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    max-width: 300px;
    position: relative;
  }

  .close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    line-height: 1;
    padding: 4px 8px;
  }

  .close-btn:hover {
    color: #333;
  }

  .prompt-icon {
    font-size: 32px;
    text-align: center;
    margin-bottom: 8px;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    text-align: center;
  }

  p {
    margin: 0 0 16px 0;
    color: #666;
    font-size: 14px;
    text-align: center;
  }

  .prompt-actions {
    display: flex;
    gap: 8px;
  }

  .install-btn {
    flex: 1;
    background: #007bff;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
  }

  .install-btn:hover {
    background: #0056b3;
  }

  .later-btn {
    flex: 1;
    background: #f0f0f0;
    color: #333;
    border: none;
    padding: 10px;
    border-radius: 6px;
    cursor: pointer;
  }

  .later-btn:hover {
    background: #e0e0e0;
  }

  @media (max-width: 640px) {
    .install-prompt {
      bottom: 10px;
      right: 10px;
      left: 10px;
    }

    .prompt-content {
      max-width: 100%;
    }
  }
</style>