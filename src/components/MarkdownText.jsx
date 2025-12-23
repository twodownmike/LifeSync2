import React from 'react';

export const MarkdownText = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-bold text-violet-300 mt-4 mb-1">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold text-white mt-5 mb-2">{line.replace('## ', '')}</h2>;
        }
        if (line.trim().startsWith('- ')) {
          const content = line.trim().substring(2);
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-violet-400">•</span>
              <span className="text-zinc-300">{parseBold(content)}</span>
            </div>
          )
        }
        if (line.trim() === '') return <div key={i} className="h-2"></div>;
        return <div key={i} className="text-zinc-300">{parseBold(line)}</div>;
      })}
    </div>
  );
};

const parseBold = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map((part, j) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};
