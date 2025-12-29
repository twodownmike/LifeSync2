import React, { useMemo } from 'react';

/**
 * A responsive Line Chart for Fasting Trends
 * @param {Array} data - Array of { label: string, value: number, date: string }
 * @param {number} goal - Target value line
 */
export const FastingTrendChart = ({ data, goal }) => {
  if (!data || data.length === 0) return <div className="h-40 flex items-center justify-center text-zinc-600 text-xs">No Data</div>;

  // Calculate scales
  const values = data.map(d => d.value);
  const minVal = Math.min(...values, goal) * 0.9;
  const maxVal = Math.max(...values, goal) * 1.1;
  const range = maxVal - minVal;

  const getY = (val) => {
    const pct = (val - minVal) / range;
    return 100 - (pct * 100); // SVG y is top-down
  };

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = getY(d.value);
    return `${x},${y}`;
  }).join(' ');

  const goalY = getY(goal);

  return (
    <div className="w-full h-48 lg:h-64 select-none">
       <div className="relative w-full h-full pb-6 pl-8 pr-4">
          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 h-full pb-6 flex flex-col justify-between text-[10px] text-zinc-600 font-mono">
             <span>{maxVal.toFixed(0)}h</span>
             <span>{goal}h</span>
             <span>{minVal.toFixed(0)}h</span>
          </div>

          {/* Chart Area */}
          <div className="relative w-full h-full border-l border-b border-zinc-800">
             
             {/* Goal Line */}
             <div 
               className="absolute w-full border-t border-dashed border-emerald-500/30 transition-all duration-500"
               style={{ top: `${goalY}%` }}
             ></div>

             {/* SVG Chart */}
             <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Area Gradient */}
                <defs>
                   <linearGradient id="fastingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                   </linearGradient>
                </defs>
                
                <path 
                   d={`M0,100 L0,${getY(data[0].value)} ${points.split(' ').map(p => `L${p}`).join(' ')} L100,${getY(data[data.length-1].value)} L100,100 Z`}
                   fill="url(#fastingGradient)"
                   className="transition-all duration-500 ease-in-out"
                />

                <polyline 
                   points={points} 
                   fill="none" 
                   stroke="#10b981" 
                   strokeWidth="2" 
                   vectorEffect="non-scaling-stroke"
                   className="transition-all duration-500 ease-in-out"
                />
                
                {data.map((d, i) => (
                   <circle 
                      key={i} 
                      cx={(i / (data.length - 1)) * 100} 
                      cy={getY(d.value)} 
                      r="1.5" 
                      className="fill-zinc-950 stroke-emerald-500 stroke-2 hover:r-4 transition-all duration-300 cursor-pointer"
                   >
                     <title>{d.date}: {d.value}h</title>
                   </circle>
                ))}
             </svg>
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between mt-2 px-0 text-[10px] text-zinc-500 font-mono uppercase">
             {data.map((d, i) => (
                <div key={i} className={`${i % 2 !== 0 ? 'hidden sm:block' : ''} text-center w-4`}>
                   {d.label}
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

/**
 * A responsive Bar Chart for Weekly Activity
 * @param {Array} data - Array of { label: string, meals: number, workouts: number, focus: number }
 */
export const ActivityBarChart = ({ data }) => {
   if (!data || data.length === 0) return <div className="h-40 flex items-center justify-center text-zinc-600 text-xs">No Data</div>;

   const maxValue = Math.max(...data.map(d => d.meals + d.workouts + d.focus), 5);

   return (
      <div className="w-full h-48 lg:h-64 select-none">
         <div className="w-full h-full flex flex-col justify-end gap-2 pb-6">
            <div className="flex-1 flex items-end justify-between gap-2 px-2">
               {data.map((d, i) => {
                  const total = d.meals + d.workouts + d.focus;
                  const hPct = Math.max((total / maxValue) * 100, 2);
                  
                  return (
                     <div key={i} className="flex-1 flex flex-col justify-end h-full group relative">
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-zinc-900 border border-zinc-800 text-[10px] p-2 rounded z-10 whitespace-nowrap shadow-xl pointer-events-none transition-opacity">
                           <div className="text-orange-400">Meals: {d.meals}</div>
                           <div className="text-emerald-400">Workouts: {d.workouts}</div>
                           <div className="text-cyan-400">Focus: {d.focus}</div>
                        </div>

                        {/* Stacked Bar */}
                        <div className="w-full bg-zinc-800/30 rounded-t-lg overflow-hidden flex flex-col justify-end transition-all duration-500 ease-out hover:bg-zinc-800/50" style={{ height: `${hPct}%` }}>
                           {d.focus > 0 && <div style={{ height: `${(d.focus/total)*100}%` }} className="bg-cyan-500/80 w-full" />}
                           {d.workouts > 0 && <div style={{ height: `${(d.workouts/total)*100}%` }} className="bg-emerald-500/80 w-full" />}
                           {d.meals > 0 && <div style={{ height: `${(d.meals/total)*100}%` }} className="bg-orange-500/80 w-full" />}
                        </div>
                     </div>
                  );
               })}
            </div>
            
            {/* Labels */}
            <div className="flex justify-between px-2 text-[10px] text-zinc-500 font-mono uppercase border-t border-zinc-800 pt-2">
               {data.map((d, i) => (
                  <div key={i} className="flex-1 text-center truncate">{d.label}</div>
               ))}
            </div>
         </div>
      </div>
   );
};

/**
 * A responsive Line Chart for Finance Trends
 * @param {Array} data - Array of { label: string, income: number, expense: number, date: string }
 */
export const FinanceChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-40 flex items-center justify-center text-zinc-600 text-xs">No Data</div>;

  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 100);

  return (
    <div className="w-full h-48 lg:h-64 select-none">
       <div className="w-full h-full flex flex-col justify-end gap-2 pb-6">
          <div className="flex-1 flex items-end justify-between gap-1 px-1">
             {data.map((d, i) => {
                const incomePct = (d.income / maxVal) * 100;
                const expensePct = (d.expense / maxVal) * 100;
                
                return (
                   <div key={i} className="flex-1 flex flex-col justify-end h-full group relative gap-0.5">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-zinc-900 border border-zinc-800 text-[10px] p-2 rounded z-10 whitespace-nowrap shadow-xl pointer-events-none transition-opacity">
                         <div className="text-zinc-400 font-bold mb-1">{d.date}</div>
                         <div className="text-emerald-400">In: ${d.income}</div>
                         <div className="text-rose-400">Out: ${d.expense}</div>
                      </div>

                      {/* Bars */}
                      <div className="w-full flex gap-0.5 items-end h-full">
                          <div 
                            className="flex-1 bg-emerald-500/50 hover:bg-emerald-500 rounded-t-sm transition-all" 
                            style={{ height: `${Math.max(incomePct, 1)}%` }} 
                          />
                          <div 
                            className="flex-1 bg-rose-500/50 hover:bg-rose-500 rounded-t-sm transition-all" 
                            style={{ height: `${Math.max(expensePct, 1)}%` }} 
                          />
                      </div>
                   </div>
                );
             })}
          </div>
          
          {/* Labels */}
          <div className="flex justify-between px-2 text-[10px] text-zinc-500 font-mono uppercase border-t border-zinc-800 pt-2">
             {data.map((d, i) => (
                <div key={i} className={`flex-1 text-center truncate ${i % 5 !== 0 ? 'hidden md:block' : ''}`}>{d.label}</div>
             ))}
          </div>
       </div>
    </div>
  );
};

export const StatCard = ({ icon: Icon, label, value, subtext, color = "text-emerald-500" }) => (
   <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
         <Icon size={14} className={color} /> {label}
      </div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      <div className="text-[10px] text-zinc-500">{subtext}</div>
   </div>
);

export const ActivityHeatmap = ({ entries }) => {
   const last28Days = useMemo(() => Array.from({length: 28}, (_, i) => {
       const d = new Date();
       d.setDate(d.getDate() - (27 - i));
       return d.toISOString().split('T')[0];
   }), []);
 
   const activityByDate = useMemo(() => entries.reduce((acc, entry) => {
       const date = new Date(entry.timestamp).toISOString().split('T')[0];
       acc[date] = (acc[date] || 0) + 1;
       return acc;
   }, {}), [entries]);
 
   return (
      <div>
          <div className="grid grid-cols-7 gap-2 mb-2">
             {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-zinc-600 font-bold">{d}</div>
             ))}
          </div>
 
          <div className="grid grid-cols-7 gap-2">
             {/* Padding for first week alignment */}
             {Array.from({ length: new Date(last28Days[0]).getDay() }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square"></div>
             ))}
 
             {last28Days.map((dateStr) => {
                 const count = activityByDate[dateStr] || 0;
                 let bgClass = 'bg-zinc-800/50';
                 if (count > 0) bgClass = 'bg-emerald-500/30 border-emerald-500/50';
                 if (count > 2) bgClass = 'bg-emerald-500/60 border-emerald-500/80';
                 if (count > 4) bgClass = 'bg-emerald-500 border-emerald-400';
                 
                 return (
                     <div key={dateStr} className={`aspect-square rounded-md border border-transparent transition-all ${bgClass} relative group`}>
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap border border-zinc-800 pointer-events-none z-10 shadow-xl">
                           {new Date(dateStr).toLocaleDateString(undefined, {weekday: 'short', month:'short', day:'numeric'})}: {count} entries
                        </div>
                     </div>
                 )
             })}
          </div>
      </div>
   );
};

export const MoodTrendChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-40 flex items-center justify-center text-zinc-600 text-xs">No Data</div>;

  // Scales
  const getY = (val) => 100 - (val * 10); // 0-10 scale mapped to 100-0%
  
  const moodPoints = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = getY(d.mood);
    return `${x},${y}`;
  }).join(' ');

  const energyPoints = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = getY(d.energy);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-48 lg:h-64 select-none relative">
       <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-zinc-600 font-mono pb-6 pl-1">
          <span>10</span>
          <span>5</span>
          <span>0</span>
       </div>
       
       <div className="w-full h-full pb-6 pl-6 pr-4 relative">
          <div className="w-full h-full border-l border-b border-zinc-800 relative">
             <div className="absolute top-1/2 w-full border-t border-dashed border-zinc-800/50"></div>
             
             <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Mood Line */}
                <polyline 
                   points={moodPoints} 
                   fill="none" 
                   stroke="#8b5cf6" // Violet
                   strokeWidth="2" 
                   vectorEffect="non-scaling-stroke"
                   className="opacity-80"
                />
                {/* Energy Line */}
                <polyline 
                   points={energyPoints} 
                   fill="none" 
                   stroke="#eab308" // Yellow
                   strokeWidth="2" 
                   vectorEffect="non-scaling-stroke"
                   className="opacity-80"
                />

                {/* Points */}
                {data.map((d, i) => (
                   <g key={i}>
                     <circle cx={(i / (data.length - 1)) * 100} cy={getY(d.mood)} r="2" className="fill-zinc-950 stroke-violet-500 stroke-2" />
                     <circle cx={(i / (data.length - 1)) * 100} cy={getY(d.energy)} r="2" className="fill-zinc-950 stroke-yellow-500 stroke-2" />
                   </g>
                ))}
             </svg>
          </div>

          <div className="flex justify-between mt-2 text-[10px] text-zinc-500 font-mono">
             {data.map((d, i) => (
                <div key={i} className={`${i % 3 !== 0 ? 'hidden' : 'block'}`}>
                   {d.date}
                </div>
             ))}
          </div>
       </div>

       {/* Legend */}
       <div className="absolute top-0 right-0 flex gap-3 text-[10px] font-bold">
          <div className="flex items-center gap-1 text-violet-400"><div className="w-2 h-2 rounded-full bg-violet-500"></div> Mood</div>
          <div className="flex items-center gap-1 text-yellow-500"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Energy</div>
       </div>
    </div>
  );
};

export const TagDistributionChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-40 flex items-center justify-center text-zinc-600 text-xs">No Data</div>;

  const maxVal = Math.max(...data.map(d => d.count));

  return (
    <div className="space-y-3 pt-2">
       {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
             <div className="w-24 text-xs text-zinc-400 truncate text-right font-medium">{item.tag}</div>
             <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500/50 rounded-full"
                  style={{ width: `${(item.count / maxVal) * 100}%` }}
                ></div>
             </div>
             <div className="w-8 text-xs text-zinc-500 font-mono">{item.count}</div>
          </div>
       ))}
    </div>
  );
};

export const WeightChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-40 flex items-center justify-center text-zinc-600 text-xs">No Data</div>;

  const weights = data.map(d => d.value);
  const minW = Math.min(...weights) - 5;
  const maxW = Math.max(...weights) + 5;
  const range = maxW - minW;

  const getY = (val) => 100 - ((val - minW) / range) * 100;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = getY(d.value);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-48 lg:h-64 select-none relative">
       <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-zinc-600 font-mono pb-6 pl-1">
          <span>{maxW.toFixed(0)}</span>
          <span>{minW.toFixed(0)}</span>
       </div>
       
       <div className="w-full h-full pb-6 pl-8 pr-4 relative">
          <div className="w-full h-full border-l border-b border-zinc-800 relative">
             <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline 
                   points={points} 
                   fill="none" 
                   stroke="#3b82f6" // Blue-500
                   strokeWidth="2" 
                   vectorEffect="non-scaling-stroke"
                />
                <defs>
                   <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                   </linearGradient>
                </defs>
                <path 
                   d={`M0,100 L0,${getY(data[0].value)} ${points.split(' ').map(p => `L${p}`).join(' ')} L100,${getY(data[data.length-1].value)} L100,100 Z`}
                   fill="url(#weightGradient)"
                />
                
                {data.map((d, i) => (
                   <circle 
                      key={i}
                      cx={(i / (data.length - 1)) * 100} 
                      cy={getY(d.value)} 
                      r="2" 
                      className="fill-zinc-950 stroke-blue-500 stroke-2" 
                   />
                ))}
             </svg>
          </div>

          <div className="flex justify-between mt-2 text-[10px] text-zinc-500 font-mono">
             {data.map((d, i) => (
                <div key={i} className={`${i % Math.ceil(data.length/5) !== 0 ? 'hidden' : 'block'}`}>
                   {d.date}
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};
