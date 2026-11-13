export function SeverityBadge({ severity, className = '' }) {
  const norm = (severity || 'medium').toLowerCase();
  
  if (norm === 'high') {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 animate-pulse" />
        High Priority Gap
      </span>
    );
  }
  
  if (norm === 'medium') {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5" />
        Medium Gap
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5" />
      Low Priority
    </span>
  );
}

