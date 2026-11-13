import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export function StatusBadge({ status, className = '' }) {
  const norm = (status || 'pending').toLowerCase();

  if (norm === 'answered') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        AI Resolved
      </span>
    );
  }

  if (norm === 'failed') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        Analysis Failed
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 ${className}`}>
      <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
      Pending AI
    </span>
  );
}

