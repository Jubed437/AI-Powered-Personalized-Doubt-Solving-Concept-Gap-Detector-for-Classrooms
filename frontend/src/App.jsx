import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking...');
  const [doubts, setDoubts] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [subject, setSubject] = useState('');
  const [doubtText, setDoubtText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [studentId, setStudentId] = useState('');
  const [practiceSession, setPracticeSession] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [practiceFeedback, setPracticeFeedback] = useState(null);
  const [practiceError, setPracticeError] = useState('');
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [mastery, setMastery] = useState([]);
  const [conceptGraph, setConceptGraph] = useState(null);

  useEffect(() => {
    // Check backend health
    fetch(`${API_BASE}/api/health`)
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status === 'ok' ? 'Connected (Online)' : 'Unexpected response'))
      .catch(() => setBackendStatus('Offline / Cannot connect to /api/health'));

    // Fetch sample doubts
    fetch(`${API_BASE}/api/doubts`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDoubts(data.data);
        }
      })
      .catch((err) => console.error('Failed to fetch doubts', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentName || !doubtText) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch(`${API_BASE}/api/doubts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          subject,
          doubt: doubtText,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'The doubt could not be analyzed.');
      }

      setDoubts((prev) => [data.data, ...prev]);
      setDoubtText('');
      setStudentName('');
      setSubject('');
    } catch (err) {
      setSubmitError(err.message || 'The doubt could not be analyzed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const startPractice = async (e) => {
    e.preventDefault();
    setPracticeLoading(true);
    setPracticeError('');
    setPracticeFeedback(null);
    setSelectedAnswer('');

    try {
      const response = await fetch(`${API_BASE}/api/practice/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          displayName: studentName || studentId,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not start practice.');
      }
      setPracticeSession(data.data);
      setMastery(data.data.mastery || []);

      const graphResponse = await fetch(
        `${API_BASE}/api/concepts/graph?studentId=${encodeURIComponent(studentId)}`,
      );
      const graphData = await graphResponse.json();
      if (!graphResponse.ok || !graphData.success) {
        throw new Error(graphData.message || 'Practice started, but the concept graph could not be loaded.');
      }
      setConceptGraph(graphData.data);
    } catch (err) {
      setPracticeError(err.message || 'Could not start practice.');
    } finally {
      setPracticeLoading(false);
    }
  };

  const submitAttempt = async (e) => {
    e.preventDefault();
    if (!practiceSession?.question || !selectedAnswer) return;

    setPracticeLoading(true);
    setPracticeError('');
    try {
      const response = await fetch(
        `${API_BASE}/api/practice/sessions/${practiceSession.sessionId}/attempts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            questionId: practiceSession.question.id,
            answerOptionId: selectedAnswer,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not submit your answer.');
      }

      setPracticeFeedback(data.data);
      setPracticeSession((current) => ({
        ...current,
        question: data.data.nextQuestion,
        status: data.data.sessionStatus,
      }));
      setSelectedAnswer('');

      const masteryResponse = await fetch(`${API_BASE}/api/students/${encodeURIComponent(studentId)}/mastery`);
      const masteryData = await masteryResponse.json();
      if (!masteryResponse.ok || !masteryData.success) {
        throw new Error(masteryData.message || 'Attempt saved, but mastery could not be refreshed.');
      }
      setMastery(masteryData.data);
      setConceptGraph((current) => current
        ? { ...current, concepts: masteryData.data }
        : current);
    } catch (err) {
      setPracticeError(err.message || 'Could not submit your answer.');
    } finally {
      setPracticeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-0 z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎓</span>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                ConceptGap AI
              </h1>
              <p className="text-xs text-slate-400">Classroom Doubt Solving & Gap Detection</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                backendStatus.includes('Connected') ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300 font-medium">Backend: {backendStatus}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <section className="order-1 lg:col-span-1 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/60 shadow-xl backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-slate-100 mb-2">Submit Student Doubt</h2>
          <p className="text-sm text-slate-400 mb-6">
            Log student doubts to trigger automatic concept gap detection.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Student Name
              </label>
              <input
                type="text"
                placeholder="e.g. Maya Patel"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Subject & Topic
              </label>
              <input
                type="text"
                placeholder="e.g. Physics - Optics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Doubt Description
              </label>
              <textarea
                rows="4"
                placeholder="Describe the doubt or question..."
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors shadow-md shadow-indigo-600/20"
            >
              {submitting ? 'Analyzing Doubt...' : 'Submit & Detect Gaps'}
            </button>
            {submitError && (
              <p role="alert" className="text-sm text-rose-300">
                {submitError}
              </p>
            )}
          </form>
        </section>

        <section className="order-3 lg:col-span-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-700/60 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Adaptive practice &amp; concept mastery</h2>
            <p className="text-sm text-slate-400 mt-1">
              Practice starts with foundational concepts and adapts using your quiz attempts.
            </p>
          </div>

          <form onSubmit={startPractice} className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1">
              <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Student ID
              </span>
              <input
                type="text"
                placeholder="e.g. maya-01"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={practiceSession?.status === 'active'}
                required
                minLength={3}
                maxLength={64}
                pattern="[A-Za-z0-9._-]+"
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            <button
              type="submit"
              disabled={practiceLoading || practiceSession?.status === 'active'}
              className="self-end py-2.5 px-4 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white font-medium rounded-lg text-sm"
            >
              {practiceLoading
                ? 'Loading...'
                : practiceSession?.status === 'active'
                  ? 'Session in progress'
                  : 'Start adaptive practice'}
            </button>
          </form>

          {practiceError && <p role="alert" className="text-sm text-rose-300">{practiceError}</p>}

          {practiceFeedback && (
            <div className={`p-3 rounded-lg border ${practiceFeedback.correct ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200' : 'bg-amber-950/50 border-amber-800 text-amber-200'}`}>
              <p className="font-semibold">{practiceFeedback.correct ? 'Correct!' : 'Not quite.'}</p>
              <p className="text-sm mt-1">{practiceFeedback.feedback}</p>
              <p className="text-xs mt-1">
                {practiceFeedback.concept.name} mastery: {Math.round(practiceFeedback.mastery.masteryScore * 100)}%
              </p>
            </div>
          )}

          {practiceSession?.question && (
            <form onSubmit={submitAttempt} className="max-w-3xl p-4 bg-slate-900/70 rounded-xl border border-slate-700 space-y-4">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-indigo-950 text-indigo-200 px-2.5 py-1 rounded-full border border-indigo-800">
                  {practiceSession.question.conceptName}
                </span>
                <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                  Difficulty {practiceSession.question.difficulty}/3
                </span>
              </div>
              <p className="font-medium text-slate-100">{practiceSession.question.prompt}</p>
              <div className="space-y-2">
                {practiceSession.question.options.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 cursor-pointer text-sm text-slate-200">
                    <input
                      type="radio"
                      name="practice-answer"
                      value={option.id}
                      checked={selectedAnswer === option.id}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                    />
                    {option.text}
                  </label>
                ))}
              </div>
              <button
                type="submit"
                disabled={!selectedAnswer || practiceLoading}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
              >
                Submit answer
              </button>
            </form>
          )}

          {practiceSession?.status === 'completed' && (
            <p className="text-sm text-cyan-200">Question bank completed for this practice session. Start another session to continue.</p>
          )}

          {mastery.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {mastery.map((item) => (
                <div key={item.conceptId} className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                  <div className="flex justify-between gap-2 text-xs">
                    <span className="text-slate-200">{item.name || item.conceptId}</span>
                    <span className={
                      item.label === 'mastered'
                        ? 'text-emerald-300'
                        : item.label === 'needs_review'
                          ? 'text-amber-300'
                          : 'text-slate-400'
                    }>
                      {item.label === 'not_assessed'
                        ? 'Not assessed'
                        : `${Math.round(item.masteryScore * 100)}% · ${item.label.replace('_', ' ')}`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500"
                      style={{ width: `${Math.round(item.masteryScore * 100)}%` }}
                    />
                  </div>
                  {conceptGraph && (
                    <p className="mt-2 text-[11px] text-slate-500">
                      Prerequisites:{' '}
                      {conceptGraph.prerequisites
                        .filter((edge) => edge.conceptId === item.conceptId)
                        .map((edge) => (
                          conceptGraph.concepts.find((concept) => concept.conceptId === edge.prerequisiteId)?.name
                            || edge.prerequisiteId
                        ))
                        .join(', ') || 'None'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Live Feed / Detected Gaps */}
        <section className="order-2 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Doubt Stream & Concept Gaps</h2>
            <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-md border border-slate-700">
              {doubts.length} recorded
            </span>
          </div>

          <div className="space-y-3">
            {doubts.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-slate-800/40 rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-200">{item.studentName}</span>
                    <span className="text-xs text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded">
                      {item.subject}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      item.status === 'Resolved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="text-sm text-slate-300">"{item.doubt}"</p>

                {item.detectedGap && (
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">Prerequisites to review:</span>
                    <span className="text-slate-300">{item.detectedGap}</span>
                  </div>
                )}

                {item.concepts?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.concepts.map((concept) => (
                      <span
                        key={concept.conceptId}
                        className="text-xs bg-indigo-950 text-indigo-200 px-2.5 py-1 rounded-full border border-indigo-800"
                      >
                        {concept.name} ({Math.round(concept.confidence * 100)}%)
                      </span>
                    ))}
                  </div>
                )}

                {item.explanation && (
                  <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-2">
                    <h3 className="text-sm font-semibold text-cyan-300">AI explanation</h3>
                    <p className="text-sm text-slate-200">{item.explanation.summary}</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
                      {item.explanation.steps.map((step, index) => (
                        <li key={`${item.id}-step-${index}`}>{step}</li>
                      ))}
                    </ol>
                    {item.explanation.checkForUnderstanding && (
                      <p className="text-xs text-slate-400">
                        Check your understanding: {item.explanation.checkForUnderstanding}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {doubts.length === 0 && (
              <div className="text-center py-12 text-slate-500 bg-slate-800/20 rounded-xl border border-slate-800 border-dashed">
                No doubts recorded yet. Submit your first doubt using the form.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        Decoupled Architecture: Frontend (React + Vite + Tailwind CSS) &amp; Backend (Node.js + Express)
      </footer>
    </div>
  );
}

export default App;
