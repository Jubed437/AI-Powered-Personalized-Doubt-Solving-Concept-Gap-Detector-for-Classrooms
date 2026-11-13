import { useState, useEffect, useCallback } from 'react';
import { doubtsApi } from '../../api/doubtsApi';
import { classroomApi } from '../../api/classroomApi';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/ui/Toast';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MarkdownRenderer } from '../../components/common/MarkdownRenderer';
import { EmptyState } from '../../components/common/EmptyState';
import {
  BookOpen,
  Filter,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Search,
} from 'lucide-react';

export function DoubtsHistoryView({ onNavigate }) {
  const { isDark, activePalette } = useTheme();
  const [doubts, setDoubts] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [classroomFilter, setClassroomFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const { addToast } = useToast();

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await doubtsApi.getDoubts({
        status: statusFilter || undefined,
        classroomId: classroomFilter || undefined,
        limit: 50,
      });

      if (res.success && res.data) {
        setDoubts(res.data.doubts || []);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load doubts', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, classroomFilter, addToast]);

  useEffect(() => {
    async function loadClassrooms() {
      try {
        const res = await classroomApi.getClassrooms();
        if (res.success && res.data) {
          setClassrooms(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadClassrooms();
  }, []);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  const handleRetry = async (doubtId, e) => {
    e.stopPropagation();
    setRetryingId(doubtId);
    try {
      const res = await doubtsApi.retryDoubt(doubtId);
      if (res.success && res.data) {
        addToast('AI analysis completed successfully!', 'success');
        setDoubts((prev) =>
          prev.map((d) => (d._id === doubtId ? res.data : d))
        );
        setExpandedId(doubtId);
      }
    } catch (err) {
      addToast(err.message || 'Retry failed', 'error');
    } finally {
      setRetryingId(null);
    }
  };

  const filteredDoubts = doubts.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.text?.toLowerCase().includes(q) ||
      d.topic?.toLowerCase().includes(q) ||
      d.subject?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300'
                : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            <BookOpen
              className="w-3.5 h-3.5"
              style={{ color: activePalette.primaryHex }}
            />
            <span>Learning Timeline</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            My Doubts &amp; AI Explanations
          </h1>
          <p
            className={`text-sm mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Review all questions you have asked along with AI diagnosis and concept prerequisites.
          </p>
        </div>

        <button
          onClick={fetchDoubts}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all self-start sm:self-auto ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div
        className={`p-4 border rounded-3xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs ${
          isDark
            ? 'bg-slate-900/60 border-slate-800/80'
            : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}
      >
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic or doubt..."
            className={`w-full pl-9 pr-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 transition-colors ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
            }`}
            style={{ outlineColor: activePalette.primaryHex }}
          />
        </div>

        {/* Status & Classroom Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div
            className={`flex items-center gap-2 text-xs font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 cursor-pointer transition-colors ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white'
            }`}
          >
            <option value="">All Statuses</option>
            <option value="answered">Answered</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          {classrooms.length > 0 && (
            <select
              value={classroomFilter}
              onChange={(e) => setClassroomFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 cursor-pointer transition-colors ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white'
              }`}
            >
              <option value="">All Classrooms</option>
              {classrooms.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Doubts List */}
      {loading ? (
        <div
          className={`p-12 text-center text-xs rounded-2xl border ${
            isDark
              ? 'bg-slate-900/30 border-slate-800 text-slate-400'
              : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          Loading doubt records...
        </div>
      ) : filteredDoubts.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No doubts match your filters"
          description={
            doubts.length === 0
              ? "You haven't submitted any doubts yet. Ask a question to get AI-powered concept diagnosis."
              : 'Try clearing the search query or status filters.'
          }
          action={
            doubts.length === 0 ? (
              <button
                onClick={() => onNavigate('ask')}
                style={{ backgroundColor: activePalette.primaryHex }}
                className="px-4 py-2 text-white rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
              >
                Ask a Doubt
              </button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredDoubts.map((doubt) => {
            const isExpanded = expandedId === doubt._id;
            const isFailed = doubt.status === 'failed';
            const isRetrying = retryingId === doubt._id;

            return (
              <div
                key={doubt._id}
                className={`border rounded-2xl overflow-hidden transition-all shadow-xs ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : doubt._id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
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
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                      >
                        {doubt.topic}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(doubt.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p
                      className={`text-sm font-semibold pt-1 leading-snug ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      "{doubt.text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <StatusBadge status={doubt.status} />

                    {isFailed && (
                      <button
                        type="button"
                        disabled={isRetrying}
                        onClick={(e) => handleRetry(doubt._id, e)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <RotateCcw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                        <span>{isRetrying ? 'Retrying...' : 'Retry AI'}</span>
                      </button>
                    )}

                    <div className="text-slate-400 p-1">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details: AI Answer & Prerequisite Gaps */}
                {isExpanded && (
                  <div
                    className={`border-t p-6 space-y-4 animate-in slide-in-from-top-2 duration-200 ${
                      isDark
                        ? 'border-slate-800 bg-slate-950/80'
                        : 'border-slate-100 bg-slate-50/70'
                    }`}
                  >
                    {doubt.aiAnswer ? (
                      <div className="space-y-3">
                        <h4
                          className="text-xs uppercase font-bold tracking-wider"
                          style={{ color: activePalette.primaryHex }}
                        >
                          KNOWRA AI Pedagogical Resolution
                        </h4>
                        <div
                          className={`p-4 rounded-2xl border ${
                            isDark
                              ? 'bg-slate-900/60 border-slate-800'
                              : 'bg-white border-slate-200 shadow-2xs'
                          }`}
                        >
                          <MarkdownRenderer content={doubt.aiAnswer} />
                        </div>
                      </div>
                    ) : isFailed ? (
                      <div
                        className={`p-4 rounded-xl border space-y-2 ${
                          isDark
                            ? 'bg-rose-950/30 border-rose-900/60 text-rose-300'
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                      >
                        <p className="text-xs font-semibold">
                          AI analysis was not completed for this question.
                        </p>
                        <p className="text-xs opacity-90">
                          Click the "Retry AI" button above to run diagnostic analysis on this question.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Doubt is currently queued for AI analysis.
                      </p>
                    )}

                    {doubt.detectedGaps && doubt.detectedGaps.length > 0 && (
                      <div className="pt-2 text-xs text-slate-400">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          Diagnosed Prerequisite Gap IDs:
                        </span>{' '}
                        {doubt.detectedGaps.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
