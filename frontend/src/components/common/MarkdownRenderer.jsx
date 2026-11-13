import { useTheme } from '../../context/ThemeContext';

export function MarkdownRenderer({ content }) {
  const { isDark, activePalette } = useTheme();

  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBlockLines = [];

  const parseInline = (text) => {
    const parts = [];
    let key = 0;
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const token = match[0];
      if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={key++}
            className={`px-1.5 py-0.5 mx-0.5 rounded border font-mono text-xs font-semibold ${
              isDark
                ? 'bg-slate-900 border-slate-700/80 text-cyan-300'
                : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong
            key={key++}
            className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
          >
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em
            key={key++}
            className={`italic ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
          >
            {token.slice(1, -1)}
          </em>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className={`p-3.5 my-2.5 rounded-2xl border text-xs font-mono overflow-x-auto ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-cyan-300 shadow-inner'
                : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}
          >
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={i}
          className="text-base font-black mt-4 mb-2 flex items-center gap-2"
          style={{ color: activePalette.primaryHex }}
        >
          <span
            className="w-1.5 h-4 rounded-full inline-block"
            style={{ backgroundColor: activePalette.primaryHex }}
          />
          {parseInline(line.replace('### ', ''))}
        </h3>
      );
    } else if (line.startsWith('#### ')) {
      elements.push(
        <h4
          key={i}
          className={`text-sm font-bold mt-3 mb-1.5 ${
            isDark ? 'text-cyan-300' : 'text-slate-800'
          }`}
        >
          {parseInline(line.replace('#### ', ''))}
        </h4>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li
          key={i}
          className={`ml-5 list-disc text-sm my-1 leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {parseInline(line.substring(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li
          key={i}
          className={`ml-5 list-decimal text-sm my-1 leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {parseInline(line.replace(/^\d+\.\s/, ''))}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p
          key={i}
          className={`text-sm my-1.5 leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {parseInline(line)}
        </p>
      );
    }
  }

  return <div className="space-y-0.5">{elements}</div>;
}
