import { useState, useEffect, useCallback } from 'react';
import { classroomApi } from '../../api/classroomApi';
import { gapsApi } from '../../api/gapsApi';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/ui/Toast';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Sparkles,
  BarChart3,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';

export function ClassroomGapsView({ initialClassroomId }) {
  const { isDark, activePalette } = useTheme();
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState(initialClassroomId || '');
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();

  useEffect(() => {
    async function loadClassrooms() {
      try {
        const res = await classroomApi.getClassrooms();
        if (res.success && res.data) {
          setClassrooms(res.data);
          if (!selectedClassroomId && res.data.length > 0) {
            setSelectedClassroomId(res.data[0]._id);
          }
        }
      } catch (err) {
        addToast(err.message || 'Failed to load classrooms', 'error');
      }
    }

    loadClassrooms();
  }, [addToast, selectedClassroomId]);

  const fetchClassroomGaps = useCallback(async () => {
    if (!selectedClassroomId) return;
    setLoading(true);
    try {
      const res = await gapsApi.getClassroomGaps(selectedClassroomId);
      if (res.success && res.data) {
        setGaps(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load classroom gaps', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedClassroomId, addToast]);

  useEffect(() => {
    if (selectedClassroomId) {
      fetchClassroomGaps();
    }
  }, [selectedClassroomId, fetchClassroomGaps]);

  const selectedClass = classrooms.find((c) => c._id === selectedClassroomId);
  const totalGapsCount = gaps.reduce((acc, g) => acc + g.totalOccurrences, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Classroom Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300'
                : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            <BarChart3
              className="w-3.5 h-3.5"
              style={{ color: activePalette.primaryHex }}
            />
            <span>Curriculum Diagnostic Intelligence</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Classroom Concept Gap Analytics
          </h1>
          <p
            className={`text-sm mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Aggregated prerequisite weaknesses ranked by student frequency to guide targeted classroom interventions.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {classrooms.length > 0 && (
            <select
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 cursor-pointer transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
              }`}
            >
              {classrooms.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.subject})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={fetchClassroomGaps}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Classroom Context Banner */}
      {selectedClass && (
        <div
          className={`p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
            isDark
              ? 'bg-slate-900/60 border-slate-800'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">Selected Classroom</div>
            <div
              className={`text-lg font-bold mt-0.5 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {selectedClass.name}
            </div>
            <div className="text-xs text-slate-400">
              Subject: {selectedClass.subject} • Join Code:{' '}
              <code
                className="font-mono font-bold"
                style={{ color: activePalette.primaryHex }}
              >
                {selectedClass.joinCode}
              </code>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <div>
              <div className="text-slate-400">Enrolled Students</div>
              <div
                className={`text-base font-black mt-0.5 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {selectedClass.students?.length || 0}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Identified Gaps</div>
              <div className="text-base font-black text-rose-500 mt-0.5">
                {gaps.length}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Total Occurrences</div>
              <div
                className="text-base font-black mt-0.5"
                style={{ color: activePalette.primaryHex }}
              >
                {totalGapsCount}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concept Gaps Breakdown */}
      {loading ? (
        <div
          className={`p-12 text-center text-xs rounded-2xl border ${
            isDark
              ? 'bg-slate-900/30 border-slate-800 text-slate-400'
              : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          Aggregating student doubts and calculating concept gap frequencies...
        </div>
      ) : gaps.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No concept gaps recorded yet for this classroom"
          description="As students ask questions in this classroom, KNOWRA AI diagnoses missing prerequisite concepts and ranks them here in real time."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Ranked Prerequisite Bottlenecks
            </h2>
            <span className="text-xs text-slate-400">
              Ranked by total student doubt occurrences
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {gaps.map((gap, index) => {
              const maxOccurrences = gaps[0]?.totalOccurrences || 1;
              const percent = Math.min(100, Math.round((gap.totalOccurrences / maxOccurrences) * 100));

              return (
                <div
                  key={gap.concept || index}
                  className={`border p-6 rounded-3xl space-y-4 transition-all shadow-xs ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm ${
                          isDark
                            ? 'bg-slate-950 border-slate-800'
                            : 'bg-slate-100 border-slate-200'
                        }`}
                        style={{ color: activePalette.primaryHex }}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-bold ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {gap.concept}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Identified as a critical prerequisite across student doubts
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <SeverityBadge severity={gap.severity} />
                      <div className="text-right">
                        <div
                          className="text-xs font-bold"
                          style={{ color: activePalette.primaryHex }}
                        >
                          {gap.totalOccurrences} doubt occurrence{gap.totalOccurrences > 1 ? 's' : ''}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Affecting {gap.studentCount} student{gap.studentCount > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Relative frequency progress bar */}
                  <div className="space-y-1">
                    <div
                      className={`w-full h-2 rounded-full overflow-hidden border ${
                        isDark
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          gap.severity === 'high'
                            ? 'bg-rose-500'
                            : gap.severity === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-cyan-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Instructor Actionable Recommendation */}
                  <div
                    className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-800/80'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span
                        className={`font-bold ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                      >
                        Targeted Teaching Recommendation:
                      </span>{' '}
                      <span
                        className={
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }
                      >
                        {gap.severity === 'high'
                          ? `Students are repeatedly getting blocked by "${gap.concept}". Dedicate the first 10-15 minutes of your next class session or assign a short diagnostic quiz focused explicitly on this topic.`
                          : `Reinforce "${gap.concept}" in upcoming problem sets to ensure student foundation does not erode as coursework complexity increases.`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
