import { useTheme } from '../../context/ThemeContext';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  const { isDark, activePalette } = useTheme();

  return (
    <footer
      className={`border-t py-6 px-4 text-center text-xs transition-colors ${
        isDark
          ? 'border-slate-800/80 bg-slate-950/70 text-slate-500'
          : 'border-slate-200 bg-white/70 text-slate-500 shadow-2xs'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span
            className="font-bold"
            style={{ color: isDark ? '#ffffff' : activePalette.primaryHex }}
          >
            KNOWRA
          </span>{' '}
          — Understand. Discover. Master.
          <span className="mx-2 text-slate-400">|</span>
          AI-Powered Adaptive Learning Platform
        </div>
        <div className="flex items-center gap-4 text-xs">
          <a
            href="https://knowra-backend-wwyu.onrender.com/api-docs/#/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold hover:underline transition-colors"
            style={{ color: activePalette.primaryHex }}
          >
            <span>Swagger API Specification</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
