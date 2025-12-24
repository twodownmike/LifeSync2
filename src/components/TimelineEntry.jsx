import React, { useState } from 'react';
import { ChevronDown, Trash2, Scale } from 'lucide-react';

export const TimelineEntry = ({ entry, onDelete, fastDuration }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative pl-8">
      {/* Dot */}
      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-zinc-950 
        ${entry.type === 'meal' ? 'bg-orange-400' : 
          entry.type === 'workout' ? 'bg-emerald-400' : 
          entry.type === 'work_session' ? 'bg-cyan-400' : 
          entry.type === 'breathwork' ? 'bg-sky-400' : 
          entry.type === 'weight' ? 'bg-blue-500' : 'bg-violet-400'}`} 
      />
      
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer group"
      >
        <div className="flex justify-between items-start">
           <div className="flex-1 pr-4">
             <div className="flex items-center gap-2 mb-1">
               <span className="text-xs font-mono text-zinc-500">
                 {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
               {entry.type === 'work_session' && (
                <span className="inline-block mb-2 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded border border-cyan-500/30">
                   {entry.duration} mins
                </span>
               )}
               {entry.type === 'breathwork' && (
                <span className="inline-block mb-2 px-2 py-0.5 bg-sky-500/20 text-sky-400 text-xs rounded border border-sky-500/30">
                   {entry.duration} mins
                </span>
               )}
               {fastDuration && (
                 <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                   {fastDuration} Fast
                 </span>
               )}
             </div>
             <h3 className="text-lg font-semibold text-zinc-200 group-hover:text-white transition-colors flex items-center gap-2">
                {entry.type === 'weight' && <Scale size={18} className="text-blue-500" />}
                {entry.title}
             </h3>
           </div>
           <div className={`text-zinc-600 transition-transform duration-300 mt-1 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown size={16} />
           </div>
        </div>

        {isExpanded && (
          <div className="mt-3 animate-fade-in border-l-2 border-zinc-800 pl-3 ml-1 mb-6">

             {/* Weight Specific Detail */}
             {entry.type === 'weight' && entry.weight && (
                 <div className="text-2xl font-mono font-bold text-blue-400 mb-3">
                    {entry.weight} <span className="text-sm text-zinc-500 font-sans">lbs</span>
                 </div>
             )}

             {/* Mood & Energy */}
             {(entry.mood || entry.energy) && (
                <div className="flex gap-4 mb-3 bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/50">
                   {entry.mood && (
                      <div className="flex items-center gap-2">
                         <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Mood</div>
                         <div className="text-sm font-bold text-violet-400">{entry.mood}<span className="text-zinc-600 text-[10px]">/10</span></div>
                      </div>
                   )}
                   {entry.energy && (
                      <div className="flex items-center gap-2">
                         <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Energy</div>
                         <div className="text-sm font-bold text-yellow-500">{entry.energy}<span className="text-zinc-600 text-[10px]">/10</span></div>
                      </div>
                   )}
                </div>
             )}

             {/* Exercises */}
             {entry.exercises && entry.exercises.length > 0 && (
                <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-3 space-y-2 mb-3">
                  {entry.exercises.map((ex, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-zinc-300 font-medium">{ex.name}</span>
                      <span className="text-zinc-500 font-mono text-xs">
                        {ex.weight ? `${ex.weight}lbs` : ''} 
                        {ex.weight && ex.reps ? ' x ' : ''}
                        {ex.reps ? `${ex.reps} reps` : ''}
                      </span>
                    </div>
                  ))}
                </div>
             )}

             {/* Notes */}
             {entry.note && <p className="text-zinc-400 text-sm whitespace-pre-wrap mb-3 italic">"{entry.note}"</p>}

             {/* Tags */}
             {entry.tags && entry.tags.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {entry.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-500">{tag}</span>
                  ))}
                </div>
             )}

             {/* Delete Button */}
             <button 
                onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 py-1 px-2 rounded hover:bg-red-500/10 transition-colors"
             >
               <Trash2 size={14} />
               Delete Log
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
