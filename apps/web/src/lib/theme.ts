export type Theme = 'dark' | 'light';
let currentTheme: Theme = 'dark';

function applyTheme(theme: Theme) {
	document.documentElement.classList.toggle('dark', theme === 'dark');
	localStorage.setItem('theme', theme);
	currentTheme = theme;
}

function initTheme() {
	const saved = localStorage.getItem('theme') as Theme | null;
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	applyTheme(saved ?? (prefersDark ? 'dark' : 'light'));
}

function getTheme(): Theme {
  return localStorage.getItem('theme') as Theme ?? 'dark';
}

export { applyTheme, initTheme, getTheme, currentTheme };
