import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(),
	// SvelteKitPWA({
	//   registerType: "autoUpdate",
	// 	strategies: 'generateSW',
	// 	manifest: {
 //      name: 'Plates',
 //      short_name: 'plates',
 //      description: 'Crowd sourced vehicle database',
 //      theme_color: '#663',
 //      background_color: '#335',
 //      display: 'standalone',
 //      scope: '/',
 //      start_url: '/',
 //      icons: [
 //        {
 //          src: '/icons/icon-192.png',
 //          sizes: '192x192',
 //          type: 'image/png'
 //        },
 //        {
 //          src: '/icons/icon-512.png',
 //          sizes: '512x512',
 //          type: 'image/png'
 //        }
 //      ]
 //    },
	//   workbox: {
	//     globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,txt,woff2}'],
	// 		runtimeCaching: [
 //      {
 //        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
 //        handler: 'CacheFirst',
 //        options: {
 //          cacheName: 'google-fonts-cache',
 //          expiration: {
 //            maxEntries: 10,
 //            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
 //          },
 //          cacheableResponse: {
 //            statuses: [0, 200]
 //          }
 //        }
 //      }
 //    ]
	//  },
	// 	devOptions: {
 //      enabled: true,
 //      type: 'module',
 //      navigateFallback: '/'
 //    }
	// })
]
});
