import React, { useMemo } from 'react';
import { Flame, Clock, Dumbbell, BookOpen, Activity, Zap } from 'lucide-react';
import { Card } from './UI';
import { calculateStreak } from '../lib/constants';
import { ActivityBarChart, FastingTrendChart, StatCard } from './AnalyticsCharts';

export default function Analytics({ entries }) {
  // --- Data Processing ---
  
  // 1. General Counts
  const workoutCount = entries.filter(e => e.type === 'workout').length;
  const journalCount = entries.filter(e => e.type === 'journal').length;
  
  // 2. Fasting Analysis
  const fastingAnalysis = useMemo(() => {
    let totalFastHrs = 0;
    let fastCount = 0;
    let longestFast = 0;
    const trends = []; // { date, value }

    // Entries are sorted newest first
    for (let i = 0; i < entries.length - 1; i++) {
        if (entries[i].type === 'meal') {
            const prevMeal = entries.slice(i + 1).find(e => e.type === 'meal');
            if (prevMeal) {
                const diffMs = new Date(entries[i].timestamp) - new Date(prevMeal.timestamp);
                const hours = diffMs / (1000 * 60 * 60);
                
                if (hours > 0 && hours < 100) { 
                    totalFastHrs += hours;
                    fastCount++;
                    if (hours > longestFast) longestFast = hours;
                    
                    // Capture for trend chart (limit to last 14 fasts for readability)
                    if (trends.length < 14) {
                        const d = new Date(entries[i].timestamp);
                        trends.unshift({ 
                            label: `${d.getMonth()+1}/${d.getDate()}`, 
                            value: parseFloat(hours.toFixed(1)),
                            date: d.toLocaleDateString()
                        });
                    }
                }
            }
        }
    }

    return {
        avg: fastCount > 0 ? (totalFastHrs / fastCount).toFixed(1) : 0,
        longest: longestFast,
        trends
    };
  }, [entries]);

  // 3. Focus Stats
  const focusStats = useMemo(() => {
    const focusEntries = entries.filter(e => e.type === 'work_session');
    const totalMinutes = focusEntries.reduce((acc, curr) => acc + (parseInt(curr.duration) || 0), 0);
    return (totalMinutes / 60).toFixed(1);
  }, [entries]);

  // 4. Weekly Activity Breakdown (Last 7 Days)
  const weeklyActivity = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Filter entries for this day
        const dayEntries = entries.filter(e => e.timestamp.startsWith(dateStr));
        
        days.push({
            label: dayLabel,
            meals: dayEntries.filter(e => e.type === 'meal').length,
            workouts: dayEntries.filter(e => e.type === 'workout').length,
            focus: dayEntries.filter(e => e.type === 'work_session').length
        });
    }
    return days;
  }, [entries]);

  const streak = calculateStreak(entries);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
             <Flame size={14} className="text-orange-500 fill-orange-500/20" />
             <span className="text-sm font-bold text-white">{streak} Day Streak</span>
        </div>
      </div>
      
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
         <StatCard 
            icon={Clock} 
            label="Avg Fast" 
            value={`${fastingAnalysis.avg}h`} 
            subtext="Last 30 Days"
            color="text-emerald-500" 
         />
         <StatCard 
            icon={Zap} 
            label="Deep Work" 
            value={`${focusStats}h`} 
            subtext="Total Focus Time"
            color="text-cyan-400" 
         />
         <StatCard 
            icon={Dumbbell} 
            label="Workouts" 
            value={workoutCount} 
            subtext="Total Sessions"
            color="text-emerald-400" 
         />
         <StatCard 
            icon={BookOpen} 
            label="Journal" 
            value={journalCount} 
            subtext="Entries Logged"
            color="text-violet-500" 
         />
      </div>

      {/* Charts Section */}
      
      {/* Fasting Trends */}
      <Card>
         <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
               <Activity size={18} className="text-zinc-400" />
               Fasting Trends
            </h3>
            <span className="text-xs text-zinc-500 font-mono">Personal Best: {fastingAnalysis.longest.toFixed(1)}h</span>
         </div>
         <FastingTrendChart data={fastingAnalysis.trends} goal={16} />
      </Card>

      {/* Weekly Activity */}
      <Card>
         <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={18} className="text-zinc-400" />
            Weekly Activity
         </h3>
         <ActivityBarChart data={weeklyActivity} />
      </Card>
    </div>
  );
}
