import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), SvelteKitPWA({
	  registerType: "autoUpdate",
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
	    globPatterns: ['**/*.{js,css,html,ico,png,svg,txt,woff2}'],
	  },
		devOptions: {
      enabled: true,
      type: 'module'
    }
	})
] as any
});
