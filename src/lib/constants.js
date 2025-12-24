import { 
  Star, Sunrise, Clock, Flame, Dumbbell, Crown, Zap, 
  Brain, Book, Calendar, Medal, Trophy, Mountain, Target, 
  Sword, Shield, Activity, Wind 
} from 'lucide-react';

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
  // --- BRONZE TIER (Beginner) ---
  {
    id: 'novice_logger',
    title: 'First Step',
    desc: 'Log your first entry of any kind.',
    icon: Star,
    tier: 'bronze',
    points: 10,
    check: (entries) => entries.length > 0
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    desc: 'Log a workout before 8 AM.',
    icon: Sunrise,
    tier: 'bronze',
    points: 10,
    check: (entries) => entries.some(e => e.type === 'workout' && new Date(e.timestamp).getHours() < 8 && new Date(e.timestamp).getHours() > 3)
  },
  {
    id: 'mindful_start',
    title: 'Mindful Start',
    desc: 'Complete your first Breathwork session.',
    icon: Wind,
    tier: 'bronze',
    points: 10,
    check: (entries) => entries.some(e => e.type === 'breathwork')
  },
  {
    id: 'focus_initiate',
    title: 'In The Zone',
    desc: 'Complete your first Focus Session.',
    icon: Brain,
    tier: 'bronze',
    points: 10,
    check: (entries) => entries.some(e => e.type === 'work_session')
  },
  {
    id: 'journal_habit',
    title: 'Dear Diary',
    desc: 'Log 3 journal entries.',
    icon: Book,
    tier: 'bronze',
    points: 10,
    check: (entries) => entries.filter(e => e.type === 'journal').length >= 3
  },

  // --- SILVER TIER (Intermediate) ---
  {
    id: 'fasting_initiate',
    title: '16:8 Club',
    desc: 'Reach a 16-hour fast.',
    icon: Clock,
    tier: 'silver',
    points: 25,
    check: (entries, fastHrs) => fastHrs >= 16
  },
  {
    id: 'streak_3',
    title: 'On Fire',
    desc: 'Log entries 3 days in a row.',
    icon: Flame,
    tier: 'silver',
    points: 25,
    check: (entries) => calculateStreak(entries) >= 3
  },
  {
    id: 'gym_rat',
    title: 'Gym Rat',
    desc: 'Log 10 total workouts.',
    icon: Dumbbell,
    tier: 'silver',
    points: 25,
    check: (entries) => entries.filter(e => e.type === 'workout').length >= 10
  },
  {
    id: 'zen_student',
    title: 'Zen Student',
    desc: 'Complete 5 Breathwork sessions.',
    icon: Wind,
    tier: 'silver',
    points: 25,
    check: (entries) => entries.filter(e => e.type === 'breathwork').length >= 5
  },
  {
    id: 'deep_worker',
    title: 'Deep Worker',
    desc: 'Accumulate 5 hours of Focus time.',
    icon: Brain,
    tier: 'silver',
    points: 25,
    check: (entries) => entries.reduce((acc, e) => e.type === 'work_session' ? acc + (parseInt(e.duration)||0) : acc, 0) >= 300
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    desc: 'Log workouts on Saturday and Sunday of the same weekend.',
    icon: Calendar,
    tier: 'silver',
    points: 25,
    check: (entries) => {
       const workouts = entries.filter(e => e.type === 'workout');
       const saturdays = workouts.filter(e => new Date(e.timestamp).getDay() === 6);
       return saturdays.some(sat => {
           const satDate = new Date(sat.timestamp);
           const sunDate = new Date(satDate);
           sunDate.setDate(satDate.getDate() + 1);
           return workouts.some(w => new Date(w.timestamp).toDateString() === sunDate.toDateString());
       });
    }
  },

  // --- GOLD TIER (Advanced) ---
  {
    id: 'fasting_master',
    title: 'OMAD Legend',
    desc: 'Complete a 23-hour fast.',
    icon: Crown,
    tier: 'gold',
    points: 50,
    check: (entries, fastHrs) => fastHrs >= 23
  },
  {
    id: 'streak_7',
    title: 'Unstoppable',
    desc: 'Log entries 7 days in a row.',
    icon: Zap,
    tier: 'gold',
    points: 50,
    check: (entries) => calculateStreak(entries) >= 7
  },
  {
    id: 'iron_born',
    title: 'Iron Born',
    desc: 'Log 25 total workouts.',
    icon: Dumbbell,
    tier: 'gold',
    points: 50,
    check: (entries) => entries.filter(e => e.type === 'workout').length >= 25
  },
  {
    id: 'monk_mode',
    title: 'Monk Mode',
    desc: 'Complete 20 Breathwork sessions.',
    icon: Wind,
    tier: 'gold',
    points: 50,
    check: (entries) => entries.filter(e => e.type === 'breathwork').length >= 20
  },
  {
    id: 'productivity_beast',
    title: 'Productivity Beast',
    desc: 'Accumulate 20 hours of Focus time.',
    icon: Target,
    tier: 'gold',
    points: 50,
    check: (entries) => entries.reduce((acc, e) => e.type === 'work_session' ? acc + (parseInt(e.duration)||0) : acc, 0) >= 1200
  },
  {
    id: 'consistent_logger',
    title: 'Consistency King',
    desc: 'Log entries 14 days in a row.',
    icon: Calendar,
    tier: 'gold',
    points: 50,
    check: (entries) => calculateStreak(entries) >= 14
  },

  // --- PLATINUM TIER (Expert) ---
  {
    id: 'streak_30',
    title: 'Habit Master',
    desc: 'Log entries 30 days in a row.',
    icon: Medal,
    tier: 'platinum',
    points: 100,
    check: (entries) => calculateStreak(entries) >= 30
  },
  {
    id: 'autophagy_expert',
    title: 'Autophagy Expert',
    desc: 'Complete a 36-hour fast.',
    icon: Shield,
    tier: 'platinum',
    points: 100,
    check: (entries, fastHrs) => fastHrs >= 36
  },
  {
    id: 'spartan',
    title: 'Spartan',
    desc: 'Log 50 total workouts.',
    icon: Sword,
    tier: 'platinum',
    points: 100,
    check: (entries) => entries.filter(e => e.type === 'workout').length >= 50
  },
  {
    id: 'awakened',
    title: 'Awakened',
    desc: 'Complete 50 Breathwork sessions.',
    icon: Wind,
    tier: 'platinum',
    points: 100,
    check: (entries) => entries.filter(e => e.type === 'breathwork').length >= 50
  },
  {
    id: 'deep_work_god',
    title: 'Deep Work God',
    desc: 'Accumulate 50 hours of Focus time.',
    icon: Brain,
    tier: 'platinum',
    points: 100,
    check: (entries) => entries.reduce((acc, e) => e.type === 'work_session' ? acc + (parseInt(e.duration)||0) : acc, 0) >= 3000
  },
  {
    id: 'century_club',
    title: 'Century Club',
    desc: 'Log 100 total entries of any kind.',
    icon: Trophy,
    tier: 'platinum',
    points: 100,
    check: (entries) => entries.length >= 100
  },

  // --- DIAMOND TIER (Insane) ---
  {
    id: 'streak_100',
    title: 'Lifestyle Legend',
    desc: 'Log entries 100 days in a row.',
    icon: Mountain,
    tier: 'diamond',
    points: 250,
    check: (entries) => calculateStreak(entries) >= 100
  },
  {
    id: 'fasting_god',
    title: 'Fasting God',
    desc: 'Complete a 72-hour fast.',
    icon: Crown,
    tier: 'diamond',
    points: 250,
    check: (entries, fastHrs) => fastHrs >= 72
  },
  {
    id: 'olympian',
    title: 'Olympian',
    desc: 'Log 100 total workouts.',
    icon: Medal,
    tier: 'diamond',
    points: 250,
    check: (entries) => entries.filter(e => e.type === 'workout').length >= 100
  },
  {
    id: 'enlightened',
    title: 'Enlightened',
    desc: 'Complete 100 Breathwork sessions.',
    icon: Activity,
    tier: 'diamond',
    points: 250,
    check: (entries) => entries.filter(e => e.type === 'breathwork').length >= 100
  },
  {
    id: 'master_of_time',
    title: 'Master of Time',
    desc: 'Accumulate 100 hours of Focus time.',
    icon: Clock,
    tier: 'diamond',
    points: 250,
    check: (entries) => entries.reduce((acc, e) => e.type === 'work_session' ? acc + (parseInt(e.duration)||0) : acc, 0) >= 6000
  },
  {
    id: 'life_synced',
    title: 'Life Synced',
    desc: 'Log 500 total entries.',
    icon: Star,
    tier: 'diamond',
    points: 250,
    check: (entries) => entries.length >= 500
  }
];
