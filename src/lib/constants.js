import { Star, Sunrise, Clock, Flame, Dumbbell, Crown, Zap } from 'lucide-react';

export const calculateStreak = (entries) => {
  if (!entries.length) return 0;
  const dates = [...new Set(entries.map(e => new Date(e.timestamp).toDateString()))];
  dates.sort((a, b) => new Date(b) - new Date(a));
    
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
    
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let currentDate = new Date(dates[0]);
    
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    const diff = Math.abs(currentDate - d);
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24)); 
    
    if (i === 0) {
       streak++;
    } else {
       if (diffDays <= 1) {
         streak++;
         currentDate = d;
       } else {
         break;
       }
    }
  }
  return streak;
};

export const ACHIEVEMENTS = [
  {
    id: 'novice_logger',
    title: 'First Step',
    desc: 'Log your first entry of any kind.',
    icon: Star,
    tier: 'bronze',
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    desc: 'Log a workout before 8 AM.',
    icon: Sunrise,
    tier: 'bronze',
    check: (entries) => entries.some(e => e.type === 'workout' && new Date(e.timestamp).getHours() < 8 && new Date(e.timestamp).getHours() > 3)
  },
  {
    id: 'fasting_initiate',
    title: '16:8 Club',
    desc: 'Reach a 16-hour fast.',
    icon: Clock,
    tier: 'silver',
    check: (entries, fastHrs) => fastHrs >= 16
  },
  {
    id: 'streak_3',
    title: 'On Fire',
    desc: 'Log entries 3 days in a row.',
    icon: Flame,
    tier: 'silver',
    check: (entries) => calculateStreak(entries) >= 3
  },
  {
    id: 'gym_rat',
    title: 'Gym Rat',
    desc: 'Log 10 total workouts.',
    icon: Dumbbell,
    tier: 'silver',
    check: (entries) => entries.filter(e => e.type === 'workout').length >= 10
  },
  {
    id: 'fasting_master',
    title: 'OMAD Legend',
    desc: 'Complete a 23-hour fast.',
    icon: Crown,
    tier: 'gold',
    check: (entries, fastHrs) => fastHrs >= 23
  },
  {
    id: 'streak_7',
    title: 'Unstoppable',
    desc: 'Log entries 7 days in a row.',
    icon: Zap,
    tier: 'gold',
    check: (entries) => calculateStreak(entries) >= 7
  }
];
