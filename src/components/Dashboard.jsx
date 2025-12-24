import React, { useState, useMemo } from 'react';
import { ListChecks, Plus, Activity, CheckCircle, Circle, Trash2, Clock, Wind, Pencil, Flame, Zap, Brain, ChevronRight } from 'lucide-react';
import { TimelineEntry } from './TimelineEntry';
import { calculateStreak } from '../lib/constants';

export default function Dashboard({ 
  userSettings, 
  fastingData, 
  entries, 
  routines, 
  bioPhase, 
  onDeleteEntry, 
  onToggleRoutine, 
  onDeleteRoutine, 
  onEditRoutine,
  onOpenRoutineModal,
  onOpenGoalModal,
  onOpenInfoModal,
  onOpenBreathwork
}) {
  const [filter, setFilter] = useState('all');

  const todayIndex = new Date().getDay();
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Greeting Logic
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Vitals Calculation
  const vitals = useMemo(() => {
    const todayEntries = entries.filter(e => e.timestamp.startsWith(todayStr));
    const focusMins = todayEntries
        .filter(e => e.type === 'work_session')
        .reduce((acc, curr) => acc + (parseInt(curr.duration) || 0), 0);
    
    return {
        streak: calculateStreak(entries),
        focusTime: Math.round(focusMins / 60 * 10) / 10, // hours
        workouts: todayEntries.filter(e => e.type === 'workout').length
    };
  }, [entries, todayStr]);

  const todaysRoutines = routines.filter(r => r.days.includes(todayIndex));
  todaysRoutines.sort((a, b) => {
     const aDone = (a.completedDates || []).includes(todayStr);
     const bDone = (b.completedDates || []).includes(todayStr);
     if (aDone === bDone) return 0;
     return aDone ? 1 : -1;
  });

  const filteredEntries = entries.filter(entry => {
    if (filter === 'all') return true;
    if (filter === 'meals') return entry.type === 'meal';
    if (filter === 'workouts') return entry.type === 'workout';
    if (filter === 'focus') return entry.type === 'work_session';
    if (filter === 'journal') return entry.type === 'journal';
    if (filter === 'breathwork') return entry.type === 'breathwork';
    return true;
  });

  return (
    <div className="space-y-8 pb-24 md:pb-8 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-1">
            {greeting}, <span className="text-zinc-400">{userSettings.displayName?.split(' ')[0] || 'Guest'}</span>
          </h2>
          <div className="flex items-center gap-3 text-zinc-500 text-sm mb-4">
             <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-zinc-900/50 backdrop-blur-sm ${bioPhase.color}`}>
              <Activity size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{bioPhase.title}</span>
              <span className="w-1 h-1 rounded-full bg-current opacity-50"></span>
              <span className="text-[10px] opacity-90 font-medium">{bioPhase.desc}</span>
          </div>
        </div>
        
        <button 
          onClick={onOpenBreathwork}
          className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all active:scale-95 shadow-lg shadow-black/20"
          title="Shift State"
        >
           <Wind size={24} />
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Widgets & Routines */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Daily Vitals Grid */}
          <div className="grid grid-cols-3 gap-3 md:gap-6">
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                 <div className="text-orange-500 mb-1"><Flame size={18} fill="currentColor" className="opacity-20" /></div>
                 <div className="text-xl font-bold text-white font-mono">{vitals.streak}</div>
                 <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Day Streak</div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                 <div className="text-cyan-400 mb-1"><Brain size={18} /></div>
                 <div className="text-xl font-bold text-white font-mono">{vitals.focusTime}h</div>
                 <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Focus</div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                 <div className="text-emerald-400 mb-1"><Activity size={18} /></div>
                 <div className="text-xl font-bold text-white font-mono">{Math.floor(fastingData.hours)}h</div>
                 <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Fasting</div>
              </div>
          </div>

          {/* Fast Timer Widget (Featured) */}
          <div 
            onClick={onOpenGoalModal}
            className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-6 cursor-pointer group transition-all hover:border-zinc-700 md:p-8"
          >
             {/* Background Pulse for High States */}
             {(fastingData.hours >= 16) && (
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-10 -mt-10 animate-pulse"></div>
             )}
             
             <div className="flex justify-between items-end relative z-10">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-emerald-500" />
                      <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Fasting Timer</span>
                   </div>
                   <div className="text-4xl font-bold text-white font-mono tracking-tighter tabular-nums">
                       {fastingData.hours}<span className="text-zinc-700 mx-1">:</span>{fastingData.minutes.toString().padStart(2, '0')}
                   </div>
                   <div className="text-xs text-zinc-500 mt-2 font-medium flex items-center gap-1">
                      Goal: {userSettings.fastingGoal}h 
                      <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                      <span className={
                          fastingData.hours < 12 ? "text-blue-400" :
                          fastingData.hours < 16 ? "text-emerald-400" :
                          "text-violet-400"
                      }>{fastingData.label}</span>
                   </div>
                </div>

                <div className="h-12 w-12 rounded-full border-4 border-zinc-800 flex items-center justify-center relative">
                   <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="8" fill="transparent" 
                         className="text-emerald-500 transition-all duration-1000"
                         strokeDasharray={289}
                         strokeDashoffset={289 - (Math.min(fastingData.progress, 100) / 100 * 289)}
                         strokeLinecap="round"
                      />
                   </svg>
                   <ChevronRight size={20} className="text-zinc-600 group-hover:text-white transition-colors" />
                </div>
             </div>
          </div>

          {/* Routine / Daily Checklist Section */}
          <div>
             <div className="flex justify-between items-center mb-4 px-1">
                 <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <ListChecks size={16} />
                    Daily Protocol
                 </h3>
                 <button onClick={onOpenRoutineModal} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">
                   <Plus size={18} />
                 </button>
             </div>

             {todaysRoutines.length === 0 ? (
                 <div className="text-center py-6 border border-dashed border-zinc-900 rounded-2xl bg-zinc-900/30">
                    <p className="text-zinc-600 text-sm">No protocols set for today.</p>
                    <button onClick={onOpenRoutineModal} className="mt-2 text-xs text-emerald-500 font-bold hover:text-emerald-400">
                       + Add Routine
                    </button>
                 </div>
             ) : (
                 <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide -mx-6 px-6 snap-x snap-mandatory lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible">
                    {todaysRoutines.map(routine => {
                       const isCompleted = (routine.completedDates || []).includes(todayStr);
                       const colors = {
                          diet: 'text-orange-400 border-orange-500/20 bg-orange-500/5',
                          exercise: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
                          mindset: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5'
                       };
                       
                       return (
                          <div 
                            key={routine.id}
                            onClick={() => onToggleRoutine(routine.id, isCompleted)}
                            className={`
                               flex-none w-40 lg:w-48 p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between min-h-[110px] snap-start relative overflow-hidden
                               ${isCompleted ? 'bg-zinc-900/30 border-zinc-800/50 opacity-60' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'}
                            `}
                          >
                              {isCompleted && <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>}
                              
                              <div className="flex justify-between items-start relative z-10">
                                  <div className={`transition-transform duration-300 ${isCompleted ? 'scale-110 text-emerald-500' : colors[routine.type].split(' ')[0]}`}>
                                    {isCompleted ? <CheckCircle size={20} className="fill-emerald-500/20" /> : <Circle size={20} />}
                                  </div>
                                  
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                       onClick={(e) => { e.stopPropagation(); onEditRoutine(routine); }}
                                       className="text-zinc-600 hover:text-white transition-colors"
                                    >
                                       <Pencil size={14} />
                                    </button>
                                    <button 
                                       onClick={(e) => { e.stopPropagation(); onDeleteRoutine(routine.id); }}
                                       className="text-zinc-600 hover:text-red-400 transition-colors"
                                    >
                                       <Trash2 size={14} />
                                    </button>
                                  </div>
                              </div>
                              
                              <div className="relative z-10">
                                 <div className={`font-bold leading-tight mb-2 ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                   {routine.title}
                                 </div>
                                 <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border ${colors[routine.type]}`}>
                                    {routine.type}
                                 </span>
                              </div>
                          </div>
                       )
                    })}
                 </div>
             )}
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-zinc-500" />
                Timeline
             </h3>
             <div className="flex bg-zinc-900/50 border border-zinc-800 p-1 rounded-xl overflow-x-auto scrollbar-hide gap-1 max-w-[150px] sm:max-w-none">
                {['all', 'meals', 'workouts', 'journal'].map(f => (
                   <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize whitespace-nowrap transition-all ${
                         filter === f ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                   >
                      {f}
                   </button>
                ))}
             </div>
          </div>

          <div className="lg:h-[calc(100vh-200px)] lg:overflow-y-auto lg:scrollbar-hide lg:pr-2">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-20 opacity-50 border-t border-zinc-900/50">
                <div className="inline-block p-4 rounded-full bg-zinc-900 mb-4">
                  <Activity className="text-zinc-500" size={32} />
                </div>
                <p className="text-zinc-400">No activity found today.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-zinc-800 ml-4 space-y-8 pb-8">
                {filteredEntries.map((entry) => {
                  let fastDuration = null;
                  if (entry.type === 'meal') {
                     const originalIndex = entries.findIndex(e => e.id === entry.id);
                     if (originalIndex !== -1) {
                        const prevMeal = entries.slice(originalIndex + 1).find(e => e.type === 'meal');
                        if (prevMeal) {
                           const diffMs = new Date(entry.timestamp) - new Date(prevMeal.timestamp);
                           const hours = Math.floor(diffMs / (1000 * 60 * 60));
                           const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                           fastDuration = `${hours}h ${minutes}m`;
                        }
                     }
                  }
                  return <TimelineEntry key={entry.id} entry={entry} onDelete={onDeleteEntry} fastDuration={fastDuration} />;
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
