import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeControls } from './ThemeControls';
import {
  GraduationCap,
  Sparkles,
  LogOut,
  ExternalLink,
  BookOpen,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';

export function Navbar({ activeTab, onTabChange }) {
  const { user, logout, backendHealth, pingBackend } = useAuth();
  const { isDark, activePalette } = useTheme();
  const isTeacher = user?.role === 'teacher';

  const studentTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'ask', label: 'Ask Doubt', icon: HelpCircle, badge: 'AI' },
    { id: 'history', label: 'My Doubts', icon: BookOpen },
    { id: 'gaps', label: 'Concept Gaps', icon: Sparkles },
    { id: 'classrooms', label: 'Classrooms', icon: Layers },
  ];

  const teacherTabs = [
    { id: 'dashboard', label: 'Overview', icon: Activity },
    { id: 'gaps', label: 'Classroom Gap Analytics', icon: Sparkles },
    { id: 'doubts', label: 'Classroom Doubts Stream', icon: BookOpen },
  ];

  const tabs = isTeacher ? teacherTabs : studentTabs;

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors duration-200 ${
        isDark
          ? 'bg-slate-950/85 border-slate-800/80 text-slate-100'
          : 'bg-white/90 border-slate-200 text-slate-800 shadow-xs'
      }`}
    >
      {/* Top tier: Brand, Theme Controls, Health, Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${activePalette.gradient} p-0.5 shadow-md`}
            >
              <div
                className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                  isDark ? 'bg-slate-950' : 'bg-white'
                }`}
              >
                <GraduationCap
                  className="w-5 h-5"
                  style={{ color: activePalette.primaryHex }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xl font-black tracking-tight"
                  style={{ color: isDark ? '#ffffff' : activePalette.primaryHex }}
                >
                  KNOWRA
                </span>
                <span
                  className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-300'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {user?.role || 'Guest'}
                </span>
              </div>
              <p
                className={`text-xs hidden sm:block ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                AI Doubt Solving &amp; Prerequisite Concept Gap Detector
              </p>
            </div>
          </div>

          {/* Right actions: Theme Controls, Swagger link, Health, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle & Color Palette */}
            <ThemeControls />

           

            {/* Health pill */}
            <button
              onClick={pingBackend}
              title="Click to check Render backend status"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-700 shadow-2xs'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealth.online
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-[11px]">
                {backendHealth.online ? 'Render API Online' : 'Connecting...'}
              </span>
            </button>
            {/* User Profile */}
            {user && (
              <div
                className={`flex items-center gap-2 pl-2 border-l ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm"
                  style={{ backgroundColor: activePalette.primaryHex }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div
                    className={`text-xs font-semibold leading-tight ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    {user.name}
                  </div>
                  <div
                    className={`text-[10px] leading-tight ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {user.email}
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign out"
                  className={`p-1.5 rounded-lg transition-colors ml-1 ${
                    isDark
                      ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-900'
                      : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      {user && (
        <div
          className={`border-t px-4 sm:px-6 lg:px-8 transition-colors ${
            isDark
              ? 'border-slate-800/60 bg-slate-950/40'
              : 'border-slate-100 bg-slate-50/60'
          }`}
        >
          <div className="max-w-7xl mx-auto flex gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  style={
                    isActive
                      ? {
                          backgroundColor: activePalette.primaryHex,
                          color: '#ffffff',
                        }
                      : {}
                  }
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                    isActive
                      ? 'shadow-md text-white'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 shadow-2xs'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isDark
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
