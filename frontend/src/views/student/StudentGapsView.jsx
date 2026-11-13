import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { gapsApi } from '../../api/gapsApi';
import { useToast } from '../../components/ui/Toast';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export function StudentGapsView({ onNavigate }) {
  const { user } = useAuth();
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Knowledge Diagnosis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Concept Gaps
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated foundational prerequisites identified by AI from your doubt history.
          </p>
        </div>

        <button
          onClick={fetchGaps}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-medium text-slate-400">Total Flagged Concepts</div>
          <div className="text-2xl font-bold text-white mt-1.5">{loading ? '...' : gaps.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Prerequisites causing recurring friction</p>
        </div>

        <div className="bg-slate-900/60 border border-rose-900/30 p-5 rounded-2xl">
          <div className="text-xs font-medium text-rose-300">High Priority Gaps</div>
          <div className="text-2xl font-bold text-rose-400 mt-1.5">{loading ? '...' : highGapsCount}</div>
          <p className="text-[11px] text-rose-400/80 mt-1">Foundations needing immediate focus</p>
        </div>

        <div className="bg-slate-900/60 border border-amber-900/30 p-5 rounded-2xl">
          <div className="text-xs font-medium text-amber-300">Medium Priority Gaps</div>
          <div className="text-2xl font-bold text-amber-400 mt-1.5">{loading ? '...' : mediumGapsCount}</div>
          <p className="text-[11px] text-amber-400/80 mt-1">Concepts requiring additional practice</p>
        </div>
      </div>

      {/* List of Concepts */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800">
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-all"
            >
              Ask a Question Now
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Ranked by Occurrence Frequency
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gaps.map((gap, index) => (
              <div
                key={gap.concept || index}
                className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 p-5 rounded-2xl space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Rank #{index + 1}
                    </span>
                    <h3 className="text-base font-bold text-slate-100 mt-0.5">
                      {gap.concept}
                    </h3>
                  </div>
                  <SeverityBadge severity={gap.severity} />
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800/70 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Frequency in your doubts:</span>
                    <span className="font-bold text-cyan-300">
                      {gap.totalOccurrences} occurrence{gap.totalOccurrences > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 pt-1 text-slate-300 text-[11px] leading-relaxed">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Review the core definitions and edge cases for <strong>{gap.concept}</strong> to resolve doubts in this area faster.
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Status: Targeted by Diagnostic Engine
                  </span>
                  <button
                    onClick={() => onNavigate('ask')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
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

