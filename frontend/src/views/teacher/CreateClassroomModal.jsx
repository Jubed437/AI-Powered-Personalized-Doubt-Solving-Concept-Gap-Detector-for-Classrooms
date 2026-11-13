import { useState } from 'react';
import { classroomApi } from '../../api/classroomApi';
import { useToast } from '../../components/ui/Toast';
import { Plus, X, BookOpen } from 'lucide-react';

export function CreateClassroomModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) {
      addToast('Name and subject are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await classroomApi.createClassroom({
        name: name.trim(),
        subject: subject.trim(),
      });

      if (res.success && res.data) {
        addToast(`Classroom "${res.data.name}" created with Join Code: ${res.data.joinCode}!`, 'success', 6000);
        setName('');
        setSubject('');
        onCreated(res.data);
        onClose();
      }
    } catch (err) {
      addToast(err.message || 'Failed to create classroom', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
            <Plus className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Create New Classroom</h3>
          <p className="text-xs text-slate-400 mt-1">
            Create a course section to receive student doubts and track classroom concept gaps.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Classroom / Course Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Data Structures & Algorithms - Section A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Subject
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Science"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              {loading ? 'Creating...' : 'Create Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

