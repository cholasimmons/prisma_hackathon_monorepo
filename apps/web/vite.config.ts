import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(),
	SvelteKitPWA({
	  registerType: "autoUpdate",
		strategies: 'generateSW',
		manifest: {
      name: 'Plates',
      short_name: 'plates',
      description: 'Crowd sourced vehicle database',
      theme_color: '#663',
      background_color: '#335',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
	  workbox: {
	    // globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,txt,woff2}'],
			globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,jpg,jpeg,woff2}', '**/*.webmanifest'], // Use ** to search subdirectories],
      globIgnores: ['**/node_modules/**', '**/sw.js', '**/workbox-*.js'],
			runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\./,
        handler: 'NetworkOnly', // Always use network for API calls
      }
    ]
	 },
		devOptions: {
      enabled: true,
      type: 'module',
      navigateFallback: '/'
    }
	})
]
});
