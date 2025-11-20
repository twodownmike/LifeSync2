import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Minus, 
  Utensils, 
  Dumbbell, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Home, 
  X, 
  Trash2,
  Activity,
  User,
  Settings,
  Zap,
  ChevronRight,
  Calendar,
  Info,
  Edit2,
  Trophy,
  Medal,
  Star,
  Flame,
  Sunrise,
  Moon,
  Crown,
  Award,
  Smartphone,
  Brain,
  Gamepad2,
  ShoppingBag,
  Coffee,
  Shield,
  Scroll,
  Sun,
  LogOut,
  LogIn,
  Sparkles,
  Key
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  setDoc,
} from 'firebase/firestore';

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyBODxsazcWZiANa_3eTjPL3ZZNVMdnaDvQ",
  authDomain: "lifesync-91884.firebaseapp.com",
  projectId: "lifesync-91884",
  storageBucket: "lifesync-91884.firebasestorage.app",
  messagingSenderId: "481070215124",
  appId: "1:481070215124:web:4a6c1185bbd77099cbf041"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = 'lifesync-91884';

// --- Constants & Data ---

const MANTRAS = [
  "This is hard, but that’s what makes it rewarding.",
  "This is what hard feels like. This is where most people quit.",
  "The faster I do the hard thing, the faster I get the good thing.",
  "Effort is the reward.",
  "Every time you try, you’ve already won."
];

const PRINCIPLES = [
  { title: "1. Defaults to Ease", text: "A depleted brain defaults to ease. Fast dopamine (scrolling, junk food) drains you below baseline. Reduce it so your brain has the motivation it needs." },
  { title: "2. Reappraise Discomfort", text: "Discomfort is the price of admission. It's not a sign to stop. Tell yourself: 'This is hard, but that’s what makes it rewarding.'" },
  { title: "3. Win the Evening", text: "Your morning success is created the night before. Avoid fast dopamine in the evening so you don’t wake up depleted." },
  { title: "4. Structure Your Day", text: "Phase 1 (0-8h): Deep Work (High Dopamine). Phase 2 (9-16h): Creative/Social (High Serotonin). Phase 3 (17-24h): Wind-down." },
  { title: "5. Identity Requires Evidence", text: "You don’t 'become' someone who does hard things—you prove it to yourself through action. Cast votes for your identity daily." },
  { title: "6. Never Miss Twice", text: "Missing a day is normal. Missing twice creates a new pattern. Always return the next day." },
  { title: "7. The 5% Rule", text: "Intimidated? Shrink the task to where your willingness begins. Just put on gym clothes. Just open the notes." },
  { title: "8. Ritualize It", text: "Create a small action that signals your brain it’s time to start. Tea before studying. Cleaning desk before deep work." },
  { title: "9. Sustainable Pace", text: "Slow, sustainable consistency beats big bursts. A 30-minute daily habit beats one giant weekly effort." },
  { title: "10. Discipline Paradox", text: "Effort and reward are not separate. The reward comes from the effort. Every time you try, you’ve already won." },
  { title: "11. Self-Negotiation", text: "Don't suppress the urge to quit—negotiate with it. Label the need, explore it, and find a compromise." }
];

const ACHIEVEMENTS = [
  {
    id: 'novice_logger',
    title: 'First Step',
    desc: 'Log your first entry of any kind.',
    icon: Star,
    tier: 'bronze',
    check: (entries, fastHrs, detoxHrs) => entries.length > 0
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
    id: 'monk_mode',
    title: 'Monk Mode',
    desc: 'Complete a 1-hour dopamine detox.',
    icon: Brain,
    tier: 'bronze',
    check: (entries) => entries.some(e => e.type === 'detox' && e.duration >= 60)
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
    id: 'digital_ghost',
    title: 'Digital Ghost',
    desc: 'Complete a 4-hour detox session.',
    icon: Smartphone,
    tier: 'gold',
    check: (entries) => entries.some(e => e.type === 'detox' && e.duration >= 240)
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

// Helper to calc streak
const calculateStreak = (entries) => {
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

// --- Components ---

const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, variant = "primary", children, className = "", icon: Icon, disabled }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  const variants = {
    primary: "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20",
    secondary: "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
    ghost: "bg-transparent text-zinc-400 hover:text-zinc-200",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
    cyan: "bg-cyan-500 text-zinc-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20",
    purple: "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20",
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const StatBar = ({ label, value, max, color }) => (
  <div className="flex flex-col gap-1 mb-3">
    <div className="flex justify-between text-xs text-zinc-400">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full ${color} transition-all duration-500`} 
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }} 
      />
    </div>
  </div>
);

// --- Main App Component ---

export default function LifeSync() {
  // App State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [entries, setEntries] = useState([]);
  const [userSettings, setUserSettings] = useState({ 
    displayName: 'Guest', 
    fastingGoal: 16,
    fitnessGoal: '', // New
    dietaryPreferences: '', // New
    unlockedAchievements: [],
    activeDetox: null 
  });
  
  // API Key Management (LocalStorage for security)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('lifesync_openai_key') || '');
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false); 
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false); 
  const [isManifestoOpen, setIsManifestoOpen] = useState(false); 
  const [modalType, setModalType] = useState(null); 
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [newUnlock, setNewUnlock] = useState(null); 
  const [currentMantra, setCurrentMantra] = useState(MANTRAS[0]);
  
  // AI Coach State
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachResponse, setCoachResponse] = useState(null);

  // Form States
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [tempGoal, setTempGoal] = useState(16); 

  // Workout Builder State
  const [exercises, setExercises] = useState([]); 
  const [exName, setExName] = useState('');
  const [exWeight, setExWeight] = useState('');
  const [exReps, setExReps] = useState('');

  // --- Authentication & Initial Setup ---

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth failed:", error);
      } finally {
        setAuthLoading(false);
      }
    };
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthLoading(false);
        if (currentUser.displayName) {
          setUserSettings(prev => ({ ...prev, displayName: currentUser.displayName }));
        }
      } else {
        initAuth();
      }
    });
    return () => unsubscribe();
  }, []);

  // Save API Key to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lifesync_openai_key', apiKey);
  }, [apiKey]);

  // --- Google Auth Actions ---
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      alert("Could not sign in. Did you enable Google Auth in Firebase Console?");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // --- Data Fetching (Firestore) ---

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'entries');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      fetchedEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setEntries(fetchedEntries);
    }, (error) => console.error("Error fetching entries:", error));
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const settingsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    }, (error) => console.error("Error fetching settings:", error));
    return () => unsubscribe();
  }, [user]);

  // --- Realtime Clock ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000); 
    return () => clearInterval(timer);
  }, []);
   
  // Cycle Mantras every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMantra(MANTRAS[Math.floor(Math.random() * MANTRAS.length)]);
    }, 30000); 
    return () => clearInterval(timer);
  }, []);

  // --- Derived Logic Helpers ---

  const lastMeal = useMemo(() => {
    return entries.find(e => e.type === 'meal');
  }, [entries]);

  const fastingData = useMemo(() => {
    if (!lastMeal) return { hours: 0, minutes: 0, seconds: 0, progress: 0, label: "Start your first fast" };
     
    const lastMealDate = new Date(lastMeal.timestamp);
    const diffMs = currentTime - lastMealDate;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
     
    const goal = userSettings.fastingGoal || 16;
    const progress = Math.min((diffHrs / goal) * 100, 100);

    let label = "Fat Burning Zone";
    if (diffHrs < 4) label = "Digesting";
    else if (diffHrs < 12) label = "Normal State";
    else if (diffHrs > 18) label = "Autophagy";

    return { hours: diffHrs, minutes: diffMins, seconds: diffSecs, progress, label };
  }, [lastMeal, currentTime, userSettings.fastingGoal]);

  const detoxData = useMemo(() => {
    if (!userSettings.activeDetox) return null;
     
    const startTime = new Date(userSettings.activeDetox.startTime);
    const diffMs = currentTime - startTime;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

    return { hours: diffHrs, minutes: diffMins, seconds: diffSecs };
  }, [userSettings.activeDetox, currentTime]);

  // Bio Phase Logic
  const bioPhase = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 7 && hour < 15) return { id: 1, title: "Phase 1", desc: "Deep Work", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" };
    if (hour >= 15 && hour < 23) return { id: 2, title: "Phase 2", desc: "Creative", color: "text-violet-400 border-violet-500/30 bg-violet-500/10" };
    return { id: 3, title: "Phase 3", desc: "Rest", color: "text-zinc-400 border-zinc-500/30 bg-zinc-500/10" };
  }, [currentTime]);

  const stats = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentEntries = entries.filter(e => new Date(e.timestamp) > oneWeekAgo);
     
    const detoxMinutes = recentEntries
      .filter(e => e.type === 'detox')
      .reduce((acc, curr) => acc + (curr.duration || 0), 0);

    return {
      meals: recentEntries.filter(e => e.type === 'meal').length,
      workouts: recentEntries.filter(e => e.type === 'workout').length,
      journals: recentEntries.filter(e => e.type === 'journal').length,
      detox: Math.round(detoxMinutes / 60) // in hours
    };
  }, [entries]);

  // --- Achievement Logic ---

  useEffect(() => {
    if (!user || entries.length === 0) return;

    const currentUnlocked = userSettings.unlockedAchievements || [];
    let newUnlockId = null;
     
    const updatedUnlocked = [...currentUnlocked];
    let hasUpdates = false;

    ACHIEVEMENTS.forEach(achievement => {
      if (!currentUnlocked.includes(achievement.id)) {
        const isMet = achievement.check(entries, fastingData.hours);
        if (isMet) {
           updatedUnlocked.push(achievement.id);
           newUnlockId = achievement;
           hasUpdates = true;
        }
      }
    });

    if (hasUpdates) {
       const newSettings = { ...userSettings, unlockedAchievements: updatedUnlocked };
       setUserSettings(newSettings); 
       setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), newSettings)
         .catch(err => console.error("Failed to save achievements", err));
       
       if (newUnlockId) {
         setNewUnlock(newUnlockId);
         setTimeout(() => setNewUnlock(null), 4000);
       }
    }
  }, [entries, fastingData.hours, user, userSettings]);


  // --- Actions ---

  const handleAddEntry = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const newEntry = {
        type: modalType,
        title: title || (modalType === 'meal' ? 'Quick Meal' : modalType === 'workout' ? 'Workout' : 'Journal Entry'),
        note,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        timestamp: new Date(entryTime).toISOString(),
        // Save exercises only if workout type
        ...(modalType === 'workout' && { exercises: exercises }) 
      };

      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'entries'), newEntry);
      closeModal();
    } catch (err) {
      console.error("Error adding document:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const addExerciseToSession = () => {
    if (!exName) return;
    const newEx = {
      id: Date.now(), // temp id
      name: exName,
      weight: exWeight,
      reps: exReps
    };
    setExercises([...exercises, newEx]);
    setExWeight('');
    setExReps('');
    setExName(''); 
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const handleStartDetox = async (detoxType) => {
    if (!user) return;
    const newSettings = { 
      ...userSettings, 
      activeDetox: { 
        type: detoxType, 
        startTime: new Date().toISOString() 
      } 
    };
    setUserSettings(newSettings);
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), newSettings);
  };

  const handleEndDetox = async () => {
    if (!user || !userSettings.activeDetox) return;
    setIsSaving(true);

    try {
      const startTime = new Date(userSettings.activeDetox.startTime);
      const endTime = new Date();
      const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));

      if (durationMinutes >= 1) { // Only log if at least 1 minute
        const newEntry = {
          type: 'detox',
          title: `${userSettings.activeDetox.type} Detox`,
          note: `Completed a session of ${durationMinutes} minutes.`,
          tags: ['mindfulness', 'detox'],
          duration: durationMinutes,
          timestamp: endTime.toISOString(),
        };
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'entries'), newEntry);
      }

      const newSettings = { ...userSettings, activeDetox: null };
      setUserSettings(newSettings);
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), newSettings);

    } catch (err) {
      console.error("Error ending detox:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'entries', id));
    } catch (err) {
      console.error("Error deleting doc:", err);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), userSettings);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateGoal = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const newSettings = { ...userSettings, fastingGoal: tempGoal };
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), newSettings);
      setIsGoalModalOpen(false);
    } catch (err) {
      console.error("Error saving goal:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNote('');
    setTitle('');
    setTags('');
    setEntryTime('');
    setModalType(null);
    setExercises([]);
    setExName('');
    setExWeight('');
    setExReps('');
  };

  const openModal = (type) => {
    setIsTypeSelectorOpen(false);
    setModalType(type);
    setEntryTime(getCurrentLocalTime());
    setIsModalOpen(true);
  };

  const openGoalModal = () => {
    setTempGoal(userSettings.fastingGoal || 16);
    setIsGoalModalOpen(true);
  };

  const getCurrentLocalTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // --- AI Coach Functionality ---

  const handleAskCoach = async () => {
    if (!apiKey) {
      alert("Please enter your OpenAI API Key in Profile -> Settings.");
      return;
    }

    setCoachLoading(true);
    setCoachResponse(null);

    // 1. Construct Prompt Context
    const recentLogs = entries.slice(0, 8).map(e => 
      `- ${e.type.toUpperCase()} (${new Date(e.timestamp).toLocaleTimeString()}): ${e.title}. ${e.note || ''}`
    ).join('\n');

    const prompt = `
      You are LifeSync AI, an elite fitness and lifestyle coach using the "Dopamine Detox" protocol.
      
      User Profile:
      - Name: ${userSettings.displayName}
      - Goal: ${userSettings.fitnessGoal || 'General Health'}
      - Diet: ${userSettings.dietaryPreferences || 'None'}
      - Current Time: ${currentTime.toLocaleTimeString()}
      - Bio Phase: ${bioPhase.title} (${bioPhase.desc})
      - Fasting State: ${fastingData.label} (${fastingData.hours}h fasted)
      
      Recent Activity:
      ${recentLogs}

      Based on the time of day, their goal, and their recent logs, provide a concise, punchy recommendation in Markdown format.
      Include:
      1. **Next Meal Idea** (Specific to their diet & fasting state)
      2. **Workout Suggestion** (If they haven't workout out, or recovery if they have)
      3. **Mantra** (One line motivation)
    `;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: prompt }],
          max_tokens: 300
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      setCoachResponse(data.choices[0].message.content);

    } catch (error) {
      console.error("AI Error:", error);
      setCoachResponse(`Error: ${error.message}. Check your API Key in Settings.`);
    } finally {
      setCoachLoading(false);
    }
  };

  // --- Render Views ---

  const renderTimeline = () => (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Timeline</h2>
          <p className="text-zinc-400 text-sm mb-3">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${bioPhase.color}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider">{bioPhase.title}</span>
              <span className="w-1 h-1 rounded-full bg-current opacity-50"></span>
              <span className="text-[10px] opacity-90 font-medium">{bioPhase.desc}</span>
          </div>
        </div>
        
        <div onClick={() => setActiveTab('profile')} className="cursor-pointer flex items-center gap-2 bg-zinc-900/50 p-1 pr-3 rounded-full border border-zinc-800 hover:bg-zinc-800 transition-colors">
          <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden">
            {user?.photoURL ? (
               <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
            ) : (
               <span className="text-xs font-bold text-emerald-500">{userSettings.displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="text-xs font-medium text-zinc-300 max-w-[60px] truncate">{userSettings.displayName.split(' ')[0]}</span>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <div className="inline-block p-4 rounded-full bg-zinc-900 mb-4">
            <Activity className="text-zinc-500" size={32} />
          </div>
          <p className="text-zinc-400">No activity yet. Tap + to start.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-zinc-800 ml-4 space-y-8">
          {entries.map((entry) => (
            <div key={entry.id} className="relative pl-8">
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-zinc-950 
                ${entry.type === 'meal' ? 'bg-orange-400' : 
                  entry.type === 'workout' ? 'bg-emerald-400' : 
                  entry.type === 'detox' ? 'bg-cyan-400' : 'bg-violet-400'}`} 
              />
              <div className="flex justify-between items-start group">
                <div className="w-full">
                  <span className="text-xs font-mono text-zinc-500 mb-1 block">
                    {new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <h3 className="text-lg font-semibold text-zinc-200">{entry.title}</h3>
                  {entry.type === 'detox' && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded border border-cyan-500/30">
                       {entry.duration} mins
                    </span>
                  )}
                  {entry.exercises && entry.exercises.length > 0 && (
                    <div className="mt-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-3 space-y-2">
                      {entry.exercises.map((ex, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-zinc-300 font-medium">{ex.name}</span>
                          <span className="text-zinc-500 font-mono text-xs">
                            {ex.weight ? `${ex.weight}lbs` : ''} 
                            {ex.weight && ex.reps ? ' x ' : ''}
                            {ex.reps ? `${ex.reps} reps` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {entry.note && <p className="text-zinc-400 text-sm mt-2 whitespace-pre-wrap">{entry.note}</p>}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {entry.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => handleDelete(entry.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-600 hover:text-red-400 ml-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCoach = () => (
    <div className="flex flex-col h-full pb-24 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-500/20 rounded-full text-violet-400">
          <Sparkles size={24} />
        </div>
        <h2 className="text-2xl font-bold text-white">AI Coach</h2>
      </div>

      {!userSettings.fitnessGoal && !userSettings.dietaryPreferences ? (
         <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-200 text-sm mb-6">
            ⚠ Please fill out your Goals & Diet in Profile Settings to get the best advice.
         </div>
      ) : null}

      {!apiKey ? (
         <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center space-y-4">
            <Key className="mx-auto text-red-400" size={32} />
            <h3 className="font-bold text-white">API Key Missing</h3>
            <p className="text-sm text-zinc-400">To use the AI Coach securely, please enter your OpenAI API key in the Profile Settings.</p>
            <Button variant="secondary" onClick={() => setActiveTab('profile')} className="w-full">Go to Settings</Button>
         </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-6">
            {coachResponse ? (
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 animate-slide-up">
                <div className="flex justify-between items-start">
                   <h3 className="text-violet-400 font-bold uppercase tracking-widest text-xs">Your Action Plan</h3>
                   <button onClick={() => setCoachResponse(null)} className="text-zinc-500 hover:text-white"><X size={16}/></button>
                </div>
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-zinc-200 leading-relaxed">
                  {coachResponse}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center opacity-50 space-y-4">
                <Brain size={48} className="text-zinc-600" />
                <p className="text-zinc-500">Tap generate to analyze your logs and get a plan.</p>
              </div>
            )}
          </div>

          <Button 
            variant="purple" 
            onClick={handleAskCoach} 
            disabled={coachLoading} 
            className="w-full py-4 text-lg font-bold mt-4"
          >
            {coachLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"/>
                Analyzing...
              </span>
            ) : (
              "Generate Plan"
            )}
          </Button>
        </>
      )}
    </div>
  );

  const renderDetox = () => {
     const isActive = !!userSettings.activeDetox;

     if (isActive) {
       return (
         <div className="flex flex-col items-center justify-center h-full pb-20 animate-fade-in">
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
              <div className="absolute inset-0 rounded-full border-8 border-zinc-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30 animate-ping opacity-20"></div>
              <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-cyan-400"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="text-center z-10 flex flex-col items-center">
                <div className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-2">Focus Mode</div>
                <div className="text-5xl font-bold text-white font-mono tracking-tighter flex items-baseline">
                  <span>{detoxData?.hours}</span>
                  <span className="mx-1">:</span>
                  <span>{detoxData?.minutes.toString().padStart(2, '0')}</span>
                </div>
                <div className="text-2xl font-mono text-zinc-500 mt-1 font-bold">
                   {detoxData?.seconds.toString().padStart(2, '0')}
                </div>
              </div>
            </div>

            <div className="text-center mb-12 px-6">
              <p className="text-zinc-400 text-sm font-medium italic animate-pulse">
                "{currentMantra}"
              </p>
            </div>

            <Button variant="danger" onClick={handleEndDetox} className="w-full max-w-xs py-4 text-lg font-bold border border-red-500/30">
              End Session
            </Button>
         </div>
       )
     }

     return (
       <div className="flex flex-col h-full pb-24 animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-6">Dopamine Detox</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
             <button onClick={() => handleStartDetox('Social Media')} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl hover:bg-zinc-800 hover:border-cyan-500/50 transition-all group text-left">
                <Smartphone className="text-zinc-500 group-hover:text-cyan-400 mb-3 transition-colors" size={28} />
                <div className="font-bold text-white">Digital</div>
                <div className="text-xs text-zinc-500">Socials & scrolling</div>
             </button>
             <button onClick={() => handleStartDetox('Gaming')} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl hover:bg-zinc-800 hover:border-cyan-500/50 transition-all group text-left">
                <Gamepad2 className="text-zinc-500 group-hover:text-cyan-400 mb-3 transition-colors" size={28} />
                <div className="font-bold text-white">Gaming</div>
                <div className="text-xs text-zinc-500">Video games</div>
             </button>
             <button onClick={() => handleStartDetox('Shopping')} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl hover:bg-zinc-800 hover:border-cyan-500/50 transition-all group text-left">
                <ShoppingBag className="text-zinc-500 group-hover:text-cyan-400 mb-3 transition-colors" size={28} />
                <div className="font-bold text-white">Consumer</div>
                <div className="text-xs text-zinc-500">Online shopping</div>
             </button>
             <button onClick={() => handleStartDetox('Dopamine')} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl hover:bg-zinc-800 hover:border-cyan-500/50 transition-all group text-left">
                <Brain className="text-zinc-500 group-hover:text-cyan-400 mb-3 transition-colors" size={28} />
                <div className="font-bold text-white">Total Detox</div>
                <div className="text-xs text-zinc-500">No cheap thrills</div>
             </button>
          </div>

          {/* Protocol Card */}
          <div 
            onClick={() => setIsManifestoOpen(true)}
            className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-zinc-800 transition-colors mb-6 group"
          >
             <div className="p-3 bg-cyan-500/10 rounded-full text-cyan-400 group-hover:bg-cyan-500/20 group-hover:scale-105 transition-all">
               <Scroll size={24} />
             </div>
             <div className="flex-1">
               <h3 className="font-bold text-white">Dopamine Protocol</h3>
               <p className="text-xs text-zinc-500">Read the 11 rules for mental clarity.</p>
             </div>
             <ChevronRight className="text-zinc-600 group-hover:text-white" />
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/20 p-6 rounded-3xl mt-auto relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="font-bold text-cyan-400 text-lg mb-2">Why Detox?</h3>
               <p className="text-cyan-100/80 text-sm leading-relaxed">
                 Constant stimulation reduces your brain's sensitivity to dopamine. Taking a break resets your baseline, making hard things feel easier.
               </p>
             </div>
             <Shield className="absolute -bottom-4 -right-4 text-cyan-500/10" size={120} />
          </div>
       </div>
     )
  }

  const renderFasting = () => (
    <div className="flex flex-col items-center justify-center h-full pb-20 animate-fade-in relative">
      <div className="absolute top-0 right-0">
        <button 
          onClick={() => setIsInfoModalOpen(true)}
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
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-emerald-500 transition-all duration-1000 ease-linear" 
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - fastingData.progress / 100)}
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
          onClick={openGoalModal}
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

  const renderProfile = () => (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Profile</h2>
        <Button variant="ghost" onClick={() => setActiveTab('home')}>
          <X size={20} />
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700 text-2xl font-bold overflow-hidden">
          {user?.photoURL ? (
             <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
          ) : (
             <span>{userSettings.displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{userSettings.displayName}</h3>
          <p className="text-emerald-400 text-sm flex items-center gap-1 mb-1">
            {user?.isAnonymous ? "Guest Account" : "Logged in with Google"}
          </p>
          
          {/* Auth Buttons */}
          {user?.isAnonymous ? (
            <button 
              onClick={handleGoogleSignIn}
              className="flex items-center gap-2 text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold hover:bg-gray-200 transition-colors"
            >
              <LogIn size={12} />
              Sign in with Google
            </button>
          ) : (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full font-medium hover:bg-zinc-700 transition-colors"
            >
              <LogOut size={12} />
              Sign Out
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Trophy Cabinet */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
             <Trophy className="text-yellow-500" size={20} />
             Achievements
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((ach) => {
               const isUnlocked = (userSettings.unlockedAchievements || []).includes(ach.id);
               const Icon = ach.icon;
               const tierColors = {
                 bronze: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
                 silver: 'text-zinc-300 border-zinc-400/30 bg-zinc-400/10',
                 gold: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
               };
               
               return (
                 <div key={ach.id} className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all
                    ${isUnlocked ? `${tierColors[ach.tier]}` : 'border-zinc-800 bg-zinc-900/50 opacity-50 grayscale'}`}>
                    <div className="mb-2">
                       <Icon size={24} />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">{ach.title}</div>
                    {isUnlocked && <div className="text-[9px] leading-tight opacity-70 hidden sm:block">{ach.desc}</div>}
                 </div>
               )
            })}
          </div>
        </div>

        <Card>
          <div className="flex items-center gap-3 mb-4 text-emerald-400">
            <Settings size={20} />
            <h3 className="font-bold text-white">Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 font-medium uppercase block mb-2">Display Name</label>
              <input 
                type="text" 
                value={userSettings.displayName}
                onChange={(e) => setUserSettings({...userSettings, displayName: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 font-medium uppercase block mb-2">Fasting Goal (h)</label>
                <input 
                  type="number" 
                  value={userSettings.fastingGoal}
                  onChange={(e) => setUserSettings({...userSettings, fastingGoal: parseInt(e.target.value) || 16})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-medium uppercase block mb-2">Fitness Goal</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bulking"
                  value={userSettings.fitnessGoal || ''}
                  onChange={(e) => setUserSettings({...userSettings, fitnessGoal: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 font-medium uppercase block mb-2">Dietary Preferences</label>
              <input 
                type="text" 
                placeholder="e.g. Keto, Vegan, None"
                value={userSettings.dietaryPreferences || ''}
                onChange={(e) => setUserSettings({...userSettings, dietaryPreferences: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-4 border-t border-zinc-800 mt-2">
               <label className="text-xs text-violet-400 font-medium uppercase block mb-2 flex items-center gap-2">
                  <Sparkles size={12} /> OpenAI API Key
               </label>
               <input 
                type="password" 
                placeholder="sk-proj-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 placeholder:text-zinc-700"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Saved locally in your browser. Never synced to server.
              </p>
            </div>

            <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full mt-2">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  // --- Modals ---

  const renderManifestoModal = () => {
    if (!isManifestoOpen) return null;

    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-4 animate-fade-in">
        <div className="w-full max-w-md h-[85vh] flex flex-col bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-950/90 sticky top-0 z-10">
             <div className="flex items-center gap-3">
                <Scroll className="text-cyan-400" size={24} />
                <h2 className="text-xl font-bold text-white">The Protocol</h2>
             </div>
             <button onClick={() => setIsManifestoOpen(false)} className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
               <X size={24} />
             </button>
          </div>
          
          <div className="overflow-y-auto p-6 space-y-8">
             <div className="text-sm text-zinc-400 italic mb-6 border-l-2 border-cyan-500 pl-4">
               "The faster I do the hard thing, the faster I get the good thing."
             </div>
             
             {PRINCIPLES.map((p, i) => (
               <div key={i} className="group">
                 <h3 className="text-cyan-100 font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors">{p.title}</h3>
                 <p className="text-zinc-400 text-sm leading-relaxed">{p.text}</p>
               </div>
             ))}

             <div className="pt-8 border-t border-zinc-800">
               <h3 className="text-white font-bold text-lg mb-2">Bottom Line</h3>
               <ul className="list-disc list-inside text-zinc-400 text-sm space-y-1">
                 <li>Rebalance your dopamine.</li>
                 <li>Reduce fast dopamine.</li>
                 <li>Embrace slow dopamine (hard things).</li>
                 <li>Do the hard things—because the effort is the reward.</li>
               </ul>
             </div>
             
             <div className="h-12"></div>
          </div>
        </div>
      </div>
    )
  }

  const renderGoalModal = () => {
    if (!isGoalModalOpen) return null;
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-zinc-900 w-full max-w-xs rounded-3xl border border-zinc-800 p-6 animate-slide-up shadow-2xl">
           <h3 className="text-lg font-bold text-white mb-6 text-center">Set Fasting Goal</h3>
           
           <div className="flex items-center justify-center gap-4 mb-8">
              <button onClick={() => setTempGoal(Math.max(1, tempGoal - 1))} className="p-4 bg-zinc-800 rounded-2xl text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors active:scale-95">
                <Minus size={24} />
              </button>
              <div className="flex flex-col items-center w-20">
                <div className="text-4xl font-mono font-bold text-emerald-400">{tempGoal}</div>
                <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mt-1">Hours</div>
              </div>
              <button onClick={() => setTempGoal(tempGoal + 1)} className="p-4 bg-zinc-800 rounded-2xl text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors active:scale-95">
                <Plus size={24} />
              </button>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <Button variant="ghost" onClick={() => setIsGoalModalOpen(false)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400">Cancel</Button>
              <Button onClick={handleUpdateGoal} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
           </div>
        </div>
      </div>
    );
  };

  const renderInfoModal = () => {
    if (!isInfoModalOpen) return null;
    const stages = [
      { 
        title: "Digesting", 
        time: "0h - 4h", 
        desc: "Your body is digesting food and absorbing nutrients. Blood sugar levels rise, and insulin is secreted.",
        color: "text-orange-400",
        bg: "bg-orange-500/10"
      },
      { 
        title: "Normal State", 
        time: "4h - 12h", 
        desc: "Insulin levels drop, allowing your body to start burning stored glucose (glycogen) for energy.",
        color: "text-blue-400",
        bg: "bg-blue-500/10"
      },
      { 
        title: "Metabolic Switch", 
        time: "12h - 18h", 
        desc: "You enter the fat-burning zone (ketosis). Your body runs out of glucose and begins breaking down fat for fuel.",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10"
      },
      { 
        title: "Autophagy", 
        time: "18h+", 
        desc: "A cellular 'cleanup' process begins. Cells remove damaged components and proteins, promoting rejuvenation.",
        color: "text-violet-400",
        bg: "bg-violet-500/10"
      }
    ];

    return (
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 p-6 animate-slide-up shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Fasting Stages</h2>
            <button onClick={() => setIsInfoModalOpen(false)} className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {stages.map((stage, idx) => (
              <div key={idx} className="relative pl-4 border-l-2 border-zinc-800">
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-zinc-900 ${stage.bg.replace('/10', '')} `}></div>
                <div className="mb-1 flex items-center justify-between">
                  <h3 className={`font-bold text-lg ${stage.color}`}>{stage.title}</h3>
                  <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-1 rounded">{stage.time}</span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>
          
          <Button onClick={() => setIsInfoModalOpen(false)} className="w-full mt-8">
            Got it
          </Button>
        </div>
      </div>
    );
  };

  const renderTypeSelector = () => {
    if (!isTypeSelectorOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
        <div className="w-full max-w-md space-y-3 mb-24 animate-slide-up">
          <div className="text-center text-zinc-400 mb-6 text-sm font-medium tracking-wide uppercase">What would you like to log?</div>
          
          {['meal', 'workout', 'journal'].map(type => {
             const icons = { meal: Utensils, workout: Dumbbell, journal: BookOpen };
             const colors = { meal: 'orange', workout: 'emerald', journal: 'violet' };
             const labels = { meal: 'Log Meal', workout: 'Log Workout', journal: 'Log Journal' };
             const sub = { meal: 'Track calories & fasting', workout: 'Exercises & duration', journal: 'Notes & mood' };
             const Icon = icons[type];
             const color = colors[type];
             
             return (
              <button 
                key={type}
                onClick={() => openModal(type)}
                className="w-full flex items-center gap-4 p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all active:scale-95 group"
              >
                <div className={`bg-${color}-500/20 p-3 rounded-xl text-${color}-400 group-hover:text-${color}-300 group-hover:bg-${color}-500/30 transition-colors`}>
                  <Icon size={24} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg text-zinc-100">{labels[type]}</div>
                  <div className="text-sm text-zinc-500">{sub[type]}</div>
                </div>
                <ChevronRight className="ml-auto text-zinc-600" />
              </button>
             );
          })}

          <button 
            onClick={() => setIsTypeSelectorOpen(false)}
            className="w-full p-4 text-zinc-400 font-medium hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const renderAddModal = () => {
    if (!isModalOpen) return null;

    const config = {
      meal: { icon: Utensils, color: 'text-orange-400', label: 'Log Meal', placeholder: 'Oatmeal & Berries' },
      workout: { icon: Dumbbell, color: 'text-emerald-400', label: 'Log Workout', placeholder: 'Session Title (e.g. Leg Day)' },
      journal: { icon: BookOpen, color: 'text-violet-400', label: 'Log Journal', placeholder: 'Feeling energetic today...' },
    };
    
    const currentConfig = config[modalType];
    const Icon = currentConfig.icon;

    return (
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 p-6 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-zinc-800 ${currentConfig.color}`}>
                <Icon size={24} />
              </div>
              <h2 className="text-xl font-bold text-white">{currentConfig.label}</h2>
            </div>
            <button onClick={closeModal} className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
             {/* Time Input */}
             <div>
               <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider ml-1 mb-1 block">Time</label>
               <div className="relative">
                 <input
                    type="datetime-local"
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                 />
                 <Calendar className="absolute right-4 top-3.5 text-zinc-600 pointer-events-none" size={18} />
               </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider ml-1 mb-1 block">
                {modalType === 'workout' ? 'Session Title' : 'Title'}
              </label>
              <input
                autoFocus
                type="text"
                placeholder={currentConfig.placeholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* --- WORKOUT BUILDER SECTION --- */}
            {modalType === 'workout' && (
              <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <TrendingUp size={16} />
                  <span className="text-sm font-bold uppercase tracking-wider">Exercise Builder</span>
                </div>
                
                {/* Inputs */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-12">
                    <input
                      type="text"
                      placeholder="Exercise Name (e.g. Bench Press)"
                      value={exName}
                      onChange={(e) => setExName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="number"
                      placeholder="Weight"
                      value={exWeight}
                      onChange={(e) => setExWeight(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="number"
                      placeholder="Reps"
                      value={exReps}
                      onChange={(e) => setExReps(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <button 
                      onClick={addExerciseToSession}
                      disabled={!exName}
                      className="w-full h-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg flex items-center justify-center hover:bg-emerald-500 hover:text-zinc-950 transition-colors disabled:opacity-50"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {/* List of added exercises */}
                {exercises.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                    {exercises.map((ex, i) => (
                      <div key={ex.id} className="flex items-center justify-between bg-zinc-900 p-2 rounded border border-zinc-800/50 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 font-mono text-xs w-4">{i + 1}.</span>
                          <span className="text-zinc-200 font-medium">{ex.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-zinc-400 text-xs">
                            {ex.weight && <span className="text-zinc-300">{ex.weight}lbs</span>}
                            {ex.weight && ex.reps && <span className="mx-1">x</span>}
                            {ex.reps && <span className="text-emerald-400">{ex.reps}</span>}
                          </div>
                          <button onClick={() => removeExercise(ex.id)} className="text-zinc-600 hover:text-red-400">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes (Standard) */}
            <div>
              <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider ml-1 mb-1 block">Notes</label>
              <textarea
                rows="3"
                placeholder="How did it feel?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            <Button onClick={handleAddEntry} disabled={isSaving} className="w-full mt-4 py-4 text-lg">
              {isSaving ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // --- Toast for Achievement Unlock ---
  const renderUnlockToast = () => {
    if (!newUnlock) return null;
    const Icon = newUnlock.icon;
    return (
      <div className="fixed top-24 left-0 right-0 flex justify-center z-[100] animate-slide-down pointer-events-none px-4">
        <div className="bg-zinc-900 border border-yellow-500/30 shadow-2xl shadow-yellow-500/10 rounded-2xl p-4 flex items-center gap-4 max-w-sm w-full backdrop-blur-xl">
           <div className="bg-yellow-500/20 p-3 rounded-full text-yellow-500">
             <Icon size={24} />
           </div>
           <div>
             <div className="text-xs text-yellow-500 font-bold uppercase tracking-wider">Achievement Unlocked!</div>
             <div className="text-white font-bold text-lg">{newUnlock.title}</div>
           </div>
        </div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center flex-col gap-4">
         <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
         <p className="text-zinc-500 font-mono text-sm">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      
      <main className="max-w-md mx-auto min-h-screen flex flex-col relative">
        
        {/* Header */}
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
            <h1 className="text-xl font-bold tracking-tight text-white">LifeSync</h1>
          </div>
          <div className="w-8"></div> 
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'home' && renderTimeline()}
          {activeTab === 'fasting' && renderFasting()}
          {activeTab === 'coach' && renderCoach()}
          {activeTab === 'detox' && renderDetox()}
          {activeTab === 'profile' && renderProfile()}
        </div>

        {/* Bottom Nav */}
        {activeTab !== 'profile' && (
          <nav className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-800 pb-safe">
            <div className="max-w-md mx-auto px-6 h-20 flex items-center justify-between relative">
              
              <button 
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-white' : 'text-zinc-600'}`}
              >
                <Home size={24} />
                <span className="text-[10px] font-medium">Timeline</span>
              </button>

              <button 
                onClick={() => setActiveTab('fasting')}
                className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'fasting' ? 'text-emerald-400' : 'text-zinc-600'}`}
              >
                <Clock size={24} />
                <span className="text-[10px] font-medium">Fasting</span>
              </button>

              <div className="relative -top-6">
                <button 
                  onClick={() => setIsTypeSelectorOpen(true)}
                  className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
                    ${isTypeSelectorOpen ? 'bg-zinc-800 text-zinc-400 rotate-45' : 'bg-white text-zinc-950 hover:scale-105 shadow-white/20'}`}
                >
                  <Plus size={28} strokeWidth={2.5} />
                </button>
              </div>

              <button 
                onClick={() => setActiveTab('coach')}
                className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'coach' ? 'text-violet-400' : 'text-zinc-600'}`}
              >
                <Sparkles size={24} />
                <span className="text-[10px] font-medium">Coach</span>
              </button>

              <button 
                onClick={() => setActiveTab('detox')}
                className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'detox' ? 'text-cyan-400' : 'text-zinc-600'}`}
              >
                <Brain size={24} />
                <span className="text-[10px] font-medium">Detox</span>
              </button>

            </div>
          </nav>
        )}

      </main>

      {renderUnlockToast()}
      {renderTypeSelector()}
      {renderAddModal()}
      {renderInfoModal()}
      {renderGoalModal()}
      {renderManifestoModal()}
      
      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-down {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-down { animation: slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        
        ::-webkit-calendar-picker-indicator {
            filter: invert(1);
            opacity: 0.5;
            cursor: pointer;
        }
      `}</style>
    </div>
  );
}
