import { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  { id: 'dark',  label: 'Dark',  emoji: '🌙' },
  { id: 'light', label: 'Light', emoji: '☀️' },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('hm_theme');
    // Migrate old neon/cyberpunk/glass/ocean themes to dark
    if (!['dark','light'].includes(saved)) return 'dark';
    return saved || 'dark';
  });

  useEffect(() => {
    // Remove any old theme classes
    document.documentElement.classList.remove('theme-dark','theme-light','theme-neon','theme-cyberpunk','theme-ocean','theme-glass');

    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
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