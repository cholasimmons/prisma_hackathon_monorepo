// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: string;
				createdAt: Date;
				updatedAt: Date;
				email: string;
				emailVerified: boolean;
				name: string;
				role?: string | null;
				image?: string | null | undefined | undefined;
			} | null;
			session: {
				id: string;
				createdAt: Date;
				updatedAt: Date;
				userId: string;
				expiresAt: Date;
				token: string;
				ipAddress?: string | null | undefined | undefined;
				userAgent?: string | null | undefined | undefined;
			} | null;
			apiDown: boolean | null; // API reachable, just unauthenticated
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		// /// <reference types="@sveltejs/kit" />

		interface BeforeInstallPromptEvent extends Event {
			readonly platforms: string[];
			readonly userChoice: Promise<{
				outcome: 'accepted' | 'dismissed';
				platform: string;
			}>;
			prompt(): Promise<void>;
		}
	}
}

declare module 'virtual:pwa-register' {
	export function registerSW(options?: {
		immediate?: boolean;
		onNeedRefresh?: () => void;
		onOfflineReady?: () => void;
	}): void;
}

export {};
