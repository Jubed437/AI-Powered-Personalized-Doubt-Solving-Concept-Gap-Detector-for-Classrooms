import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { classroomApi } from '../../api/classroomApi';
import { doubtsApi } from '../../api/doubtsApi';
import { useToast } from '../../components/ui/Toast';
import { CreateClassroomModal } from './CreateClassroomModal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Layers,
  Users,
  Plus,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

export function TeacherDashboard({ onNavigate, onSelectClassroomForGaps }) {
  const { user } = useAuth();
  const { isDark, activePalette } = useTheme();
  const [classrooms, setClassrooms] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [clsRes, dbtRes] = await Promise.allSettled([
        classroomApi.getClassrooms(),
        doubtsApi.getDoubts({ limit: 10 }),
      ]);

      if (clsRes.status === 'fulfilled' && clsRes.value.success) {
        setClassrooms(clsRes.value.data || []);
      }
      if (dbtRes.status === 'fulfilled' && dbtRes.value.success) {
        setDoubts(dbtRes.value.data?.doubts || []);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load teacher dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Copied Join Code ${code} to clipboard! Share with your students.`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const totalStudents = classrooms.reduce(
    (acc, c) => acc + (c.students?.length || 0),
    0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
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
            <span>Instructor Diagnostic &amp; Intervention Command Center</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Welcome, {user?.name || 'Instructor'} 👋
          </h1>
          <p
            className={`mt-2 text-sm leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Monitor conceptual learning bottlenecks in real time. KNOWRA aggregates individual doubt diagnoses into actionable classroom concept gap intelligence.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              style={{ backgroundColor: activePalette.primaryHex }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Classroom</span>
            </button>
            <button
              onClick={() => onNavigate('gaps')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                isDark
                  ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
              }`}
            >
              <BarChart3
                className="w-4 h-4"
                style={{ color: activePalette.primaryHex }}
              />
              <span>View Classroom Gap Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`border p-5 rounded-3xl transition-all ${
            isDark
              ? 'bg-slate-900/60 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Active Classrooms</span>
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
          <p className="text-[11px] text-slate-400 mt-1">Course sections managed</p>
        </div>

        <div
          className={`border p-5 rounded-3xl transition-all ${
            isDark
              ? 'bg-slate-900/60 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Enrolled Students</span>
            <Users
              className="w-4 h-4"
              style={{ color: activePalette.primaryHex }}
            />
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {loading ? '...' : totalStudents}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total active learners</p>
        </div>

        <div
          className={`border p-5 rounded-3xl transition-all ${
            isDark
              ? 'bg-slate-900/60 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Classroom Doubts</span>
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
          <p className="text-[11px] text-slate-400 mt-1">Logged student queries</p>
        </div>

        <div
          className={`border p-5 rounded-3xl transition-all ${
            isDark
              ? 'bg-slate-900/60 border-slate-800/80'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Intervention Trigger</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-500 mt-2">Active</div>
          <p className="text-[11px] text-rose-500/80 font-medium mt-1">
            Aggregating prerequisite gaps
          </p>
        </div>
      </div>

      {/* Classrooms Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers
              className="w-5 h-5"
              style={{ color: activePalette.primaryHex }}
            />
            <h2
              className={`text-lg font-bold ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              Managed Classrooms
            </h2>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold inline-flex items-center gap-1.5 transition-colors hover:underline cursor-pointer"
            style={{ color: activePalette.primaryHex }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Classroom</span>
          </button>
        </div>

        {loading ? (
          <div
            className={`p-12 text-center text-xs rounded-2xl border ${
              isDark
                ? 'bg-slate-900/30 border-slate-800 text-slate-400'
                : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            Loading managed classrooms...
          </div>
        ) : classrooms.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No classrooms created yet"
            description="Create your first classroom section to receive student questions and track concept gap analytics."
            action={
              <button
                onClick={() => setIsModalOpen(true)}
                style={{ backgroundColor: activePalette.primaryHex }}
                className="px-4 py-2 text-white rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
              >
                Create First Classroom
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classrooms.map((c) => {
              const isCopied = copiedCode === c.joinCode;
              return (
                <div
                  key={c._id}
                  className={`border p-6 rounded-3xl space-y-4 transition-all shadow-xs flex flex-col justify-between group ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-lg border"
                        style={{
                          backgroundColor: `${activePalette.primaryHex}15`,
                          borderColor: `${activePalette.primaryHex}30`,
                          color: activePalette.primaryHex,
                        }}
                      >
                        {c.subject}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <Users className="w-3.5 h-3.5" />
                        <span>{c.students?.length || 0} students</span>
                      </div>
                    </div>

                    <h3
                      className={`text-lg font-bold leading-snug ${
                        isDark ? 'text-slate-100' : 'text-slate-900'
                      }`}
                    >
                      {c.name}
                    </h3>
                  </div>

                  {/* Join code box with 1-click copy */}
                  <div
                    className={`pt-3 border-t space-y-3 ${
                      isDark ? 'border-slate-800/80' : 'border-slate-100'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between p-2.5 rounded-2xl border ${
                        isDark
                          ? 'bg-slate-950/80 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          Student Join Code
                        </div>
                        <div
                          className="font-mono font-black text-base tracking-wider"
                          style={{ color: activePalette.primaryHex }}
                        >
                          {c.joinCode}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(c.joinCode)}
                        title="Copy Join Code"
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          isDark
                            ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        onSelectClassroomForGaps(c._id);
                        onNavigate('gaps');
                      }}
                      style={{
                        backgroundColor: `${activePalette.primaryHex}15`,
                        borderColor: `${activePalette.primaryHex}30`,
                        color: activePalette.primaryHex,
                      }}
                      className="w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>View Concept Gap Analytics →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateClassroomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(newClass) => {
          setClassrooms((prev) => [newClass, ...prev]);
        }}
      />
    </div>
  );
}
