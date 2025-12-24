import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Headphones, 
  Tag, 
  CheckCircle, 
  Brain, 
  Volume2, 
  VolumeX,
  Clock,
  Code,
  PenTool,
  Book,
  Calendar,
  Layout
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const AUDIO_MODES = [
  { id: 'none', label: 'Silent', icon: VolumeX },
  { id: 'brown', label: 'Brown Noise', icon: Volume2 },
  { id: 'binaural', label: '40Hz Flow', icon: Brain },
];

const DURATIONS = [
  { label: '25m', min: 25 },
  { label: '50m', min: 50 },
  { label: '90m', min: 90 },
];

const TASK_TAGS = [
  { id: 'coding', label: 'Coding', icon: Code },
  { id: 'writing', label: 'Writing', icon: PenTool },
  { id: 'learning', label: 'Learning', icon: Book },
  { id: 'planning', label: 'Planning', icon: Calendar },
  { id: 'design', label: 'Design', icon: Layout },
];

export default function FocusMode({ onSessionComplete }) {
  const { requestPermission, sendNotification } = useNotifications();
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [task, setTask] = useState('');
  const [selectedTag, setSelectedTag] = useState('coding');
  const [audioMode, setAudioMode] = useState('none');
  const [showVolume, setShowVolume] = useState(false);
  
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const oscNodesRef = useRef([]);
  const noiseNodeRef = useRef(null);

  // Initialize Audio Context on user interaction
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.connect(audioCtxRef.current.destination);
      gainNodeRef.current.gain.value = 0.05; // Lower default volume
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const stopAudio = () => {
    if (noiseNodeRef.current) {
      noiseNodeRef.current.stop();
      noiseNodeRef.current.disconnect();
      noiseNodeRef.current = null;
    }
    oscNodesRef.current.forEach(osc => {
      osc.stop();
      osc.disconnect();
    });
    oscNodesRef.current = [];
  };

  const playBrownNoise = () => {
    stopAudio();
    initAudio();
    const bufferSize = audioCtxRef.current.sampleRate * 2; // 2 seconds buffer
    const buffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Compensate for gain
    }

    const noise = audioCtxRef.current.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    noise.connect(gainNodeRef.current);
    noise.start();
    noiseNodeRef.current = noise;
  };

  const playBinaural = () => {
    stopAudio();
    initAudio();
    // 40Hz Gamma (Focus)
    // Left: 200Hz, Right: 240Hz
    
    const createOsc = (freq, pan) => {
        const osc = audioCtxRef.current.createOscillator();
        const panner = audioCtxRef.current.createStereoPanner();
        osc.frequency.value = freq;
        osc.type = 'sine';
        osc.connect(panner);
        panner.pan.value = pan;
        panner.connect(gainNodeRef.current);
        osc.start();
        return osc;
    };

    oscNodesRef.current = [
        createOsc(200, -1), // Left Ear
        createOsc(240, 1)   // Right Ear (40Hz diff)
    ];
  };

  useEffect(() => {
    if (!isActive) {
        stopAudio();
        return;
    }
    
    if (audioMode === 'brown') playBrownNoise();
    else if (audioMode === 'binaural') playBinaural();
    else stopAudio();

    return () => stopAudio();
  }, [isActive, audioMode]);

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
            if (time <= 1) {
                setIsActive(false);
                if (onSessionComplete) onSessionComplete(duration, task, selectedTag);
                
                // Play Sound
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => console.log("Audio play failed", e));
                
                // Send Notification
                sendNotification("Focus Session Complete", {
                    body: `Great job! You focused for ${duration} minutes on ${task || 'your task'}.`,
                    requireInteraction: true
                });

                return 0;
            }
            return time - 1;
        });
      }, 1000);
    } else if (!isActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, duration, task, selectedTag, onSessionComplete]);

  const toggleTimer = () => {
    if (!isActive) initAudio(); // Ensure audio context is ready
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
  };

  const handleDurationChange = (mins) => {
    setDuration(mins);
    setIsActive(false);
    setTimeLeft(mins * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <div className="flex flex-col h-full animate-fade-in pb-24 relative md:pb-0 md:justify-center">
      <div className="flex items-center gap-3 mb-6 md:absolute md:top-6 md:left-6">
        <div className="p-2 bg-cyan-500/10 rounded-full text-cyan-400 border border-cyan-500/20">
          <Brain size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-white">Deep Work</h2>
            <p className="text-zinc-400 text-xs">Phase 1: High Dopamine</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:gap-20 max-w-5xl mx-auto w-full">
        
        {/* Timer Display */}
        <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center flex-shrink-0">
            {/* Progress Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                    cx="50%"
                    cy="50%"
                    r="46%"
                    stroke="#27272a" // zinc-800
                    strokeWidth="4"
                    fill="transparent"
                />
                <circle
                    cx="50%"
                    cy="50%"
                    r="46%"
                    stroke="#06b6d4" // cyan-500
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 46}%`} // Approximate based on percentage
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}%`} // SVG dashoffset relative to percent
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                    style={{ strokeDasharray: '289%', strokeDashoffset: `${289 * (1 - progress/100)}%` }} // Fallback manual calc if % fails in some browsers, but let's stick to simple px for radius if we want exact scaling.
                    // Actually, let's revert to px based on container size or use viewBox properly.
                />
            </svg>
            {/* Re-implementing SVG with ViewBox for scaling */}
            <svg viewBox="0 0 256 256" className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="128" cy="128" r="120" stroke="#27272a" strokeWidth="8" fill="transparent" />
                <circle 
                    cx="128" cy="128" r="120" stroke="#06b6d4" strokeWidth="12" fill="transparent"
                    strokeDasharray={2 * Math.PI * 120}
                    strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                />
            </svg>

            <div className="z-10 text-center flex flex-col items-center">
                <div className="text-6xl md:text-8xl font-mono font-bold text-white tracking-tighter mb-4 tabular-nums transition-all">
                    {formatTime(timeLeft)}
                </div>
                
                {/* Controls */}
                <div className="flex items-center gap-6">
                    <button 
                        onClick={toggleTimer}
                        className={`p-4 md:p-6 rounded-full transition-all active:scale-95 flex items-center justify-center
                            ${isActive 
                                ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' 
                                : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'}`}
                    >
                        {isActive ? <Pause size={28} className="md:w-8 md:h-8" fill="currentColor" /> : <Play size={28} className="md:w-8 md:h-8 ml-1" fill="currentColor" />}
                    </button>
                    
                    <button 
                        onClick={resetTimer}
                        className="p-3 md:p-4 rounded-full bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-all"
                    >
                        <RotateCcw size={18} className="md:w-6 md:h-6" />
                    </button>
                </div>
            </div>
        </div>

        {/* Right Column: Controls & Settings */}
        <div className="flex flex-col gap-6 w-full max-w-sm px-4 md:px-0">
            
            {/* Task Input */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-cyan-400 transition-colors">
                    <Tag size={16} />
                </div>
                <input 
                    type="text" 
                    placeholder="What are you working on?" 
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    disabled={isActive}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all text-center text-lg font-medium"
                />
            </div>

            {/* Task Tag Selection */}
            {!isActive && (
              <div className="">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient md:flex-wrap md:justify-center">
                  {TASK_TAGS.map(tag => {
                    const Icon = tag.icon;
                    const isSelected = selectedTag === tag.id;
                    return (
                      <button
                        key={tag.id}
                        onClick={() => setSelectedTag(tag.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all
                          ${isSelected 
                            ? 'bg-cyan-500 text-black border-cyan-500' 
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'}`}
                      >
                        <Icon size={14} />
                        {tag.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Duration Select */}
            {!isActive && (
                <div className="flex gap-2 justify-center">
                    {DURATIONS.map(d => (
                        <button
                            key={d.min}
                            onClick={() => handleDurationChange(d.min)}
                            className={`px-6 py-3 rounded-xl text-sm font-bold border transition-all
                                ${duration === d.min 
                                    ? 'bg-zinc-800 text-white border-zinc-600 shadow-lg' 
                                    : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'}`}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Audio Controls */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                        <Headphones size={14} /> Soundscape
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                    {AUDIO_MODES.map(mode => {
                        const Icon = mode.icon;
                        const isSelected = audioMode === mode.id;
                        return (
                            <button
                                key={mode.id}
                                onClick={() => setAudioMode(mode.id)}
                                className={`flex flex-col items-center gap-3 p-3 rounded-xl border transition-all
                                    ${isSelected 
                                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' 
                                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}
                            >
                                <Icon size={24} />
                                <span className="text-[10px] font-bold">{mode.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}