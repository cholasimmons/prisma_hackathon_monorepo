import { writable } from 'svelte/store';

export const installPrompt = writable<BeforeInstallPromptEvent | null>(null);

window.addEventListener('beforeinstallprompt', (e) => {
	e.preventDefault(); // suppress browser UI
	installPrompt.set(e as BeforeInstallPromptEvent);
});
