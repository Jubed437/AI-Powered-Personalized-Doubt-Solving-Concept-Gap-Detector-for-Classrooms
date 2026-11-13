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
  Search,
} from 'lucide-react';

export function TeacherDoubtsView() {
  const { isDark, activePalette } = useTheme();
  const [doubts, setDoubts] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const { addToast } = useToast();

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

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await doubtsApi.getDoubts({
        classroomId: selectedClassroomId || undefined,
        status: statusFilter || undefined,
        limit: 50,
      });

      if (res.success && res.data) {
        setDoubts(res.data.doubts || []);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load classroom doubts', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedClassroomId, statusFilter, addToast]);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

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
            <span>Classroom Doubt Feed</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Classroom Doubts Stream
          </h1>
          <p
            className={`text-sm mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Monitor questions submitted by your students and inspect the AI pedagogical responses and detected gaps.
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
            value={selectedClassroomId}
            onChange={(e) => setSelectedClassroomId(e.target.value)}
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
          Loading classroom doubts...
        </div>
      ) : filteredDoubts.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No student doubts found"
          description={
            doubts.length === 0
              ? 'No doubts have been asked in your classrooms yet. Share your classroom Join Code with students so they can ask questions.'
              : 'Try clearing the search query or classroom filters.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredDoubts.map((doubt) => {
            const isExpanded = expandedId === doubt._id;

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
                          AI Pedagogical Explanation Provided to Student:
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
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Doubt analysis status: {doubt.status}
                      </p>
                    )}

                    <div
                      className={`flex items-center justify-between text-xs pt-2 border-t text-slate-400 ${
                        isDark ? 'border-slate-800/60' : 'border-slate-200'
                      }`}
                    >
                      <div>
                        <span className="font-medium">Student ID:</span>{' '}
                        <code
                          className={`font-mono ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {doubt.student}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium">Classroom ID:</span>{' '}
                        <code
                          className={`font-mono ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {doubt.classroom}
                        </code>
                      </div>
                    </div>
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
