import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  ArrowRight,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

export function TeacherDashboard({ onNavigate, onSelectClassroomForGaps }) {
  const { user } = useAuth();
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/90 via-slate-900/90 to-purple-950/70 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instructor Diagnostic &amp; Intervention Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name || 'Instructor'} 👋
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Monitor conceptual learning bottlenecks in real time. KNOWRA aggregates individual doubt diagnoses into actionable classroom concept gap intelligence.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Classroom</span>
            </button>
            <button
              onClick={() => onNavigate('gaps')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium text-xs sm:text-sm transition-all"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>View Classroom Gap Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Classrooms</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {loading ? '...' : classrooms.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Course sections managed</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {loading ? '...' : totalStudents}
          </div>
          <p className="text-[11px] text-cyan-400/80 mt-1">Total active learners</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Classroom Doubts</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {loading ? '...' : doubts.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Logged student queries</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Intervention Trigger</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">Active</div>
          <p className="text-[11px] text-rose-400/80 mt-1">Aggregating prerequisite gaps</p>
        </div>
      </div>

      {/* Classrooms Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">Managed Classrooms</h2>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Classroom</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800">
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all"
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
                  className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 p-6 rounded-3xl space-y-4 transition-all shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-0.5 rounded-lg">
                        {c.subject}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.students?.length || 0} students</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 leading-snug">
                      {c.name}
                    </h3>
                  </div>

                  {/* Join code box with 1-click copy */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">
                          Student Join Code
                        </div>
                        <div className="font-mono font-bold text-base text-cyan-300 tracking-wider">
                          {c.joinCode}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(c.joinCode)}
                        title="Copy Join Code"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
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
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
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

