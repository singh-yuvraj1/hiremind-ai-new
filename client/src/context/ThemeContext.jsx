import { createContext, useContext, useState, useEffect } from 'react';

// all available themes
export const THEMES = [
  { id: 'dark',      label: 'Cyber Dark',  emoji: '🌑' },
  { id: 'neon',      label: 'Neon',        emoji: '🟣' },
  { id: 'cyberpunk', label: 'Cyberpunk',   emoji: '⚡' },
  { id: 'ocean',     label: 'Ocean',       emoji: '🌊' },
  { id: 'glass',     label: 'Glass',       emoji: '🪟' },
  { id: 'light',     label: 'Light',       emoji: '☀️' },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('hm_theme') || 'dark';
  });

  useEffect(() => {
    // remove all theme classes first
    const classes = THEMES.map(t => `theme-${t.id}`);
    document.documentElement.classList.remove(...classes);

    // add current theme class (default dark needs no class)
    if (theme !== 'dark') {
      document.documentElement.classList.add(`theme-${theme}`);
    }

    localStorage.setItem('hm_theme', theme);
    document.body.style.backgroundColor = 'var(--bg)';
    document.body.style.color = 'var(--text)';
  }, [theme]);

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}