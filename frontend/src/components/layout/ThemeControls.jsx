import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Palette, Check } from 'lucide-react';

export function ThemeControls({ compact = false }) {
  const { mode, isDark, toggleMode, accent, setAccent, palettes } = useTheme();
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const menuRef = useRef(null);

  // Close palette menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowPaletteMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-1.5" ref={menuRef}>
      {/* Light / Dark Mode Toggle Button */}
      <button
        type="button"
        onClick={toggleMode}
        title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        className={`p-2 rounded-xl transition-all border flex items-center justify-center ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800 hover:text-amber-300'
            : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-100 hover:text-indigo-700 shadow-sm'
        }`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
        )}
      </button>

      {/* Color Accent Picker Popover */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPaletteMenu(!showPaletteMenu)}
          title="Choose UI Color Theme"
          className={`p-2 rounded-xl transition-all border flex items-center gap-1.5 ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span
            className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20"
            style={{
              backgroundColor: palettes.find((p) => p.id === accent)?.primaryHex || '#4f46e5',
            }}
          />
        </button>

        {showPaletteMenu && (
          <div
            className={`absolute right-0 mt-2 w-48 rounded-2xl p-2 shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-200 shadow-black/60'
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/60'
            }`}
          >
            <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/40 dark:border-slate-800 mb-1">
              Color Theme
            </div>

            <div className="space-y-1">
              {palettes.map((p) => {
                const isSelected = accent === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setAccent(p.id);
                      setShowPaletteMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? isDark
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'bg-slate-100 text-slate-900 font-semibold'
                        : isDark
                        ? 'hover:bg-slate-800/60 text-slate-300'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: p.primaryHex }}
                      />
                      <span>{p.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

