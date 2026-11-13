import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext(null);

export const ACCENT_PALETTES = [
  {
    id: 'indigo',
    name: 'Indigo & Cyan',
    label: 'Indigo (Default)',
    primaryHex: '#4f46e5',
    gradient: 'from-indigo-600 via-indigo-500 to-cyan-400',
    lightBanner: 'from-indigo-50 via-white to-cyan-50 border-indigo-200',
    darkBanner: 'from-indigo-950/80 via-slate-900/90 to-cyan-950/60 border-indigo-900/40',
  },
  {
    id: 'emerald',
    name: 'Emerald & Teal',
    label: 'Emerald Mint',
    primaryHex: '#059669',
    gradient: 'from-emerald-600 via-emerald-500 to-teal-400',
    lightBanner: 'from-emerald-50 via-white to-teal-50 border-emerald-200',
    darkBanner: 'from-emerald-950/80 via-slate-900/90 to-teal-950/60 border-emerald-900/40',
  },
  {
    id: 'cyan',
    name: 'Ocean & Sky',
    label: 'Ocean Cyan',
    primaryHex: '#0891b2',
    gradient: 'from-cyan-600 via-sky-500 to-blue-400',
    lightBanner: 'from-cyan-50 via-white to-sky-50 border-cyan-200',
    darkBanner: 'from-cyan-950/80 via-slate-900/90 to-blue-950/60 border-cyan-900/40',
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    label: 'Royal Violet',
    primaryHex: '#7c3aed',
    gradient: 'from-purple-600 via-violet-500 to-fuchsia-400',
    lightBanner: 'from-purple-50 via-white to-fuchsia-50 border-purple-200',
    darkBanner: 'from-purple-950/80 via-slate-900/90 to-fuchsia-950/60 border-purple-900/40',
  },
  {
    id: 'rose',
    name: 'Sunset Rose',
    label: 'Sunset Rose',
    primaryHex: '#e11d48',
    gradient: 'from-rose-600 via-pink-500 to-amber-400',
    lightBanner: 'from-rose-50 via-white to-amber-50 border-rose-200',
    darkBanner: 'from-rose-950/80 via-slate-900/90 to-amber-950/60 border-rose-900/40',
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    label: 'Warm Amber',
    primaryHex: '#d97706',
    gradient: 'from-amber-600 via-orange-500 to-yellow-400',
    lightBanner: 'from-amber-50 via-white to-yellow-50 border-amber-200',
    darkBanner: 'from-amber-950/80 via-slate-900/90 to-yellow-950/60 border-amber-900/40',
  },
];

export function ThemeProvider({ children }) {
  // Mode: 'light' or 'dark' (defaults to 'light' since user asked because UI is kind of dark)
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('knowra_theme_mode');
    return saved || 'light';
  });

  // Accent: one of the ACCENT_PALETTES IDs
  const [accent, setAccent] = useState(() => {
    const saved = localStorage.getItem('knowra_theme_accent');
    return saved || 'indigo';
  });

  useEffect(() => {
    localStorage.setItem('knowra_theme_mode', mode);
    document.documentElement.setAttribute('data-theme', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('knowra_theme_accent', accent);
    document.documentElement.setAttribute('data-accent', accent);
  }, [accent]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const activePalette = useMemo(() => {
    return ACCENT_PALETTES.find((p) => p.id === accent) || ACCENT_PALETTES[0];
  }, [accent]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark: mode === 'dark',
        setMode,
        toggleMode,
        accent,
        setAccent,
        activePalette,
        palettes: ACCENT_PALETTES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

