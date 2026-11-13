import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/ui/Toast';
import { ThemeControls } from '../../components/layout/ThemeControls';
import { GraduationCap, ArrowRight, UserCheck, ShieldCheck, ExternalLink } from 'lucide-react';

export function AuthView() {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, demoLogin, backendHealth } = useAuth();
  const { isDark, activePalette } = useTheme();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Full name is required');
        await register({ name, email, password, role });
        addToast(`Welcome to KNOWRA, ${name}!`, 'success');
      } else {
        await login(email, password);
        addToast('Signed in successfully', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (demoRole) => {
    setLoading(true);
    try {
      await demoLogin(demoRole);
      addToast(`Signed in as demo ${demoRole}!`, 'success');
    } catch (err) {
      addToast(err.message || 'Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top right floating theme controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <ThemeControls />
      </div>

      {/* Decorative ambient gradients */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] rounded-full blur-[130px] pointer-events-none transition-all ${
          isDark ? 'opacity-25' : 'opacity-35'
        }`}
        style={{
          background: `radial-gradient(circle, ${activePalette.primaryHex} 0%, transparent 70%)`,
        }}
      />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr ${activePalette.gradient} p-0.5 shadow-xl mb-4`}
        >
          <div
            className={`w-full h-full rounded-[14px] flex items-center justify-center ${
              isDark ? 'bg-slate-950' : 'bg-white'
            }`}
          >
            <GraduationCap
              className="w-7 h-7"
              style={{ color: activePalette.primaryHex }}
            />
          </div>
        </div>

        <h1
          className="text-3xl font-black tracking-tight"
          style={{ color: isDark ? '#ffffff' : activePalette.primaryHex }}
        >
          KNOWRA
        </h1>
        <p
          className="text-sm font-semibold mt-1"
          style={{ color: activePalette.primaryHex }}
        >
          Understand. Discover. Master.
        </p>
        <p
          className={`text-xs mt-1.5 max-w-sm mx-auto ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          AI-Powered Adaptive Learning &amp; Prerequisite Concept Gap Detection for Classrooms
        </p>

        {/* Backend health & Swagger notice */}
        <div className="mt-4 flex items-center justify-center gap-3 text-xs">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealth.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{backendHealth.online ? 'Render API Online' : 'Connecting to Render...'}</span>
          </span>
        
        </div>
      </div>

      {/* Auth Card */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div
          className={`border rounded-3xl p-6 sm:p-8 backdrop-blur-xl transition-all shadow-xl ${
            isDark
              ? 'bg-slate-900/75 border-slate-800/80'
              : 'bg-white/95 border-slate-200 shadow-slate-200/60'
          }`}
        >
          {/* Tabs: Sign In / Create Account */}
          <div
            className={`grid grid-cols-2 p-1 rounded-xl mb-6 border text-xs font-semibold ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              style={
                !isRegister
                  ? {
                      backgroundColor: activePalette.primaryHex,
                      color: '#ffffff',
                    }
                  : {}
              }
              className={`py-2 rounded-lg transition-all ${
                !isRegister ? 'shadow' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              style={
                isRegister
                  ? {
                      backgroundColor: activePalette.primaryHex,
                      color: '#ffffff',
                    }
                  : {}
              }
              className={`py-2 rounded-lg transition-all ${
                isRegister ? 'shadow' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* If registering, choose role */}
            {isRegister && (
              <>
                <div>
                  <label
                    className={`block text-xs font-medium mb-1.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      style={
                        role === 'student'
                          ? {
                              borderColor: activePalette.primaryHex,
                              backgroundColor: `${activePalette.primaryHex}15`,
                              color: activePalette.primaryHex,
                            }
                          : {}
                      }
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        role === 'student'
                          ? ''
                          : isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      style={
                        role === 'teacher'
                          ? {
                              borderColor: activePalette.primaryHex,
                              backgroundColor: `${activePalette.primaryHex}15`,
                              color: activePalette.primaryHex,
                            }
                          : {}
                      }
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        role === 'teacher'
                          ? ''
                          : isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Teacher
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-xs font-medium mb-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Patel"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-colors ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                    }`}
                    style={{ outlineColor: activePalette.primaryHex }}
                  />
                </div>
              </>
            )}

            <div>
              <label
                className={`block text-xs font-medium mb-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-colors ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                }`}
                style={{ outlineColor: activePalette.primaryHex }}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-medium mb-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-colors ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                }`}
                style={{ outlineColor: activePalette.primaryHex }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: activePalette.primaryHex }}
              className="w-full py-2.5 px-4 text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Register & Continue' : 'Sign In to KNOWRA'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo buttons divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div
                className={`w-full border-t ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}
              />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span
                className={`px-3 font-semibold ${
                  isDark
                    ? 'bg-slate-900 text-slate-400'
                    : 'bg-white text-slate-500'
                }`}
              >
                Or Instant Test Login
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemo('student')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              <UserCheck
                className="w-3.5 h-3.5"
                style={{ color: activePalette.primaryHex }}
              />
              <span>Demo Student</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemo('teacher')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              <ShieldCheck
                className="w-3.5 h-3.5"
                style={{ color: activePalette.primaryHex }}
              />
              <span>Demo Teacher</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
