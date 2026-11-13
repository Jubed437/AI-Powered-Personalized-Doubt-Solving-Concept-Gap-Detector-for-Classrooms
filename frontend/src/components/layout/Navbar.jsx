import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Sparkles,
  LogOut,
  ExternalLink,
  BookOpen,
  UserCheck,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';

export function Navbar({ activeTab, onTabChange }) {
  const { user, logout, backendHealth, pingBackend } = useAuth();
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
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 transition-all">
      {/* Top tier: Brand & Meta */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-300 via-cyan-200 to-white bg-clip-text text-transparent">
                  KNOWRA
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {user?.role || 'Guest'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI Doubt Solving &amp; Prerequisite Concept Gap Detector
              </p>
            </div>
          </div>

          {/* Right actions: Backend Health, Swagger link, User, Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Swagger Docs link button */}
            <a
              href="http://localhost:5001/api-docs/#/"
              target="_blank"
              rel="noreferrer"
              title="Open Swagger API documentation"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Swagger API Docs</span>
            </a>

            {/* Health pill */}
            <button
              onClick={pingBackend}
              title="Click to re-ping backend server"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealth.online
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-slate-300 text-[11px]">
                {backendHealth.online ? 'API Online :5001' : 'API Offline'}
              </span>
            </button>

            {/* User Profile info */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {user.email}
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors ml-1"
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
        <div className="border-t border-slate-800/60 bg-slate-950/40 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-indigo-400/30 text-white'
                          : 'bg-cyan-500/20 text-cyan-300'
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

