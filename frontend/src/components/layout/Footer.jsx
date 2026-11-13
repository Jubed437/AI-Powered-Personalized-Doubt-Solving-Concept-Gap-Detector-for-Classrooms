import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/70 py-6 px-4 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-slate-400">KNOWRA</span> — Understand. Discover. Master.
          <span className="mx-2 text-slate-700">|</span>
          Decoupled AI Architecture (React + Express REST API)
        </div>
        <div className="flex items-center gap-4 text-xs">
          <a
            href="http://localhost:5001/api-docs/#/"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
          >
            <span>Swagger API Specification</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}

