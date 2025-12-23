import { useState, useEffect, useMemo } from 'react';

export function useFasting(entries, userSettings) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000); 
    return () => clearInterval(timer);
  }, []);

  const lastMeal = useMemo(() => {
    return entries.find(e => e.type === 'meal');
  }, [entries]);

  const fastingData = useMemo(() => {
    if (!lastMeal) return { hours: 0, minutes: 0, seconds: 0, progress: 0, label: "Start your first fast" };
      
    const lastMealDate = new Date(lastMeal.timestamp);
    const diffMs = currentTime - lastMealDate;
    // Protect against future dates causing negative
    const safeDiffMs = Math.max(0, diffMs); 

    const diffHrs = Math.floor(safeDiffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((safeDiffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((safeDiffMs % (1000 * 60)) / 1000);
      
    const goal = userSettings.fastingGoal > 0 ? userSettings.fastingGoal : 16;
    const progress = Math.min((diffHrs / goal) * 100, 100);

    let label = "Fat Burning Zone";
    if (diffHrs < 4) label = "Digesting";
    else if (diffHrs < 12) label = "Normal State";
    else if (diffHrs > 18) label = "Autophagy";

    return { hours: diffHrs, minutes: diffMins, seconds: diffSecs, progress, label };
  }, [lastMeal, currentTime, userSettings.fastingGoal]);

  const bioPhase = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 7 && hour < 15) return { id: 1, title: "Phase 1", desc: "Deep Work", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" };
    if (hour >= 15 && hour < 23) return { id: 2, title: "Phase 2", desc: "Creative", color: "text-violet-400 border-violet-500/30 bg-violet-500/10" };
    return { id: 3, title: "Phase 3", desc: "Rest", color: "text-zinc-400 border-zinc-500/30 bg-zinc-500/10" };
  }, [currentTime]);

  return { fastingData, bioPhase, currentTime, lastMeal };
}
