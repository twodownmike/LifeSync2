import React, { useState, useEffect, useRef } from 'react';
import { X, Wind, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from './UI';

const PATTERNS = [
  { 
    id: 'box', 
    label: 'Box Breathing', 
    desc: 'Focus & Balance', 
    phases: [
      { label: 'Inhale', duration: 4000 },
      { label: 'Hold', duration: 4000 },
      { label: 'Exhale', duration: 4000 },
      { label: 'Hold', duration: 4000 }
    ],
    color: 'text-cyan-400',
    bg: 'bg-cyan-500'
  },
  { 
    id: '478', 
    label: '4-7-8 Relax', 
    desc: 'Sleep & Anxiety', 
    phases: [
      { label: 'Inhale', duration: 4000 },
      { label: 'Hold', duration: 7000 },
      { label: 'Exhale', duration: 8000 }
    ],
    color: 'text-violet-400',
    bg: 'bg-violet-500'
  },
  { 
    id: 'coherence', 
    label: 'Coherence', 
    desc: 'Heart Rate Variability', 
    phases: [
      { label: 'Inhale', duration: 5500 },
      { label: 'Exhale', duration: 5500 }
    ],
    color: 'text-emerald-400',
    bg: 'bg-emerald-500'
  }
];

export default function Breathwork({ onClose }) {
  const [activePattern, setActivePattern] = useState(PATTERNS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // Time left in current phase (ms)
  
  // Animation state (0 to 1 scale)
  const [scale, setScale] = useState(0.3); // Starts contracted
  const [instruction, setInstruction] = useState('Ready');

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Reset when pattern changes
  useEffect(() => {
    setIsPlaying(false);
    setPhaseIndex(0);
    setInstruction('Ready');
    setScale(0.3);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [activePattern]);

  // Main Loop
  useEffect(() => {
    if (!isPlaying) return;

    let phase = activePattern.phases[phaseIndex];
    let start = Date.now();
    
    // Set initial instruction and scale target for this phase
    setInstruction(phase.label);
    
    // Determine scale based on phase type
    if (phase.label === 'Inhale') setScale(1);
    else if (phase.label === 'Exhale') setScale(0.3);
    // Holds keep previous scale (1 or 0.3)

    const tick = () => {
        const now = Date.now();
        const elapsed = now - start;
        const remaining = Math.max(0, phase.duration - elapsed);
        
        setTimeLeft(remaining);

        if (remaining <= 0) {
            // Next phase
            setPhaseIndex(prev => {
                const next = (prev + 1) % activePattern.phases.length;
                return next;
            });
        }
    };

    timerRef.current = setInterval(tick, 50);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, phaseIndex, activePattern]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const reset = () => {
      setIsPlaying(false);
      setPhaseIndex(0);
      setInstruction('Ready');
      setScale(0.3);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="px-6 pt-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-zinc-400">
            <Wind size={20} />
            <span className="font-bold">State Shifter</span>
        </div>
        <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white">
            <X size={20} />
        </button>
      </div>

      {/* Main Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
         {/* Rings */}
         <div className="relative flex items-center justify-center w-80 h-80">
            {/* Outer Static Ring */}
            <div className={`absolute w-64 h-64 rounded-full border-2 ${activePattern.color.replace('text', 'border')} opacity-20`}></div>
            
            {/* Expanding/Contracting Blob */}
            <div 
                className={`w-64 h-64 rounded-full ${activePattern.bg} blur-3xl opacity-40 transition-all ease-linear`}
                style={{ 
                    transform: `scale(${scale})`,
                    transitionDuration: isPlaying ? `${activePattern.phases[phaseIndex].duration}ms` : '500ms'
                }}
            />
            
            {/* Solid Inner Circle */}
            <div 
                className={`absolute w-64 h-64 rounded-full border-4 ${activePattern.color.replace('text', 'border')} transition-all ease-linear flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm`}
                style={{ 
                    transform: `scale(${scale})`,
                    transitionDuration: isPlaying ? `${activePattern.phases[phaseIndex].duration}ms` : '500ms'
                }}
            >
                {/* Instruction Text Inside */}
                <span className={`text-2xl font-bold ${activePattern.color} tracking-widest uppercase transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                    {instruction}
                </span>
            </div>

            {/* Center Start Text (if not playing) */}
            {!isPlaying && (
                <div className="absolute z-10">
                    <button 
                        onClick={togglePlay}
                        className="bg-white text-black w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform"
                    >
                        <Play size={24} fill="currentColor" className="ml-1" />
                    </button>
                </div>
            )}
         </div>
      </div>

      {/* Controls & Selection */}
      <div className="pb-12 px-6 space-y-8">
         <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-1">{activePattern.label}</h2>
            <p className="text-zinc-500 text-sm">{activePattern.desc}</p>
         </div>

         <div className="flex justify-center gap-4">
            {isPlaying && (
                <div className="flex gap-4">
                    <button onClick={togglePlay} className="p-4 bg-zinc-900 rounded-full text-zinc-400 hover:text-white border border-zinc-800">
                        <Pause size={24} fill="currentColor" />
                    </button>
                    <button onClick={reset} className="p-4 bg-zinc-900 rounded-full text-zinc-400 hover:text-white border border-zinc-800">
                        <RotateCcw size={24} />
                    </button>
                </div>
            )}
         </div>

         {/* Pattern Selector */}
         {!isPlaying && (
             <div className="grid grid-cols-3 gap-3">
                {PATTERNS.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setActivePattern(p)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all
                            ${activePattern.id === p.id 
                                ? `bg-zinc-900 ${p.color.replace('text', 'border')}` 
                                : 'bg-zinc-950 border-zinc-800 opacity-60 hover:opacity-100'}`}
                    >
                        <div className={`w-2 h-2 rounded-full ${p.bg}`}></div>
                        <span className={`text-xs font-bold ${activePattern.id === p.id ? 'text-white' : 'text-zinc-500'}`}>
                            {p.label.split(' ')[0]}
                        </span>
                    </button>
                ))}
             </div>
         )}
      </div>
    </div>
  );
}
