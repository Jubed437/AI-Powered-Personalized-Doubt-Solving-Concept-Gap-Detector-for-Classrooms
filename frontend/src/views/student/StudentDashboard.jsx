import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-cyan-950/60 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Concept Gap Diagnostic Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hello, {user?.name || 'Student'} 👋
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Every doubt you ask is analyzed by KNOWRA to identify foundational prerequisite concepts you might have missed. Close your learning gaps before they compound.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('ask')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ask a Doubt Now</span>
            </button>
            <button
              onClick={() => onNavigate('classrooms')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium text-xs sm:text-sm transition-all"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Join or View Classrooms</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Enrolled Classes</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {loading ? '...' : classrooms.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Joined via classroom code</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Doubts Logged</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {loading ? '...' : doubts.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Questions submitted</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>AI Resolutions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {loading ? '...' : answeredDoubtsCount}
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1">Answered with analysis</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Identified Gaps</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {loading ? '...' : gaps.length}
          </div>
          <p className="text-[11px] text-rose-400/80 mt-1">Prerequisites to strengthen</p>
        </div>
      </div>

      {/* Main Grid: Recent Doubts & Detected Gaps Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Doubts (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-100">Recent Doubts</h2>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-all"
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
                  className="p-5 bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl transition-all cursor-pointer space-y-2.5 shadow-sm group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-lg">
                        {doubt.subject}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        • {doubt.topic}
                      </span>
                    </div>
                    <StatusBadge status={doubt.status} />
                  </div>

                  <p className="text-sm font-medium text-slate-200 line-clamp-2">
                    "{doubt.text}"
                  </p>

                  {doubt.aiAnswer && (
                    <div className="text-xs text-slate-400 line-clamp-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 font-mono">
                      {doubt.aiAnswer.replace(/[#*`]/g, '').slice(0, 160)}...
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doubt.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-cyan-400 font-medium group-hover:underline">
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
              <Sparkles className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg font-bold text-slate-100">Top Concept Gaps</h2>
            </div>
            <button
              onClick={() => onNavigate('gaps')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <p className="text-xs text-slate-400">
              Prerequisite topics flagged across your questions that need reinforcement:
            </p>

            {loading ? (
              <p className="text-xs text-slate-500 py-4 text-center">Loading gaps...</p>
            ) : gaps.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No concept gaps identified yet. Once you submit doubts, KNOWRA's AI will diagnose weak prerequisites here.
              </div>
            ) : (
              <div className="space-y-2.5">
                {gaps.slice(0, 4).map((gap, idx) => (
                  <div
                    key={gap.concept || idx}
                    className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-200">
                        {gap.concept}
                      </span>
                      <SeverityBadge severity={gap.severity} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Occurred in {gap.totalOccurrences} doubt{gap.totalOccurrences > 1 ? 's' : ''}</span>
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

