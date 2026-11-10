import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking...');
  const [doubts, setDoubts] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [subject, setSubject] = useState('');
  const [doubtText, setDoubtText] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      if (data.success) {
        setDoubts((prev) => [data.data, ...prev]);
        setDoubtText('');
        setStudentName('');
        setSubject('');
      }
    } catch (err) {
      console.error('Error posting doubt:', err);
    } finally {
      setSubmitting(false);
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
        <section className="lg:col-span-1 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/60 shadow-xl backdrop-blur-sm">
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
          </form>
        </section>

        {/* Right Column: Live Feed / Detected Gaps */}
        <section className="lg:col-span-2 space-y-4">
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
                    <span className="text-amber-400 font-bold">💡 Detected Gap:</span>
                    <span className="text-slate-300">{item.detectedGap}</span>
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
