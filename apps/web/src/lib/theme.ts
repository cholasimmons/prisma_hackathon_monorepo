export type Theme = 'dark' | 'light';

function applyTheme(theme: Theme) {
	document.documentElement.classList.toggle('dark', theme === 'dark');
	localStorage.setItem('theme', theme);
}

function initTheme() {
	const saved = localStorage.getItem('theme') as Theme | null;
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	applyTheme(saved ?? (prefersDark ? 'dark' : 'light'));
}

export { applyTheme, initTheme };
