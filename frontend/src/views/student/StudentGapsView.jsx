import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { gapsApi } from '../../api/gapsApi';
import { useToast } from '../../components/ui/Toast';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Sparkles,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export function StudentGapsView({ onNavigate }) {
  const { user } = useAuth();
  const { isDark, activePalette } = useTheme();
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();

  const fetchGaps = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await gapsApi.getStudentGaps(user.id);
      if (res.success && res.data) {
        setGaps(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load concept gaps', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaps();
  }, [user]);

  const highGapsCount = gaps.filter((g) => g.severity === 'high').length;
  const mediumGapsCount = gaps.filter((g) => g.severity === 'medium').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isDark
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                : 'bg-rose-50 border-rose-200 text-rose-700 shadow-2xs'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>AI Knowledge Diagnosis</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            My Concept Gaps
          </h1>
          <p
            className={`text-sm mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Aggregated foundational prerequisites identified by AI from your doubt history.
          </p>
        </div>

        <button
          onClick={fetchGaps}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all self-start sm:self-auto ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`border p-5 rounded-3xl transition-all ${
            isDark
              ? 'bg-slate-900/60 border-slate-800'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="text-xs font-semibold text-slate-400">Total Flagged Concepts</div>
          <div
            className={`text-2xl font-black mt-1.5 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {loading ? '...' : gaps.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Prerequisites causing recurring friction</p>
        </div>

        <div
          className={`border p-5 rounded-3xl transition-all ${
            isDark
              ? 'bg-slate-900/60 border-rose-900/30'
              : 'bg-white border-rose-200 shadow-sm'
          }`}
        >
          <div className="text-xs font-semibold text-rose-500">High Priority Gaps</div>
          <div className="text-2xl font-black text-rose-500 mt-1.5">
            {loading ? '...' : highGapsCount}
          </div>
          <p className="text-[11px] text-rose-500/80 font-medium mt-1">
            Foundations needing immediate focus
          </p>
        </div>

        <div
          className={`border p-5 rounded-3xl transition-all ${
            isDark
              ? 'bg-slate-900/60 border-amber-900/30'
              : 'bg-white border-amber-200 shadow-sm'
          }`}
        >
          <div className="text-xs font-semibold text-amber-500">Medium Priority Gaps</div>
          <div className="text-2xl font-black text-amber-500 mt-1.5">
            {loading ? '...' : mediumGapsCount}
          </div>
          <p className="text-[11px] text-amber-500/80 font-medium mt-1">
            Concepts requiring additional practice
          </p>
        </div>
      </div>

      {/* List of Concepts */}
      {loading ? (
        <div
          className={`p-12 text-center text-xs rounded-2xl border ${
            isDark
              ? 'bg-slate-900/30 border-slate-800 text-slate-400'
              : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          Diagnosing your concept gaps...
        </div>
      ) : gaps.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No concept gaps detected"
          description="You haven't accumulated any concept gaps yet! Ask doubts as you study to let KNOWRA pinpoint subtle prerequisite misunderstandings."
          action={
            <button
              onClick={() => onNavigate('ask')}
              style={{ backgroundColor: activePalette.primaryHex }}
              className="px-4 py-2 text-white rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
            >
              Ask a Question Now
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Ranked by Occurrence Frequency
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gaps.map((gap, index) => (
              <div
                key={gap.concept || index}
                className={`border p-6 rounded-3xl space-y-3 transition-all shadow-xs ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Rank #{index + 1}
                    </span>
                    <h3
                      className={`text-base font-bold mt-0.5 ${
                        isDark ? 'text-slate-100' : 'text-slate-900'
                      }`}
                    >
                      {gap.concept}
                    </h3>
                  </div>
                  <SeverityBadge severity={gap.severity} />
                </div>

                <div
                  className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                    isDark
                      ? 'bg-slate-950/70 border-slate-800/70'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Frequency in your doubts:</span>
                    <span
                      className="font-bold text-sm"
                      style={{ color: activePalette.primaryHex }}
                    >
                      {gap.totalOccurrences} occurrence{gap.totalOccurrences > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div
                    className={`flex items-start gap-2 pt-1 text-[11px] leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      Review the core definitions and edge cases for <strong>{gap.concept}</strong> to resolve doubts in this area faster.
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Status: Targeted by Diagnostic Engine
                  </span>
                  <button
                    onClick={() => onNavigate('ask')}
                    className="text-xs font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                    style={{ color: activePalette.primaryHex }}
                  >
                    <span>Practice topic</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
