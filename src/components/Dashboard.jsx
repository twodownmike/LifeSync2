import React from 'react';
import { ListChecks, Plus, Activity, CheckCircle, Circle, Trash2, Clock } from 'lucide-react';
import { TimelineEntry } from './TimelineEntry';

export default function Dashboard({ 
  userSettings, 
  fastingData, 
  entries, 
  routines, 
  bioPhase, 
  onDeleteEntry, 
  onToggleRoutine, 
  onDeleteRoutine, 
  onOpenRoutineModal,
  onOpenGoalModal,
  onOpenInfoModal
}) {
  const todayIndex = new Date().getDay();
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysRoutines = routines.filter(r => r.days.includes(todayIndex));
  todaysRoutines.sort((a, b) => {
     const aDone = (a.completedDates || []).includes(todayStr);
     const bDone = (b.completedDates || []).includes(todayStr);
     if (aDone === bDone) return 0;
     return aDone ? 1 : -1;
  });

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Home</h2>
          <p className="text-zinc-400 text-sm mb-3">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${bioPhase.color}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider">{bioPhase.title}</span>
              <span className="w-1 h-1 rounded-full bg-current opacity-50"></span>
              <span className="text-[10px] opacity-90 font-medium">{bioPhase.desc}</span>
          </div>
        </div>
      </div>

      {/* Routine / Daily Checklist Section */}
      <div className="mb-8">
         <div className="flex justify-between items-center mb-3">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ListChecks size={18} className="text-zinc-400" />
                Daily Checklist
             </h3>
             <button onClick={onOpenRoutineModal} className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-700">
               <Plus size={16} />
             </button>
         </div>

         {todaysRoutines.length === 0 ? (
             <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-500 text-xs">No tasks for today.</p>
             </div>
         ) : (
             <div className="space-y-2">
                {todaysRoutines.map(routine => {
                   const isCompleted = (routine.completedDates || []).includes(todayStr);
                   const colors = {
                      diet: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
                      exercise: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
                      mindset: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                   };
                   
                   return (
                      <div 
                        key={routine.id}
                        onClick={() => onToggleRoutine(routine.id, isCompleted)}
                        className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group
                           ${isCompleted ? 'bg-zinc-900/30 border-zinc-800 opacity-60' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                      >
                          <div className={`${isCompleted ? 'text-zinc-600' : colors[routine.type].split(' ')[0]}`}>
                            {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                          </div>
                          
                          <div className="flex-1">
                             <div className={`text-sm font-medium ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                               {routine.title}
                             </div>
                          </div>

                          <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${colors[routine.type]}`}>
                             {routine.type}
                          </span>

                          <button 
                             onClick={(e) => { e.stopPropagation(); onDeleteRoutine(routine.id); }}
                             className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-red-400 transition-all"
                          >
                             <Trash2 size={14} />
                          </button>
                      </div>
                   )
                })}
             </div>
         )}
      </div>

      {/* Fast Timer Widget */}
      <div 
        onClick={onOpenGoalModal}
        className="mb-8 bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group cursor-pointer"
      >
         <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
         
         <div>
            <div className="flex items-center gap-2 mb-1">
               <Clock size={14} className="text-emerald-500" />
               <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Current Fast</span>
            </div>
            <div className="text-3xl font-bold text-white font-mono tracking-tight">
                {fastingData.hours}<span className="text-zinc-600 mx-0.5">:</span>{fastingData.minutes.toString().padStart(2, '0')}
            </div>
         </div>

         <div className="text-right relative z-10">
             <div className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                 fastingData.hours < 4 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                 fastingData.hours < 12 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                 fastingData.hours < 18 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                 'bg-violet-500/10 text-violet-400 border-violet-500/20'
             }`}>
                 {fastingData.label}
             </div>
             <div className="text-zinc-500 text-[10px] mt-1 font-medium">Goal: {userSettings.fastingGoal}h</div>
         </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-4">Timeline</h3>
      {entries.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <div className="inline-block p-4 rounded-full bg-zinc-900 mb-4">
            <Activity className="text-zinc-500" size={32} />
          </div>
          <p className="text-zinc-400">No activity yet. Tap + to start.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-zinc-800 ml-4 space-y-8">
          {entries.map((entry, index) => {
            let fastDuration = null;
            if (entry.type === 'meal') {
               const prevMeal = entries.slice(index + 1).find(e => e.type === 'meal');
               if (prevMeal) {
                  const diffMs = new Date(entry.timestamp) - new Date(prevMeal.timestamp);
                  const hours = Math.floor(diffMs / (1000 * 60 * 60));
                  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  fastDuration = `${hours}h ${minutes}m`;
               }
            }
            return <TimelineEntry key={entry.id} entry={entry} onDelete={onDeleteEntry} fastDuration={fastDuration} />;
          })}
        </div>
      )}
    </div>
  );
}
