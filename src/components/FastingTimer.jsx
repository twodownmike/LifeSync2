import React from 'react';
import { Info, Edit2 } from 'lucide-react';
import { Card } from './UI';

export default function FastingTimer({ fastingData, userSettings, lastMeal, onOpenGoalModal, onOpenInfoModal }) {
  // Calculation safe-guard for strokeDashoffset to avoid NaN/Infinity errors rendering blank screen
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const safeProgress = Number.isFinite(fastingData.progress) ? fastingData.progress : 0;
  const offset = circumference * (1 - safeProgress / 100);

  return (
    <div className="flex flex-col items-center pt-10 h-full pb-20 animate-fade-in relative min-h-[60vh]">
      <div className="absolute top-0 right-0">
        <button 
          onClick={onOpenInfoModal}
          className="text-zinc-500 hover:text-emerald-400 transition-colors p-2"
        >
          <Info size={22} />
        </button>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full border-8 border-zinc-800"></div>
        <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-emerald-500 transition-all duration-1000 ease-linear" 
            strokeDasharray={circumference}
            strokeDashoffset={Number.isNaN(offset) ? circumference : offset}
            strokeLinecap="round"
          />
        </svg>
        
        <div className="text-center z-10 flex flex-col items-center">
          <div className="text-zinc-400 text-sm font-medium mb-2">Current Fast</div>
          <div className="text-5xl font-bold text-white font-mono tracking-tighter flex items-baseline">
            <span>{fastingData.hours}</span>
            <span className="mx-1">:</span>
            <span>{fastingData.minutes.toString().padStart(2, '0')}</span>
          </div>
          <div className="text-2xl font-mono text-zinc-500 mt-1 font-bold">
             {fastingData.seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mt-3">
            {fastingData.label}
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs grid grid-cols-2 gap-4">
        <Card className="text-center py-4">
          <div className="text-zinc-500 text-xs mb-1">Last Meal</div>
          <div className="text-zinc-200 font-medium">
            {lastMeal ? new Date(lastMeal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
          </div>
        </Card>
        
        <Card 
          onClick={onOpenGoalModal}
          className="text-center py-4 cursor-pointer hover:bg-zinc-800/50 transition-colors relative group"
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500">
             <Edit2 size={12} />
          </div>
          <div className="text-zinc-500 text-xs mb-1">Goal</div>
          <div className="text-zinc-200 font-medium">{userSettings.fastingGoal} Hours</div>
        </Card>
      </div>

      {fastingData.hours >= userSettings.fastingGoal && (
        <div className="mt-8 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
          Target Reached!
        </div>
      )}
    </div>
  );
}
