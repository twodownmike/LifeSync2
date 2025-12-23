import React from 'react';
import { Info, Edit2, ChevronRight, Activity, Zap, Flame, Sparkles } from 'lucide-react';
import { Card } from './UI';

export default function FastingTimer({ fastingData, userSettings, lastMeal, onOpenGoalModal, onOpenInfoModal }) {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  
  // Protect against NaN
  const safeProgress = Number.isFinite(fastingData.progress) ? Math.min(fastingData.progress, 100) : 0;
  const offset = circumference * (1 - safeProgress / 100);
  const totalHours = fastingData.hours + (fastingData.minutes / 60);

  // Phase definitions (in hours)
  const PHASES = [
    { id: 'digest', label: 'Digesting', start: 0, end: 4, color: '#fb923c', bg: 'text-orange-400', desc: 'Blood sugar rises' }, // Orange
    { id: 'normal', label: 'Normal', start: 4, end: 12, color: '#60a5fa', bg: 'text-blue-400', desc: 'Insulin drops' },     // Blue
    { id: 'burn', label: 'Burning', start: 12, end: 18, color: '#34d399', bg: 'text-emerald-400', desc: 'Fat burning starts' },  // Emerald
    { id: 'auto', label: 'Autophagy', start: 18, end: 72, color: '#a78bfa', bg: 'text-violet-400', desc: 'Cellular repair' }    // Violet
  ];

  // Helper to calculate segment dash arrays
  const getSegmentStroke = (phase) => {
    const goal = Math.max(userSettings.fastingGoal, 1);
    
    // Normalize phase start/end to goal duration (0 to 1)
    const startPct = Math.min(phase.start / goal, 1);
    const endPct = Math.min(phase.end / goal, 1);
    
    if (startPct >= 1) return null; // Phase is beyond goal

    const length = (endPct - startPct) * circumference;
    const gap = circumference - length;
    
    // Offset calculation: 
    // SVG circle starts at 3 o'clock by default. We rotated -90deg so it starts at 12 o'clock.
    // The stroke-dashoffset needs to shift the segment to the correct start position.
    // A positive offset pushes the dash 'back'.
    const phaseOffset = circumference * (1 - startPct); // This might need adjustment based on SVG coordinates

    return {
        dashArray: `${length} ${gap}`,
        dashOffset: circumference * (0.25 + startPct) * -1 // Adjust for starting position? 
        // Let's simplify: rotate entire circle -90. 
        // Standard offset is usually circumference - (percent * circumference).
        // For segments, we use dasharray "length gap" and offset "-startPos"
    };
  };

  // Simple arc segments approach:
  // Instead of complex dash math, let's just render the background segments as simple proportional circles
  // BUT, to keep it clean, maybe just colored ticks or a subtle background track?
  // Let's stick to the user request: "color code the rings segments"
  
  // We will calculate exact dasharray/offset for each phase on the background ring.
  // Rotated -90deg, 0 is at top.
  // Dashoffset = 0 starts at 3 o'clock (pre-rotation).
  // With -90deg rotation, 0 starts at 12 o'clock.
  
  const renderPhaseSegments = () => {
    const goal = Math.max(userSettings.fastingGoal, 1);
    let cumulativePct = 0;

    return PHASES.map((phase) => {
      if (phase.start >= goal) return null;
      
      const start = phase.start;
      const end = Math.min(phase.end, goal);
      const duration = end - start;
      const pct = duration / goal;
      
      const dashLength = circumference * pct;
      const dashGap = circumference - dashLength;
      
      // Calculate offset based on previous segments
      // We need to shift it negatively by the cumulative percentage
      const segmentOffset = -1 * (cumulativePct * circumference);
      
      cumulativePct += pct;

      // Add a tiny gap between segments
      const visualGap = 4; 
      
      return (
        <circle
          key={phase.id}
          cx="128"
          cy="128"
          r={radius}
          stroke={phase.color}
          strokeWidth="8"
          fill="transparent"
          strokeOpacity="0.2"
          strokeDasharray={`${Math.max(0, dashLength - visualGap)} ${dashGap + visualGap}`}
          strokeDashoffset={segmentOffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      );
    });
  };

  const getNextPhase = () => {
    const currentHours = fastingData.hours + (fastingData.minutes / 60);
    const nextPhase = PHASES.find(p => p.start > currentHours);
    if (!nextPhase) return null;
    
    const timeToNext = nextPhase.start - currentHours;
    const hoursToNext = Math.floor(timeToNext);
    const minsToNext = Math.floor((timeToNext - hoursToNext) * 60);
    
    return { ...nextPhase, hoursToNext, minsToNext };
  };

  const nextPhase = getNextPhase();
  const currentPhase = PHASES.find(p => totalHours >= p.start && totalHours < p.end) || PHASES[PHASES.length - 1];

  return (
    <div className="flex flex-col items-center pt-6 h-full pb-24 animate-fade-in relative min-h-[60vh] overflow-y-auto scrollbar-hide">
      
      {/* Timer Ring Section */}
      <div className="relative w-72 h-72 flex items-center justify-center mb-8 flex-shrink-0">
        <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          {/* Background Track (Dark) */}
          <circle
             cx="128" cy="128" r={radius}
             stroke="#18181b" strokeWidth="8" fill="transparent"
          />
          
          {/* Colored Phase Segments (Background) */}
          {renderPhaseSegments()}
          
          {/* Active Progress */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className={`${currentPhase?.bg.replace('text-', 'text-')} transition-all duration-1000 ease-linear`} 
            strokeDasharray={circumference}
            strokeDashoffset={Number.isNaN(offset) ? circumference : offset}
            strokeLinecap="round"
          />
        </svg>
        
        <div className="text-center z-10 flex flex-col items-center absolute inset-0 justify-center">
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Elapsed Time</div>
          <div className="text-6xl font-bold text-white font-mono tracking-tighter flex items-baseline filter drop-shadow-lg">
            <span>{fastingData.hours}</span>
            <span className="mx-1 opacity-50 text-4xl">:</span>
            <span>{fastingData.minutes.toString().padStart(2, '0')}</span>
          </div>
          <div className="text-xl font-mono text-zinc-600 mt-1 font-medium">
             {fastingData.seconds.toString().padStart(2, '0')}
          </div>
          
          <div className={`mt-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${currentPhase?.bg} ${currentPhase?.bg.replace('text', 'bg').replace('400', '500/10')} border-opacity-20`}>
            {currentPhase?.label || fastingData.label}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="w-full max-w-sm px-6 space-y-4">
        
        {/* Next Milestone */}
        {nextPhase ? (
           <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                 <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Coming up</div>
                 <div className="text-white font-bold flex items-center gap-2">
                    {nextPhase.label} Phase
                    <ChevronRight size={14} className="text-zinc-600" />
                 </div>
                 <div className="text-zinc-400 text-xs mt-1">{nextPhase.desc}</div>
              </div>
              <div className="text-right">
                 <div className="text-2xl font-mono font-bold text-zinc-200">
                    {nextPhase.hoursToNext}<span className="text-sm text-zinc-600 ml-0.5">h</span> {nextPhase.minsToNext}<span className="text-sm text-zinc-600 ml-0.5">m</span>
                 </div>
                 <div className="text-[10px] text-zinc-500 font-bold uppercase">Remaining</div>
              </div>
           </div>
        ) : (
           <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400">
                 <Sparkles size={24} />
              </div>
              <div>
                 <div className="text-emerald-400 font-bold">Max Benefits Reached</div>
                 <div className="text-emerald-500/70 text-xs">You are in deep autophagy.</div>
              </div>
           </div>
        )}

        {/* Current State Detail */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
           <div className={`absolute top-0 left-0 w-1 h-full ${currentPhase?.bg.replace('text', 'bg')}`}></div>
           <div className="flex items-start gap-3 mb-2">
              <Activity size={18} className={currentPhase?.bg} />
              <h3 className="font-bold text-zinc-200">Physiological State</h3>
           </div>
           <p className="text-sm text-zinc-400 leading-relaxed">
             {currentPhase?.id === 'digest' && "Your body is digesting food and absorbing nutrients. Insulin levels are high."}
             {currentPhase?.id === 'normal' && "Blood sugar levels return to normal. Insulin drops, signaling your body to start burning stored energy."}
             {currentPhase?.id === 'burn' && "Your body has switched to burning fat for fuel (Ketosis). HGH levels begin to rise."}
             {currentPhase?.id === 'auto' && "Your cells are recycling old components (Autophagy). Inflammation decreases significantly."}
           </p>
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
  );
}
