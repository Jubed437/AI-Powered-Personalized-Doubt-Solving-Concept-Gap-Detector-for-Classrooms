import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { classroomApi } from '../../api/classroomApi';
import { doubtsApi } from '../../api/doubtsApi';
import { gapsApi } from '../../api/gapsApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  HelpCircle,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export function StudentDashboard({ onNavigate }) {
  const { user } = useAuth();
  const { isDark, activePalette } = useTheme();
  const [classrooms, setClassrooms] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      setLoading(true);
      try {
        const [clsRes, dbtRes, gapRes] = await Promise.allSettled([
          classroomApi.getClassrooms(),
          doubtsApi.getDoubts({ limit: 5 }),
          gapsApi.getStudentGaps(user.id),
        ]);

        if (clsRes.status === 'fulfilled' && clsRes.value.success) {
          setClassrooms(clsRes.value.data || []);
        }
        if (dbtRes.status === 'fulfilled' && dbtRes.value.success) {
          setDoubts(dbtRes.value.data?.doubts || []);
        }
        if (gapRes.status === 'fulfilled' && gapRes.value.success) {
          setGaps(gapRes.value.data || []);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const answeredDoubtsCount = doubts.filter((d) => d.status === 'answered').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-lg transition-all ${
          isDark
            ? `bg-gradient-to-r ${activePalette.darkBanner}`
            : `bg-gradient-to-r ${activePalette.lightBanner} shadow-slate-200/50`
        }`}
      >
        <div className="relative z-10 max-w-3xl">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border ${
              isDark
                ? 'bg-slate-900/80 border-slate-700 text-slate-200'
                : 'bg-white/80 border-slate-200 text-slate-800 shadow-2xs'
            }`}
          >
            <Sparkles
              className="w-3.5 h-3.5"
              style={{ color: activePalette.primaryHex }}
            />
            <span>AI-Driven Concept Gap Diagnostic Engine</span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Hello, {user?.name || 'Student'} 👋
          </h1>
          <p
            className={`mt-2 text-sm leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Every doubt you ask is analyzed by KNOWRA to identify foundational prerequisite concepts you might have missed. Close your learning gaps before they compound.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('ask')}
              style={{ backgroundColor: activePalette.primaryHex }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ask a Doubt Now</span>
            </button>
            <button
              onClick={() => onNavigate('classrooms')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                isDark
                  ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
              }`}
            >
              <Layers
                className="w-4 h-4"
                style={{ color: activePalette.primaryHex }}
              />
              <span>Join or View Classrooms</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`border p-5 rounded-3xl transition-all ${
            isDark
              ? 'bg-slate-900/60 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Enrolled Classes</span>
            <Layers
              className="w-4 h-4"
              style={{ color: activePalette.primaryHex }}
            />
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {loading ? '...' : classrooms.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Joined via classroom code</p>
        </div>

        <div
          className={`border p-5 rounded-3xl transition-all ${
            isDark
              ? 'bg-slate-900/60 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Doubts Logged</span>
            <BookOpen
              className="w-4 h-4"
              style={{ color: activePalette.primaryHex }}
            />
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {loading ? '...' : doubts.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Questions submitted</p>
        </div>

        <div
          className={`border p-5 rounded-3xl transition-all ${
            isDark
              ? 'bg-slate-900/60 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>AI Resolutions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {loading ? '...' : answeredDoubtsCount}
          </div>
          <p className="text-[11px] text-emerald-500 font-medium mt-1">
            Answered with analysis
          </p>
        </div>

        <div
          className={`border p-5 rounded-3xl transition-all ${
            isDark
              ? 'bg-slate-900/60 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Identified Gaps</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              isDark ? 'text-rose-400' : 'text-rose-600'
            }`}
          >
            {loading ? '...' : gaps.length}
          </div>
          <p className="text-[11px] text-rose-500/80 font-medium mt-1">
            Prerequisites to strengthen
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Doubts & Detected Gaps Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Doubts (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen
                className="w-5 h-5"
                style={{ color: activePalette.primaryHex }}
              />
              <h2
                className={`text-lg font-bold ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Recent Doubts
              </h2>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold inline-flex items-center gap-1 transition-colors hover:underline"
              style={{ color: activePalette.primaryHex }}
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div
              className={`p-8 text-center text-xs rounded-2xl border ${
                isDark
                  ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              Loading recent doubts...
            </div>
          ) : doubts.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              title="No doubts asked yet"
              description="Have a question in your classroom? Submit a doubt to get AI guidance and detect missing prerequisites."
              action={
                <button
                  onClick={() => onNavigate('ask')}
                  style={{ backgroundColor: activePalette.primaryHex }}
                  className="px-4 py-2 text-white rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
                >
                  Submit Your First Doubt
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {doubts.map((doubt) => (
                <div
                  key={doubt._id}
                  onClick={() => onNavigate('history')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2.5 shadow-xs group ${
                    isDark
                      ? 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-lg border"
                        style={{
                          backgroundColor: `${activePalette.primaryHex}15`,
                          borderColor: `${activePalette.primaryHex}30`,
                          color: activePalette.primaryHex,
                        }}
                      >
                        {doubt.subject}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        • {doubt.topic}
                      </span>
                    </div>
                    <StatusBadge status={doubt.status} />
                  </div>

                  <p
                    className={`text-sm font-semibold line-clamp-2 ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    "{doubt.text}"
                  </p>

                  {doubt.aiAnswer && (
                    <div
                      className={`text-xs line-clamp-2 p-2.5 rounded-xl border font-mono ${
                        isDark
                          ? 'bg-slate-950/60 border-slate-800/60 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {doubt.aiAnswer.replace(/[#*`]/g, '').slice(0, 160)}...
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doubt.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className="font-semibold group-hover:underline"
                      style={{ color: activePalette.primaryHex }}
                    >
                      View full explanation →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Concept Gaps Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <h2
                className={`text-lg font-bold ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Top Concept Gaps
              </h2>
            </div>
            <button
              onClick={() => onNavigate('gaps')}
              className="text-xs font-semibold inline-flex items-center gap-1 transition-colors hover:underline"
              style={{ color: activePalette.primaryHex }}
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            className={`border rounded-3xl p-5 space-y-3 ${
              isDark
                ? 'bg-slate-900/50 border-slate-800/80'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <p
              className={`text-xs ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Prerequisite topics flagged across your questions that need reinforcement:
            </p>

            {loading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading gaps...</p>
            ) : gaps.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No concept gaps identified yet. Once you submit doubts, KNOWRA's AI will diagnose weak prerequisites here.
              </div>
            ) : (
              <div className="space-y-2.5">
                {gaps.slice(0, 4).map((gap, idx) => (
                  <div
                    key={gap.concept || idx}
                    className={`p-3 rounded-2xl border space-y-1.5 ${
                      isDark
                        ? 'bg-slate-950/60 border-slate-800/80'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-bold ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                      >
                        {gap.concept}
                      </span>
                      <SeverityBadge severity={gap.severity} />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Occurred in {gap.totalOccurrences} doubt{gap.totalOccurrences > 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
