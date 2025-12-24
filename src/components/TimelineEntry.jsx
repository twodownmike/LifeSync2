import React, { useState } from 'react';
import { ChevronDown, Trash2, Scale, Dumbbell, Utensils, BookOpen, Wind, Brain } from 'lucide-react';

export const TimelineEntry = ({ entry, onDelete, fastDuration, isFirst }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch(entry.type) {
      case 'meal': return <Utensils size={14} />;
      case 'workout': return <Dumbbell size={14} />;
      case 'work_session': return <Brain size={14} />;
      case 'breathwork': return <Wind size={14} />;
      case 'weight': return <Scale size={14} />;
      default: return <BookOpen size={14} />;
    }
  };

  const getColor = (type) => {
    switch(type) {
        case 'meal': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
        case 'workout': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        case 'work_session': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
        case 'breathwork': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
        case 'weight': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        default: return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
    }
  };

  const baseColor = getColor(entry.type);

  return (
    <div className="relative pl-24 group">
      {/* Connector Line (Horizontal) */}
      <div className={`absolute left-8 top-8 w-16 h-px bg-zinc-800 group-hover:bg-zinc-700 transition-colors ${isFirst ? 'bg-zinc-700' : ''}`} />
      
      {/* Timeline Dot */}
      <div className={`absolute left-6 top-6 w-4 h-4 rounded-full border-[3px] border-zinc-950 z-10 transition-all duration-300
        ${baseColor.split(' ')[0].replace('text-', 'bg-')} 
        ${isFirst ? 'scale-125 shadow-[0_0_15px_currentColor]' : 'group-hover:scale-110'}
      `} />
      
      {/* Time Label (Left of line) */}
      <div className="absolute left-0 top-[26px] -translate-x-full pr-4 text-[10px] font-mono font-medium text-zinc-500 text-right w-16 hidden">
         {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>

      {/* Main Card */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
            relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer
            ${isExpanded ? 'bg-zinc-900 border-zinc-700 shadow-xl' : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700 hover:shadow-lg'}
        `}
      >
        {/* Card Header */}
        <div className="p-4 flex justify-between items-start gap-4">
           <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2 mb-1.5 flex-wrap">
               <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${baseColor}`}>
                 {getIcon()}
                 {entry.type.replace('_', ' ')}
               </span>
               <span className="text-[10px] font-mono text-zinc-500">
                 {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/^0/, '')}
               </span>
               
               {/* Context Badges */}
               {entry.duration && (
                <span className="text-[10px] font-bold text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900/50">
                   {entry.duration}m
                </span>
               )}
               {fastDuration && (
                 <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                   <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                   {fastDuration} Fast
                 </span>
               )}
             </div>
             
             <h3 className={`font-bold text-base truncate pr-2 ${isExpanded ? 'text-white' : 'text-zinc-200 group-hover:text-white'} transition-colors`}>
                {entry.title}
             </h3>
           </div>
           
           <div className={`text-zinc-600 transition-transform duration-300 mt-1 ${isExpanded ? 'rotate-180 text-zinc-400' : ''}`}>
              <ChevronDown size={16} />
           </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-0 animate-slide-up">
             {/* Divider */}
             <div className="h-px bg-zinc-800 mb-4" />

             <div className="space-y-4">
                {/* Weight Detail */}
                {entry.type === 'weight' && entry.weight && (
                    <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-mono font-bold text-white">{entry.weight}</span>
                       <span className="text-sm text-zinc-500 font-medium">lbs</span>
                    </div>
                )}

                {/* Mood & Energy Grid */}
                {(entry.mood || entry.energy) && (
                   <div className="grid grid-cols-2 gap-3">
                      {entry.mood && (
                         <div className="bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Mood</span>
                            <div className="flex items-center gap-1.5">
                               <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-violet-500" style={{width: `${entry.mood * 10}%`}} />
                               </div>
                               <span className="text-xs font-bold text-violet-400">{entry.mood}</span>
                            </div>
                         </div>
                      )}
                      {entry.energy && (
                         <div className="bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Energy</span>
                            <div className="flex items-center gap-1.5">
                               <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-yellow-500" style={{width: `${entry.energy * 10}%`}} />
                               </div>
                               <span className="text-xs font-bold text-yellow-500">{entry.energy}</span>
                            </div>
                         </div>
                      )}
                   </div>
                )}

                {/* Exercises List */}
                {entry.exercises && entry.exercises.length > 0 && (
                   <div className="space-y-2">
                     <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Session Log</div>
                     <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 divide-y divide-zinc-800/50 overflow-hidden">
                       {entry.exercises.map((ex, i) => (
                         <div key={i} className="flex justify-between items-center p-3 text-sm hover:bg-white/5 transition-colors">
                           <span className="text-zinc-200 font-medium">{ex.name}</span>
                           <span className="font-mono text-zinc-400 text-xs bg-black/40 px-2 py-1 rounded">
                             {ex.weight ? `${ex.weight}lb` : ''} 
                             {ex.weight && ex.reps ? ' × ' : ''}
                             {ex.reps ? `${ex.reps}` : ''}
                           </span>
                         </div>
                       ))}
                     </div>
                   </div>
                )}

                {/* Notes */}
                {entry.note && (
                   <div className="bg-zinc-950/30 p-3 rounded-xl border border-zinc-800/50 text-sm text-zinc-400 italic leading-relaxed">
                      "{entry.note}"
                   </div>
                )}

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                   <div className="flex flex-wrap gap-2">
                     {entry.tags.map((tag, i) => (
                       <span key={i} className="text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">#{tag}</span>
                     ))}
                   </div>
                )}

                {/* Actions */}
                <div className="flex justify-end pt-2">
                   <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 py-1.5 px-3 rounded-lg transition-all"
                   >
                     <Trash2 size={12} />
                     DELETE ENTRY
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
