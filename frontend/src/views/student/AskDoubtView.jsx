import { useState, useEffect } from 'react';
import { classroomApi } from '../../api/classroomApi';
import { doubtsApi } from '../../api/doubtsApi';
import { useToast } from '../../components/ui/Toast';
import { MarkdownRenderer } from '../../components/common/MarkdownRenderer';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import {
  HelpCircle,
  Sparkles,
  Send,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const TOPIC_PRESETS = [
  { topic: 'Binary Search', subject: 'Computer Science', hint: 'Why can midpoint arithmetic overflow?' },
  { topic: 'Linked Lists', subject: 'Computer Science', hint: 'How do you detect cycles without extra memory?' },
  { topic: 'Recursion', subject: 'Computer Science', hint: 'Why does missing a base case cause StackOverflow?' },
  { topic: 'Trees & BST', subject: 'Computer Science', hint: 'Why is BST lookup worst case O(n)?' },
  { topic: 'Dynamic Programming', subject: 'Computer Science', hint: 'How do I identify overlapping subproblems?' },
];

export function AskDoubtView({ onNavigate }) {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [doubtText, setDoubtText] = useState('');
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    async function fetchClasses() {
      setLoadingClassrooms(true);
      try {
        const res = await classroomApi.getClassrooms();
        if (res.success && res.data) {
          setClassrooms(res.data);
          if (res.data.length > 0) {
            setSelectedClassroomId(res.data[0]._id);
            setSubject(res.data[0].subject || 'Computer Science');
          }
        }
      } catch (err) {
        addToast(err.message || 'Failed to load joined classrooms', 'error');
      } finally {
        setLoadingClassrooms(false);
      }
    }

    fetchClasses();
  }, [addToast]);

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassroomId(classId);
    const cls = classrooms.find((c) => c._id === classId);
    if (cls) {
      setSubject(cls.subject || 'Computer Science');
    }
  };

  const applyPreset = (preset) => {
    setTopic(preset.topic);
    setSubject(preset.subject);
    setDoubtText(preset.hint);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassroomId) {
      addToast('Please select or join a classroom first', 'error');
      return;
    }
    if (!topic.trim()) {
      addToast('Topic is required', 'error');
      return;
    }
    if (!doubtText.trim()) {
      addToast('Please enter your question', 'error');
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const res = await doubtsApi.createDoubt({
        classroomId: selectedClassroomId,
        subject: subject || 'Computer Science',
        topic: topic.trim(),
        text: doubtText.trim(),
      });

      if (res.success && res.data) {
        setResult(res.data);
        addToast('Doubt submitted and analyzed by KNOWRA AI!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Doubt submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Diagnostic Doubt Submission</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Ask a Question
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          KNOWRA answers your doubt and diagnoses which foundational prerequisite concepts need review.
        </p>
      </div>

      {/* Classroom requirement alert if no classes */}
      {!loadingClassrooms && classrooms.length === 0 && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-2xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-semibold text-amber-200">You haven't joined any classrooms yet</h4>
              <p className="text-amber-300/80 text-xs mt-0.5">
                Doubts belong to a classroom so teachers can see aggregate gap analytics. Ask your teacher for a 6-character Join Code.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('classrooms')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-all"
          >
            Join a Class
          </button>
        </div>
      )}

      {/* Main Doubt Form Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Classroom Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Classroom &amp; Course
            </label>
            {loadingClassrooms ? (
              <div className="text-xs text-slate-500">Loading your classrooms...</div>
            ) : classrooms.length > 0 ? (
              <select
                value={selectedClassroomId}
                onChange={handleClassChange}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 cursor-pointer"
              >
                {classrooms.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.subject})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-rose-300">
                Please join a classroom first from the Classrooms tab.
              </p>
            )}
          </div>

          {/* Subject & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Topic
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Binary Search"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Quick topic presets */}
          <div>
            <span className="block text-[11px] font-medium text-slate-400 mb-2">
              Common DSA Topics (Click to quick-fill):
            </span>
            <div className="flex flex-wrap gap-2">
              {TOPIC_PRESETS.map((p) => (
                <button
                  key={p.topic}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
                >
                  {p.topic}
                </button>
              ))}
            </div>
          </div>

          {/* Doubt Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Detailed Doubt or Question
              </label>
              <span className="text-[11px] text-slate-500">
                {doubtText.length}/2000 characters
              </span>
            </div>
            <textarea
              rows={5}
              required
              maxLength={2000}
              value={doubtText}
              onChange={(e) => setDoubtText(e.target.value)}
              placeholder="Explain what concept you are struggling with or describe the specific error or confusion..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 leading-relaxed resize-y"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting || classrooms.length === 0}
            className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>KNOWRA AI is diagnosing your doubt &amp; prerequisite gaps...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit Doubt &amp; Detect Concept Gaps</span>
                <Send className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Live Result display */}
        {result && (
          <div className="pt-6 border-t border-slate-800 animate-in slide-in-from-bottom-4 duration-300 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">AI Diagnosis &amp; Resolution</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                Analysis Complete
              </span>
            </div>

            {/* AI Explanation block */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <MarkdownRenderer content={result.aiAnswer} />
            </div>

            {/* Detected Gaps highlight */}
            {result.detectedGaps && result.detectedGaps.length > 0 && (
              <div className="p-5 bg-rose-950/20 border border-rose-900/50 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-rose-300 text-sm font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Prerequisite Concept Gaps Identified by KNOWRA AI</span>
                </div>
                <p className="text-xs text-slate-300">
                  KNOWRA diagnosed that this doubt stems from gaps in the foundational concepts below. Reviewing them will prevent compounding confusion.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <SeverityBadge severity="high" />
                  <SeverityBadge severity="medium" />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setDoubtText('');
                  setTopic('');
                  setResult(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-all"
              >
                Ask Another Doubt
              </button>
              <button
                onClick={() => onNavigate('history')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-all inline-flex items-center gap-1.5"
              >
                <span>View Doubt in History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

