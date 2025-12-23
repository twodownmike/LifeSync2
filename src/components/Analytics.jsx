import React from 'react';
import { Flame, Clock, Dumbbell, BookOpen, Activity } from 'lucide-react';
import { Card } from './UI';
import { calculateStreak } from '../lib/constants';

export default function Analytics({ entries }) {
  // Calculate stats
  const workoutCount = entries.filter(e => e.type === 'workout').length;
  const journalCount = entries.filter(e => e.type === 'journal').length;
  
  // Avg Fasting
  let totalFastHrs = 0;
  let fastCount = 0;
  // Entries are sorted newest first. 
  // We look for a meal, then find the previous meal (which is later in the array) to calc duration.
  for (let i = 0; i < entries.length - 1; i++) {
      if (entries[i].type === 'meal') {
          const prevMeal = entries.slice(i + 1).find(e => e.type === 'meal');
          if (prevMeal) {
              const diffMs = new Date(entries[i].timestamp) - new Date(prevMeal.timestamp);
              const hours = diffMs / (1000 * 60 * 60);
              if (hours > 0 && hours < 100) { // filter outliers
                  totalFastHrs += hours;
                  fastCount++;
              }
          }
      }
  }
  const avgFast = fastCount > 0 ? (totalFastHrs / fastCount).toFixed(1) : 0;
  
  // Streak
  const streak = calculateStreak(entries);

  // Heatmap Data (Last 28 days)
  // Generate last 28 days (4 weeks)
  const last28Days = Array.from({length: 28}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (27 - i));
      return d.toISOString().split('T')[0];
  });

  const activityByDate = entries.reduce((acc, entry) => {
      const date = new Date(entry.timestamp).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
  }, {});

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-6">Analytics</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
         <Card className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
               <Flame size={14} className="text-orange-500" /> Streak
            </div>
            <div className="text-3xl font-bold text-white font-mono">{streak}</div>
            <div className="text-xs text-zinc-500">Current Day Streak</div>
         </Card>
         
         <Card className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
               <Clock size={14} className="text-emerald-500" /> Fasting
            </div>
            <div className="text-3xl font-bold text-white font-mono">{avgFast}<span className="text-sm text-zinc-500 ml-1">h</span></div>
            <div className="text-xs text-zinc-500">Avg. Fast Duration</div>
         </Card>

         <Card className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
               <Dumbbell size={14} className="text-cyan-500" /> Workouts
            </div>
            <div className="text-3xl font-bold text-white font-mono">{workoutCount}</div>
            <div className="text-xs text-zinc-500">Total Sessions</div>
         </Card>

         <Card className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
               <BookOpen size={14} className="text-violet-500" /> Journals
            </div>
            <div className="text-3xl font-bold text-white font-mono">{journalCount}</div>
            <div className="text-xs text-zinc-500">Entries Logged</div>
         </Card>
      </div>

      {/* Consistency Heatmap */}
      <Card>
         <h3 className="font-bold text-white mb-4 flex items-center gap-2">
           <Activity size={18} className="text-zinc-400" />
           Consistency (Last 28 Days)
         </h3>
         <div className="grid grid-cols-7 gap-2">
            {last28Days.map((dateStr, i) => {
                const count = activityByDate[dateStr] || 0;
                // Color scale based on count
                let bgClass = 'bg-zinc-800/50';
                if (count > 0) bgClass = 'bg-emerald-500/30 border-emerald-500/50';
                if (count > 2) bgClass = 'bg-emerald-500/60 border-emerald-500/80';
                if (count > 4) bgClass = 'bg-emerald-500 border-emerald-400';
                
                return (
                    <div key={dateStr} className={`aspect-square rounded-md border border-transparent transition-all ${bgClass} relative group`}>
                       <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap border border-zinc-800 pointer-events-none z-10 shadow-xl">
                          {new Date(dateStr).toLocaleDateString(undefined, {month:'short', day:'numeric'})}: {count} entries
                       </div>
                    </div>
                )
            })}
         </div>
      </Card>
    </div>
  );
}
