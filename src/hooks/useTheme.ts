import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Read persisted preference first
    const stored = localStorage.getItem('verolente-theme') as Theme | null;
    if (stored === 'dark' || stored === 'light') return stored;
    // Fall back to OS preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Apply to DOM whenever theme changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('verolente-theme', theme);
  }, [theme]);

  // Apply immediately on mount (handles SSR/hydration edge cases)
  useEffect(() => {
    applyTheme(theme);
  }, []);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  const isDark = theme === 'dark';

  return { theme, isDark, toggleTheme, setTheme };
}
