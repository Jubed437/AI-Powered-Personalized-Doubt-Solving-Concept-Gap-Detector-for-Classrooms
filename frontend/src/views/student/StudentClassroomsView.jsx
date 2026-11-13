import { useState, useEffect } from 'react';
import { classroomApi } from '../../api/classroomApi';
import { useToast } from '../../components/ui/Toast';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Layers,
  Plus,
  Users,
  BookOpen,
  Calendar,
  Check,
  Sparkles,
} from 'lucide-react';

export function StudentClassroomsView() {
  const [classrooms, setClassrooms] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { addToast } = useToast();

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const res = await classroomApi.getClassrooms();
      if (res.success && res.data) {
        setClassrooms(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load classrooms', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setJoining(true);
    try {
      const res = await classroomApi.joinClassroom(joinCode.trim());
      if (res.success && res.data) {
        addToast(`Joined ${res.data.name}!`, 'success');
        setJoinCode('');
        setShowJoinModal(false);
        fetchClassrooms();
      }
    } catch (err) {
      addToast(err.message || 'Failed to join classroom', 'error');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Classroom Enrollments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Classrooms
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Classes you have joined with your teachers to ask doubts and track concept mastery.
          </p>
        </div>

        <button
          onClick={() => setShowJoinModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Join with Code</span>
        </button>
      </div>

      {/* Classrooms Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800">
          Loading your enrolled classrooms...
        </div>
      ) : classrooms.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No joined classrooms"
          description="You are not enrolled in any classrooms yet. Enter your teacher's 6-character Join Code to get started."
          action={
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all"
            >
              Enter Classroom Join Code
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classrooms.map((c) => (
            <div
              key={c._id}
              className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 p-6 rounded-3xl space-y-4 transition-all shadow-md group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-cyan-300">
                  Code: {c.joinCode}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {c.name}
                </h3>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  Subject: {c.subject}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.students?.length || 0} students enrolled</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join Classroom Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-5">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Join a Classroom</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter the 6-character alphanumeric code provided by your instructor.
              </p>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  6-Character Join Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. T7ENSB"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center font-mono text-lg tracking-widest uppercase text-cyan-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joining || joinCode.length < 6}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  {joining ? 'Joining...' : 'Join Classroom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

