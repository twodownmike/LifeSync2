import React from 'react';
import { Info, Edit2, ChevronRight, Activity, Utensils } from 'lucide-react';
import { Card, Button } from './UI';

export default function FastingTimer({ fastingData, userSettings, lastMeal, onOpenGoalModal, onOpenInfoModal, onLogMeal }) {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  
  const totalHours = fastingData.hours + (fastingData.minutes / 60);
  const goal = Math.max(userSettings.fastingGoal, 1);
  const isOvertime = totalHours > goal;
  
  // Progress calculation
  const progressPct = Math.min((totalHours / goal) * 100, 100);
  const offset = circumference * (1 - progressPct / 100);

  // Phase definitions (in hours)
  const PHASES = [
    { id: 'digest', label: 'Digesting', start: 0, end: 4, color: '#fb923c', bg: 'bg-orange-500', text: 'text-orange-400', desc: 'Blood sugar rises' }, 
    { id: 'normal', label: 'Normal', start: 4, end: 12, color: '#60a5fa', bg: 'bg-blue-500', text: 'text-blue-400', desc: 'Insulin drops' },     
    { id: 'burn', label: 'Burning', start: 12, end: 18, color: '#34d399', bg: 'bg-emerald-500', text: 'text-emerald-400', desc: 'Fat burning starts' },  
    { id: 'auto', label: 'Autophagy', start: 18, end: 72, color: '#a78bfa', bg: 'bg-violet-500', text: 'text-violet-400', desc: 'Cellular repair' }    
  ];

  const currentPhase = PHASES.find(p => totalHours >= p.start && totalHours < p.end) || PHASES[PHASES.length - 1];

  // Calculate detailed physiological metrics
  const getMetrics = () => {
      // Logic approximated based on standard fasting timelines
      let insulin = 100; // High
      let ketones = 0;   // None
      let autophagy = 0; // None

      if (totalHours > 4) insulin = Math.max(0, 100 - ((totalHours - 4) * 10)); // Drops 4h-14h
      if (totalHours > 12) ketones = Math.min(100, (totalHours - 12) * 15);     // Rises 12h+
      if (totalHours > 18) autophagy = Math.min(100, (totalHours - 18) * 10);   // Rises 18h+

      return { insulin, ketones, autophagy };
  };

  const metrics = getMetrics();

  const renderPhaseSegments = () => {
    let cumulativePct = 0;

    return PHASES.map((phase) => {
      if (phase.start >= goal) return null;
      
      const start = phase.start;
      const end = Math.min(phase.end, goal);
      const duration = end - start;
      const pct = duration / goal;
      
      const dashLength = circumference * pct;
      const dashGap = circumference - dashLength;
      const segmentOffset = -1 * (cumulativePct * circumference);
      
      cumulativePct += pct;
      const visualGap = 4; 
      
      return (
        <circle
          key={phase.id}
          cx="128"
          cy="128"
          r={radius}
          stroke={phase.color}
          strokeWidth="6"
          fill="transparent"
          strokeOpacity="0.15"
          strokeDasharray={`${Math.max(0, dashLength - visualGap)} ${dashGap + visualGap}`}
          strokeDashoffset={segmentOffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      );
    });
  };

  const getNextPhase = () => {
    const nextPhase = PHASES.find(p => p.start > totalHours);
    if (!nextPhase) return null;
    
    const timeToNext = nextPhase.start - totalHours;
    const hoursToNext = Math.floor(timeToNext);
    const minsToNext = Math.floor((timeToNext - hoursToNext) * 60);
    
    return { ...nextPhase, hoursToNext, minsToNext };
  };

  const nextPhase = getNextPhase();

  return (
    <div className="flex flex-col items-center pt-2 h-full pb-24 animate-fade-in relative min-h-[60vh] overflow-y-auto scrollbar-hide md:justify-center md:pb-0">
      
      {/* Header Actions */}
      <div className="absolute top-0 right-0 p-4 z-20">
         <button onClick={onOpenInfoModal} className="p-2 bg-zinc-900/50 rounded-full text-zinc-400 hover:text-white border border-zinc-800 backdrop-blur-sm transition-colors">
            <Info size={20} />
         </button>
      </div>

      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {/* Timer Ring Section */}
          <div className="relative w-80 h-80 flex items-center justify-center mb-6 flex-shrink-0 mt-4 md:mt-0 md:scale-110 transition-transform">
            <svg viewBox="0 0 256 256" className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              {/* Defs for Gradients */}
              <defs>
                 <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={isOvertime ? "#fbbf24" : "#10b981"} />
                    <stop offset="100%" stopColor={isOvertime ? "#f59e0b" : "#34d399"} />
                 </linearGradient>
                 <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                 </filter>
              </defs>

              {/* Background Track */}
              <circle
                 cx="128" cy="128" r={radius}
                 stroke="#18181b" strokeWidth="12" fill="transparent"
              />
              
              {/* Colored Phase Segments (Background) */}
              {renderPhaseSegments()}
              
              {/* Active Progress Ring */}
              <circle
                cx="128"
                cy="128"
                r={radius}
                stroke="url(#progressGradient)"
                strokeWidth="12"
                fill="transparent"
                className="transition-all duration-1000 ease-out" 
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ filter: 'url(#glow)' }}
              />
              
              {/* Current Position Marker (Dot) */}
              {progressPct > 0 && (
                 <circle 
                    cx="128" cy="8" r="6" fill="#fff"
                    className="transition-all duration-1000 ease-out origin-center"
                    style={{ transform: `rotate(${progressPct * 3.6}deg)`, transformOrigin: '128px 128px' }}
                 />
              )}
            </svg>
            
            {/* Center Content */}
            <div className="text-center z-10 flex flex-col items-center absolute inset-0 justify-center">
              <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 px-2 py-0.5 rounded-full ${isOvertime ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500'}`}>
                 {isOvertime ? 'Goal Reached' : 'Elapsed Time'}
              </div>
              
              <div className="text-6xl font-bold text-white font-mono tracking-tighter flex items-baseline filter drop-shadow-lg">
                <span>{fastingData.hours}</span>
                <span className="mx-1 opacity-50 text-4xl">:</span>
                <span>{fastingData.minutes.toString().padStart(2, '0')}</span>
              </div>
              
              <div className="text-xl font-mono text-zinc-500 mt-1 font-medium">
                 {fastingData.seconds.toString().padStart(2, '0')}
              </div>
              
              <div className={`mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-zinc-900 border-zinc-800`}>
                 <span className={`w-2 h-2 rounded-full ${currentPhase?.bg}`}></span>
                 <span className={currentPhase?.text}>{currentPhase?.label || fastingData.label}</span>
              </div>
            </div>
          </div>

          {/* Info Cards Container */}
          <div className="w-full max-w-sm px-6 space-y-4 md:px-0">
            
            {/* End Fast Button */}
            <Button onClick={onLogMeal} className="w-full bg-zinc-100 text-zinc-950 hover:bg-white hover:scale-[1.02] shadow-xl shadow-white/5" icon={Utensils}>
               End Fast (Log Meal)
            </Button>

            {/* Metric Bars */}
            <div className="grid grid-cols-3 gap-2">
               {[
                 { label: 'Insulin', val: metrics.insulin, color: 'bg-blue-500' },
                 { label: 'Ketones', val: metrics.ketones, color: 'bg-emerald-500' },
                 { label: 'Autophagy', val: metrics.autophagy, color: 'bg-violet-500' }
               ].map(m => (
                  <div key={m.label} className="bg-zinc-900/50 border border-zinc-800 p-2 rounded-xl flex flex-col gap-2">
                     <div className="text-[10px] text-zinc-500 font-bold uppercase">{m.label}</div>
                     <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${m.color}`} 
                            style={{ width: `${m.val}%` }}
                        />
                     </div>
                  </div>
               ))}
            </div>

            {/* Current State Detail */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group">
               <div className={`absolute top-0 left-0 w-1 h-full ${currentPhase?.bg} transition-colors duration-500`}></div>
               
               <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                      <Activity size={16} className={currentPhase?.text} />
                      <h3 className="font-bold text-zinc-200 text-sm">Body Status</h3>
                   </div>
                   {isOvertime && (
                       <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20">
                          Zone+
                       </span>
                   )}
               </div>
               
               <p className="text-sm text-zinc-400 leading-relaxed">
                 {currentPhase?.id === 'digest' && "Insulin is elevated. Your body is absorbing nutrients from your last meal."}
                 {currentPhase?.id === 'normal' && "Blood sugar stabilizes. You are starting to access stored energy."}
                 {currentPhase?.id === 'burn' && "Fat burning mode engaged. Ketone production increases significantly."}
                 {currentPhase?.id === 'auto' && "Deep cellular cleaning (autophagy). Old cells are being recycled."}
               </p>

               {nextPhase && (
                   <div className="mt-4 pt-3 border-t border-zinc-800/50 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Next: <span className="text-white font-medium">{nextPhase.label}</span></span>
                      <span className="text-xs font-mono text-zinc-400">in {nextPhase.hoursToNext}h {nextPhase.minsToNext}m</span>
                   </div>
               )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="py-3 px-4 flex flex-col items-center text-center">
                  <div className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Started</div>
                  <div className="text-white font-mono text-sm">
                    {lastMeal ? new Date(lastMeal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                  </div>
                </Card>
                
                <Card 
                  onClick={onOpenGoalModal}
                  className="py-3 px-4 flex flex-col items-center text-center cursor-pointer hover:bg-zinc-800/80 transition-colors group relative"
                >
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-zinc-500">
                     <Edit2 size={10} />
                  </div>
                  <div className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Goal</div>
                  <div className="text-white font-mono text-sm">{userSettings.fastingGoal} Hours</div>
                </Card>
            </div>

          </div>
      </div>
    </div>
  );
}
