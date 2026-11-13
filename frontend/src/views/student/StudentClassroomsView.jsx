import { useState, useEffect } from 'react';
import { classroomApi } from '../../api/classroomApi';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/ui/Toast';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Layers,
  Plus,
  Users,
  BookOpen,
  Calendar,
  X,
} from 'lucide-react';

export function StudentClassroomsView() {
  const { isDark, activePalette } = useTheme();
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
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300'
                : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            <Layers
              className="w-3.5 h-3.5"
              style={{ color: activePalette.primaryHex }}
            />
            <span>Classroom Enrollments</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            My Classrooms
          </h1>
          <p
            className={`text-sm mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Classes you have joined with your teachers to ask doubts and track concept mastery.
          </p>
        </div>

        <button
          onClick={() => setShowJoinModal(true)}
          style={{ backgroundColor: activePalette.primaryHex }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Join with Code</span>
        </button>
      </div>

      {/* Classrooms Grid */}
      {loading ? (
        <div
          className={`p-12 text-center text-xs rounded-2xl border ${
            isDark
              ? 'bg-slate-900/30 border-slate-800 text-slate-400'
              : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
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
              style={{ backgroundColor: activePalette.primaryHex }}
              className="px-4 py-2 text-white rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
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
              className={`border p-6 rounded-3xl space-y-4 transition-all shadow-xs group ${
                isDark
                  ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="w-10 h-10 rounded-2xl border flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: `${activePalette.primaryHex}15`,
                    borderColor: `${activePalette.primaryHex}30`,
                    color: activePalette.primaryHex,
                  }}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-cyan-300'
                      : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  Code: {c.joinCode}
                </span>
              </div>

              <div>
                <h3
                  className={`text-lg font-bold transition-colors ${
                    isDark
                      ? 'text-slate-100 group-hover:text-indigo-300'
                      : 'text-slate-900'
                  }`}
                >
                  {c.name}
                </h3>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  Subject: {c.subject}
                </p>
              </div>

              <div
                className={`pt-3 border-t flex items-center justify-between text-xs text-slate-400 ${
                  isDark ? 'border-slate-800/80' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>{c.students?.length || 0} students enrolled</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`border p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-5 relative ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div
                className="w-10 h-10 rounded-2xl border flex items-center justify-center mb-3"
                style={{
                  backgroundColor: `${activePalette.primaryHex}15`,
                  borderColor: `${activePalette.primaryHex}30`,
                  color: activePalette.primaryHex,
                }}
              >
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Join a Classroom</h3>
              <p
                className={`text-xs mt-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Enter the 6-character alphanumeric code provided by your instructor.
              </p>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  6-Character Join Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. T7ENSB"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className={`w-full px-4 py-3 rounded-2xl text-center font-mono text-lg tracking-widest uppercase border focus:outline-none focus:ring-2 font-black transition-colors ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-cyan-300'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                  }`}
                  style={{ outlineColor: activePalette.primaryHex }}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joining || joinCode.length < 6}
                  style={{ backgroundColor: activePalette.primaryHex }}
                  className="px-5 py-2 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
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
