import React, { useState, useMemo } from 'react';
import { Activity, Clock, Wind, Flame, Brain, ChevronRight, Zap, Dumbbell } from 'lucide-react';
import { TimelineEntry } from './TimelineEntry';
import { calculateStreak } from '../lib/constants';

export default function Dashboard({ 
  userSettings, 
  fastingData, 
  entries, 
  bioPhase, 
  onDeleteEntry, 
  onOpenGoalModal,
  onOpenInfoModal,
  onOpenBreathwork
}) {
  const [filter, setFilter] = useState('all');

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Greeting Logic
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return "Late Night";
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
        workouts: todayEntries.filter(e => e.type === 'workout').length,
        water: 0 // Placeholder if we add water tracking later
    };
  }, [entries, todayStr]);

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
    <div className="space-y-8 pb-24 md:pb-12 animate-fade-in">
      
      {/* Bio-HUD Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-zinc-800 p-8 md:p-10">
         {/* Dynamic Gradient Mesh Background */}
         <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br ${bioPhase.color.replace('text-', 'from-').replace('-400', '-500/20')} to-transparent blur-3xl rounded-full -mr-32 -mt-32 opacity-60 pointer-events-none mix-blend-screen`}></div>
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-500/10 blur-3xl rounded-full -ml-20 -mb-20 pointer-events-none"></div>

         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-black/40 backdrop-blur-md ${bioPhase.color.replace('text-', 'border-').replace('-400', '-500/30')} ${bioPhase.color}`}>
                     <Activity size={10} />
                     {bioPhase.title} Phase
                  </span>
                  <span className="text-zinc-500 text-xs font-medium tracking-wide">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
               </div>
               <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  {greeting}, <br className="md:hidden" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">
                    {userSettings.displayName?.split(' ')[0] || 'Guest'}
                  </span>
               </h1>
               <p className="text-zinc-400 mt-2 max-w-md text-sm md:text-base leading-relaxed opacity-90">
                 {bioPhase.desc}
               </p>
            </div>

            <button 
              onClick={onOpenBreathwork}
              className="group relative px-5 py-3 rounded-2xl bg-zinc-950/50 border border-zinc-800 hover:border-cyan-500/50 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] overflow-hidden"
            >
               <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
               <div className="relative flex items-center gap-3">
                  <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                    <Wind size={20} />
                  </div>
                  <div className="text-left">
                     <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-cyan-200 transition-colors">Shift State</div>
                     <div className="text-sm font-bold text-white">Breathwork</div>
                  </div>
               </div>
            </button>
         </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Vitals & Fasting (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Daily Vitals Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Streak */}
              <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 p-5 rounded-[2rem] flex flex-col justify-between relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-2xl rounded-full -mr-6 -mt-6 group-hover:bg-orange-500/10 transition-colors"></div>
                 <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500 border border-orange-500/10 group-hover:scale-110 transition-transform">
                       <Flame size={20} fill="currentColor" className="fill-orange-500/20" />
                    </div>
                 </div>
                 <div className="relative z-10">
                    <div className="text-3xl font-bold text-white font-mono tracking-tighter">{vitals.streak}</div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1 group-hover:text-orange-400/80 transition-colors">Day Streak</div>
                 </div>
              </div>

              {/* Focus */}
              <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 p-5 rounded-[2rem] flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full -mr-6 -mt-6 group-hover:bg-cyan-500/10 transition-colors"></div>
                 <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/10 group-hover:scale-110 transition-transform">
                       <Brain size={20} />
                    </div>
                 </div>
                 <div className="relative z-10">
                    <div className="text-3xl font-bold text-white font-mono tracking-tighter">{vitals.focusTime}<span className="text-lg text-zinc-600 ml-0.5">h</span></div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1 group-hover:text-cyan-400/80 transition-colors">Deep Work</div>
                 </div>
              </div>

              {/* Workouts (Hidden on small screens if needed, or 3rd col) */}
              <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 p-5 rounded-[2rem] flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-colors col-span-2 md:col-span-1">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full -mr-6 -mt-6 group-hover:bg-emerald-500/10 transition-colors"></div>
                 <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                       <Dumbbell size={20} />
                    </div>
                    {/* Tiny activity blocks visualization could go here */}
                    <div className="flex gap-0.5">
                       {[...Array(3)].map((_,i) => <div key={i} className={`w-1 h-3 rounded-full ${i < vitals.workouts ? 'bg-emerald-500' : 'bg-zinc-800'}`}></div>)}
                    </div>
                 </div>
                 <div className="relative z-10">
                    <div className="text-3xl font-bold text-white font-mono tracking-tighter">{vitals.workouts}</div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1 group-hover:text-emerald-400/80 transition-colors">Sessions</div>
                 </div>
              </div>
          </div>

          {/* Fasting Widget (Wide) */}
          <div 
            onClick={onOpenGoalModal}
            className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-zinc-800 p-8 cursor-pointer group transition-all hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/50"
          >
             {/* Progress Glow Background */}
             <div 
               className="absolute inset-0 opacity-20 transition-opacity duration-1000"
               style={{ 
                  background: `conic-gradient(from 0deg at 50% 50%, ${
                     fastingData.hours < 12 ? '#3b82f6' : 
                     fastingData.hours < 16 ? '#10b981' : '#8b5cf6'
                  } 0%, transparent ${Math.min(fastingData.progress, 100)}%, transparent 100%)`,
                  filter: 'blur(60px)'
               }}
             ></div>
             
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                   <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-black/20 border border-white/5 backdrop-blur-md">
                      <Clock size={14} className={
                          fastingData.hours < 12 ? "text-blue-400" :
                          fastingData.hours < 16 ? "text-emerald-400" : "text-violet-400"
                      } />
                      <span className="text-xs text-zinc-300 font-bold uppercase tracking-wider">Fasting Timer</span>
                   </div>
                   
                   <div className="text-6xl md:text-7xl font-bold text-white font-mono tracking-tighter tabular-nums leading-none my-2 text-shadow-glow">
                       {fastingData.hours}<span className="text-zinc-800 mx-1 text-4xl align-top mt-4 inline-block">:</span>{fastingData.minutes.toString().padStart(2, '0')}
                   </div>
                   
                   <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-4">
                      <div className="text-sm font-medium text-zinc-400 bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800">
                         Goal: <span className="text-white font-bold">{userSettings.fastingGoal}h</span>
                      </div>
                      <div className={`text-sm font-bold tracking-wide uppercase px-3 py-1.5 rounded-lg bg-zinc-950/50 border border-zinc-800 ${
                          fastingData.hours < 12 ? "text-blue-400" :
                          fastingData.hours < 16 ? "text-emerald-400" :
                          "text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                      }`}>
                         {fastingData.label}
                      </div>
                   </div>
                </div>

                {/* Circular Progress Visual */}
                <div className="relative w-40 h-40 flex-shrink-0">
                   {/* Background Circle */}
                   <svg className="absolute inset-0 rotate-[-90deg]" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-zinc-800/50" />
                      {/* Progress Arc */}
                      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" 
                         className={`transition-all duration-1000 ease-out ${
                            fastingData.hours < 12 ? "text-blue-500" :
                            fastingData.hours < 16 ? "text-emerald-500" : "text-violet-500"
                         }`}
                         strokeDasharray={283}
                         strokeDashoffset={283 - (Math.min(fastingData.progress, 100) / 100 * 283)}
                         strokeLinecap="round"
                         style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
                      />
                   </svg>
                   
                   {/* Center Content */}
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-zinc-900 rounded-full p-4 border border-zinc-800 group-hover:scale-110 transition-transform duration-500 group-hover:border-zinc-700">
                         <ChevronRight size={24} className="text-zinc-500 group-hover:text-white transition-colors" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Timeline (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full min-h-[500px]">
          <div className="flex items-center justify-between mb-6 px-1">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-zinc-500" />
                Latest Activity
             </h3>
             <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl overflow-x-auto scrollbar-hide gap-1">
                {['all', 'meals', 'workouts', 'journal'].map(f => (
                   <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize whitespace-nowrap transition-all ${
                         filter === f ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                   >
                      {f}
                   </button>
                ))}
             </div>
          </div>

          <div className="flex-1 relative">
            {filteredEntries.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-900 rounded-3xl bg-zinc-900/20">
                <div className="p-4 rounded-full bg-zinc-900 mb-4 animate-pulse">
                  <Activity className="text-zinc-600" size={32} />
                </div>
                <p className="text-zinc-400 font-medium">No activity yet today.</p>
                <p className="text-zinc-600 text-xs mt-1 max-w-[200px]">Log your meals, workouts, or focus sessions to populate your timeline.</p>
              </div>
            ) : (
              <div className="relative space-y-0 pb-8">
                {/* Continuous Timeline Line */}
                <div className="absolute left-8 top-4 bottom-8 w-px bg-gradient-to-b from-zinc-700 via-zinc-800 to-transparent"></div>

                {filteredEntries.map((entry, idx) => {
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
                  return (
                    <div key={entry.id} className="relative z-10 mb-8 last:mb-0">
                        <TimelineEntry 
                            entry={entry} 
                            onDelete={onDeleteEntry} 
                            fastDuration={fastDuration} 
                            isFirst={idx === 0}
                        />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
