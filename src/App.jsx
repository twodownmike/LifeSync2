import React, { useState, useEffect } from 'react';
import { 
  Plus, Utensils, Dumbbell, BookOpen, Clock, 
  TrendingUp, Home, X, User, Sparkles, Brain, Zap, Minus, Scale, Wallet
} from 'lucide-react';
import FocusMode from './components/FocusMode';
import Profile from './components/Profile';
import Analytics from './components/Analytics';
import Coach from './components/Coach';
import FastingTimer from './components/FastingTimer';
import Dashboard from './components/Dashboard';
import Breathwork from './components/Breathwork';
import TrophyRoom from './components/TrophyRoom';
import Sidebar from './components/Sidebar';
import Finance from './components/Finance';
import { Button } from './components/UI';
import { useAuth } from './hooks/useAuth';
import { useLifeSyncData } from './hooks/useLifeSyncData';
import { useFasting } from './hooks/useFasting';
import { useAchievements } from './hooks/useAchievements';
import { useFastingNotifications } from './hooks/useFastingNotifications';

export default function LifeSync() {
  const { user, loading: authLoading, signInWithGoogle, logout } = useAuth();
  const { 
    entries, userSettings, isSaving, 
    addEntry, deleteEntry, updateSettings, setUserSettings, awardXP 
  } = useLifeSyncData(user);
  
  const { fastingData, bioPhase, lastMeal } = useFasting(entries, userSettings);
  
  // Achievement System
  useAchievements(entries, userSettings, updateSettings);
  
  // Notifications
  useFastingNotifications(fastingData, userSettings);
  
  // Local UI State
  const [activeTab, setActiveTab] = useState('home');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('lifesync_openai_key') || '');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false); 
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false); 
  const [isBreathworkOpen, setIsBreathworkOpen] = useState(false);
  const [isTrophyModalOpen, setIsTrophyModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  
  const [modalType, setModalType] = useState(null); 
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [tempGoal, setTempGoal] = useState(16); 
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5); 

  // Finance State
  const [amount, setAmount] = useState('');
  const [isExpense, setIsExpense] = useState(true);
  const [category, setCategory] = useState('Food');
  
  // Workout Builder
  const [exercises, setExercises] = useState([]); 
  const [exName, setExName] = useState('');
  const [exWeight, setExWeight] = useState('');
  const [exReps, setExReps] = useState('');

  useEffect(() => {
    localStorage.setItem('lifesync_openai_key', apiKey);
  }, [apiKey]);

  const getCurrentLocalTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const openModal = (type) => {
    setIsTypeSelectorOpen(false);
    setModalType(type);
    setEntryTime(getCurrentLocalTime());
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNote('');
    setTitle('');
    setTags('');
    setEntryTime('');
    setMood(5);
    setEnergy(5);
    setModalType(null);
    setExercises([]);
    setExName('');
    setExWeight('');
    setExReps('');
    setAmount('');
    setIsExpense(true);
    setCategory('Food');
  };

  const handleSaveEntry = async () => {
    let entryData = {
        type: modalType,
        title: title || (
            modalType === 'meal' ? 'Quick Meal' : 
            modalType === 'workout' ? 'Workout' : 
            modalType === 'weight' ? 'Weight Log' :
            modalType === 'finance' ? (isExpense ? 'Expense' : 'Income') :
            'Journal Entry'
        ),
        note: (modalType === 'weight' || modalType === 'finance') ? '' : note, 
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        timestamp: new Date(entryTime).toISOString(),
        mood,
        energy
    };

    if (modalType === 'workout') {
        entryData.exercises = exercises;
    }
    
    if (modalType === 'weight') {
        entryData.weight = parseFloat(note); // Capture the weight value
        entryData.title = `${note} lbs`; // Set title for easy viewing
    }

    if (modalType === 'finance') {
        entryData.amount = parseFloat(amount);
        entryData.isExpense = isExpense;
        entryData.category = category;
        entryData.title = title || `${isExpense ? 'Spent' : 'Earned'} $${amount}`;
    }

    await addEntry(entryData);
    
    // XP Rewards
    let xpEarned = 10; // Base for logging
    if (modalType === 'meal' && lastMeal) {
        const diffMs = new Date(entryData.timestamp) - new Date(lastMeal.timestamp);
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        if (hours > 0) xpEarned += (hours * 5); // 5 XP per hour of fasting
    }
    if (modalType === 'finance') xpEarned = 5; // Small XP for finance logging

    await awardXP(xpEarned);

    closeModal();
  };

  const handleUpdateBudget = async () => {
    await updateSettings({ ...userSettings, monthlyBudget: parseFloat(tempGoal) });
    setIsBudgetModalOpen(false);
  };

  const addExerciseToSession = () => {
    if (!exName) return;
    setExercises([...exercises, { id: Date.now(), name: exName, weight: exWeight, reps: exReps }]);
    setExWeight('');
    setExReps('');
    setExName(''); 
  };

  const handleBreathworkComplete = async (minutes, patternName) => {
    if (!user) return;
    await addEntry({
        type: 'breathwork',
        title: `Breathwork: ${patternName}`,
        note: `Completed ${minutes} minutes of ${patternName}`,
        tags: ['mindfulness', 'breathwork'],
        duration: minutes,
        timestamp: new Date().toISOString()
    });
    
    // XP: 10 base + 1 per minute
    await awardXP(10 + minutes);
  };

  const handleFocusSessionComplete = async (durationMinutes, taskLabel, tag) => {
    if (!user) return;
    const tags = ['productivity', 'deep_work'];
    if (tag) tags.push(tag);
    await addEntry({
        type: 'work_session',
        title: 'Deep Work Session',
        note: taskLabel ? `Worked on: ${taskLabel}` : 'Focus Session',
        tags: tags,
        duration: durationMinutes,
        timestamp: new Date().toISOString()
    });
    
    // XP: 10 base + 1 per minute
    await awardXP(10 + durationMinutes);
  };

  const handleUpdateGoal = async () => {
    await updateSettings({ ...userSettings, fastingGoal: tempGoal });
    setIsGoalModalOpen(false);
  };

  if (authLoading) return <div className="h-screen w-full bg-black flex items-center justify-center text-zinc-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-emerald-500/30 flex justify-center md:justify-start">
      
      {/* Desktop Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSignOut={logout}
        userPhoto={user?.photoURL}
        userName={userSettings.displayName}
      />

      <div className="w-full max-w-md md:max-w-none md:flex-1 h-screen flex flex-col relative bg-zinc-950 shadow-2xl md:shadow-none md:bg-black overflow-hidden transition-all">
        
        {/* Header (Mobile Only) */}
        <header className="md:hidden px-6 pt-12 pb-4 flex items-center justify-between z-10 bg-gradient-to-b from-black to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center transform rotate-3 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
               <Zap className="text-black fill-current" size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">LifeSync</h1>
          </div>
          <button onClick={() => setActiveTab('profile')} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors border border-zinc-800">
             <User size={18} className="text-zinc-400" />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-6 scrollbar-hide relative md:px-12 md:py-10 max-w-7xl mx-auto w-full">
           {activeTab === 'home' && (
             <Dashboard 
                userSettings={userSettings}
                fastingData={fastingData}
                entries={entries}
                bioPhase={bioPhase}
                onDeleteEntry={deleteEntry}
                onOpenGoalModal={() => { setTempGoal(userSettings.fastingGoal); setIsGoalModalOpen(true); }}
                onOpenInfoModal={() => setIsInfoModalOpen(true)}
                onOpenBreathwork={() => setIsBreathworkOpen(true)}
                onOpenTrophyRoom={() => setIsTrophyModalOpen(true)}
             />
           )}
           {activeTab === 'fasting' && (
             <FastingTimer 
                fastingData={fastingData} 
                userSettings={userSettings} 
                lastMeal={lastMeal}
                onOpenGoalModal={() => { setTempGoal(userSettings.fastingGoal); setIsGoalModalOpen(true); }}
                onOpenInfoModal={() => setIsInfoModalOpen(true)}
                onLogMeal={() => openModal('meal')}
             />
           )}
           {activeTab === 'focus' && <FocusMode onSessionComplete={handleFocusSessionComplete} />}
           {activeTab === 'finance' && (
             <Finance 
                entries={entries}
                userSettings={userSettings}
                onAddEntry={openModal}
                onOpenBudgetModal={() => { setTempGoal(userSettings.monthlyBudget || 2000); setIsBudgetModalOpen(true); }}
             />
           )}
           {activeTab === 'analytics' && (
             <Analytics 
                entries={entries} 
                apiKey={apiKey}
                userSettings={userSettings}
             />
           )}
           {activeTab === 'coach' && (
             <Coach 
               user={user} 
               apiKey={apiKey} 
               entries={entries} 
               userSettings={userSettings} 
               fastingData={fastingData} 
               bioPhase={bioPhase}
               onOpenSettings={() => setActiveTab('profile')}
             />
           )}
           {activeTab === 'profile' && (
             <Profile 
                user={user}
                entries={entries}
                userSettings={userSettings}
                setUserSettings={setUserSettings}
                apiKey={apiKey}
                setApiKey={setApiKey}
                onSave={() => updateSettings(userSettings)}
                isSaving={isSaving}
                onSignIn={signInWithGoogle}
                onSignOut={logout}
                onClose={() => setActiveTab('home')}
             />
           )}
        </main>

        {/* Floating Action Button (FAB) */}
        {!isTypeSelectorOpen && activeTab !== 'focus' && activeTab !== 'profile' && (
          <button 
            onClick={() => setIsTypeSelectorOpen(true)}
            className="absolute bottom-24 right-6 md:bottom-10 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all z-20"
          >
            <Plus size={28} />
          </button>
        )}

        {/* Type Selector Overlay */}
        {isTypeSelectorOpen && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-end justify-end p-6 animate-fade-in" onClick={() => setIsTypeSelectorOpen(false)}>
             <div className="flex flex-col gap-3 items-end mb-20 md:mb-10">
                <div className="flex items-center gap-3 animate-slide-up" style={{animationDelay: '0ms'}}>
                   <span className="text-zinc-200 font-medium text-sm bg-zinc-900 px-2 py-1 rounded-md">Log Meal</span>
                   <button onClick={(e) => { e.stopPropagation(); openModal('meal'); }} className="w-12 h-12 rounded-full bg-orange-500 text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Utensils size={20} />
                   </button>
                </div>
                <div className="flex items-center gap-3 animate-slide-up" style={{animationDelay: '50ms'}}>
                   <span className="text-zinc-200 font-medium text-sm bg-zinc-900 px-2 py-1 rounded-md">Log Workout</span>
                   <button onClick={(e) => { e.stopPropagation(); openModal('workout'); }} className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Dumbbell size={20} />
                   </button>
                </div>
                <div className="flex items-center gap-3 animate-slide-up" style={{animationDelay: '100ms'}}>
                   <span className="text-zinc-200 font-medium text-sm bg-zinc-900 px-2 py-1 rounded-md">Journal</span>
                   <button onClick={(e) => { e.stopPropagation(); openModal('journal'); }} className="w-12 h-12 rounded-full bg-violet-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <BookOpen size={20} />
                   </button>
                </div>
                <div className="flex items-center gap-3 animate-slide-up" style={{animationDelay: '150ms'}}>
                   <span className="text-zinc-200 font-medium text-sm bg-zinc-900 px-2 py-1 rounded-md">Weigh In</span>
                   <button onClick={(e) => { e.stopPropagation(); openModal('weight'); }} className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Scale size={20} />
                   </button>
                </div>
                <div className="flex items-center gap-3 animate-slide-up" style={{animationDelay: '200ms'}}>
                   <span className="text-zinc-200 font-medium text-sm bg-zinc-900 px-2 py-1 rounded-md">Finance</span>
                   <button onClick={(e) => { e.stopPropagation(); openModal('finance'); }} className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Wallet size={20} />
                   </button>
                </div>
                <button onClick={() => setIsTypeSelectorOpen(false)} className="w-14 h-14 mt-2 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:rotate-90 transition-all">
                   <X size={24} />
                </button>
             </div>
          </div>
        )}

        {/* Navigation Bar (Mobile Only) */}
        <nav className="md:hidden h-20 bg-zinc-950 border-t border-zinc-900 flex items-center justify-around px-2 pb-4 z-20">
           <button onClick={() => setActiveTab('home')} className={`p-3 rounded-2xl transition-all ${activeTab === 'home' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
           </button>
           <button onClick={() => setActiveTab('fasting')} className={`p-3 rounded-2xl transition-all ${activeTab === 'fasting' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Clock size={24} strokeWidth={activeTab === 'fasting' ? 2.5 : 2} />
           </button>
           <button onClick={() => setActiveTab('focus')} className={`p-3 rounded-2xl transition-all ${activeTab === 'focus' ? 'text-cyan-400 bg-cyan-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Brain size={24} strokeWidth={activeTab === 'focus' ? 2.5 : 2} />
           </button>
           <button onClick={() => setActiveTab('finance')} className={`p-3 rounded-2xl transition-all ${activeTab === 'finance' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Wallet size={24} strokeWidth={activeTab === 'finance' ? 2.5 : 2} />
           </button>
           <button onClick={() => setActiveTab('analytics')} className={`p-3 rounded-2xl transition-all ${activeTab === 'analytics' ? 'text-violet-400 bg-violet-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <TrendingUp size={24} strokeWidth={activeTab === 'analytics' ? 2.5 : 2} />
           </button>
           <button onClick={() => setActiveTab('coach')} className={`p-3 rounded-2xl transition-all ${activeTab === 'coach' ? 'text-violet-400 bg-violet-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Sparkles size={24} strokeWidth={activeTab === 'coach' ? 2.5 : 2} />
           </button>
        </nav>

        {/* -- MODALS -- */}

        {/* Add Entry Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
             <div className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 p-6 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {modalType === 'meal' && <Utensils className="text-orange-500" />}
                      {modalType === 'workout' && <Dumbbell className="text-emerald-500" />}
                      {modalType === 'journal' && <BookOpen className="text-violet-500" />}
                      New {modalType === 'meal' ? 'Meal' : modalType === 'workout' ? 'Workout' : 'Entry'}
                   </h2>
                   <button onClick={closeModal} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                      <X size={20} />
                   </button>
                </div>
                
                <div className="space-y-4">
                   <div>
                      <label className="text-xs text-zinc-500 font-bold uppercase ml-1 mb-1 block">Title</label>
                      <input 
                        type="text" 
                        placeholder={modalType === 'meal' ? "e.g. Steak & Eggs" : modalType === 'workout' ? "e.g. Upper Body Power" : "Title"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                   </div>

                   {/* Weight Input (Only for weight type) */}
                   {modalType === 'weight' && (
                      <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800 mb-4">
                         <div className="flex items-center gap-3 justify-center">
                            <Scale size={24} className="text-blue-500" />
                            <input 
                              type="number" 
                              autoFocus
                              placeholder="0.0" 
                              value={note} 
                              onChange={(e) => setNote(e.target.value)}
                              className="w-32 bg-transparent text-4xl font-mono font-bold text-center text-white focus:outline-none border-b-2 border-zinc-800 focus:border-blue-500 placeholder:text-zinc-800"
                            />
                            <span className="text-xl font-bold text-zinc-600 mt-2">lbs</span>
                         </div>
                      </div>
                   )}

                   {/* Finance Input (Only for finance type) */}
                   {modalType === 'finance' && (
                      <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800 mb-4 space-y-4">
                         <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                            <button 
                              onClick={() => setIsExpense(true)}
                              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isExpense ? 'bg-rose-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                              Expense
                            </button>
                            <button 
                              onClick={() => setIsExpense(false)}
                              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isExpense ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                              Income
                            </button>
                         </div>

                         <div className="flex items-center gap-3 justify-center">
                            <span className="text-2xl font-bold text-zinc-500">$</span>
                            <input 
                              type="number" 
                              autoFocus
                              placeholder="0.00" 
                              value={amount} 
                              onChange={(e) => setAmount(e.target.value)}
                              className="w-40 bg-transparent text-4xl font-mono font-bold text-center text-white focus:outline-none border-b-2 border-zinc-800 focus:border-emerald-500 placeholder:text-zinc-800"
                            />
                         </div>

                         <div>
                            <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Category</label>
                            <select 
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                            >
                              {isExpense ? (
                                <>
                                  <option value="Food">Food & Dining</option>
                                  <option value="Transport">Transportation</option>
                                  <option value="Shopping">Shopping</option>
                                  <option value="Housing">Housing</option>
                                  <option value="Utilities">Utilities</option>
                                  <option value="Health">Health</option>
                                  <option value="Entertainment">Entertainment</option>
                                  <option value="Other">Other</option>
                                </>
                              ) : (
                                <>
                                  <option value="Salary">Salary</option>
                                  <option value="Freelance">Freelance</option>
                                  <option value="Investment">Investment</option>
                                  <option value="Gift">Gift</option>
                                  <option value="Other">Other</option>
                                </>
                              )}
                            </select>
                         </div>
                      </div>
                   )}

                   {/* Workout Builder (Only for workout type) */}
                   {modalType === 'workout' && (
                     <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800">
                        <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Exercises</label>
                        {exercises.map(ex => (
                           <div key={ex.id} className="flex justify-between items-center mb-2 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                              <span className="text-sm font-medium">{ex.name}</span>
                              <div className="flex items-center gap-3">
                                 <span className="text-xs text-zinc-500">{ex.weight}lb x {ex.reps}</span>
                                 <button onClick={() => setExercises(exercises.filter(e => e.id !== ex.id))} className="text-zinc-600 hover:text-red-400">
                                    <X size={14} />
                                 </button>
                              </div>
                           </div>
                        ))}
                        
                        <div className="flex gap-2 mt-2">
                           <input 
                             placeholder="Exercise" 
                             value={exName} onChange={e => setExName(e.target.value)}
                             className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
                           />
                           <input 
                             placeholder="Lbs" type="number"
                             value={exWeight} onChange={e => setExWeight(e.target.value)}
                             className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
                           />
                           <input 
                             placeholder="Reps" type="number"
                             value={exReps} onChange={e => setExReps(e.target.value)}
                             className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
                           />
                           <button onClick={addExerciseToSession} className="bg-emerald-500 text-black rounded-lg px-3 font-bold hover:bg-emerald-400">
                              <Plus size={18} />
                           </button>
                        </div>
                     </div>
                   )}

                   {/* Mood/Energy Sliders */}
                   <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800 space-y-4">
                      <div>
                         <div className="flex justify-between text-xs font-bold uppercase mb-2">
                            <span className="text-zinc-500">Mood</span>
                            <span className="text-violet-400">{mood}/10</span>
                         </div>
                         <input 
                            type="range" min="1" max="10" step="1"
                            value={mood} onChange={(e) => setMood(parseInt(e.target.value))}
                            className="w-full accent-violet-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                         />
                         <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                            <span>Awful</span>
                            <span>Excellent</span>
                         </div>
                      </div>

                      <div>
                         <div className="flex justify-between text-xs font-bold uppercase mb-2">
                            <span className="text-zinc-500">Energy</span>
                            <span className="text-yellow-500">{energy}/10</span>
                         </div>
                         <input 
                            type="range" min="1" max="10" step="1"
                            value={energy} onChange={(e) => setEnergy(parseInt(e.target.value))}
                            className="w-full accent-yellow-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                         />
                         <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                            <span>Drained</span>
                            <span>Energized</span>
                         </div>
                      </div>
                   </div>

                   <div>
                      <label className="text-xs text-zinc-500 font-bold uppercase ml-1 mb-1 block">Notes</label>
                      <textarea 
                        rows="3"
                        placeholder="Add details..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-500 font-bold uppercase ml-1 mb-1 block">Time</label>
                        <input 
                          type="datetime-local" 
                          value={entryTime}
                          onChange={(e) => setEntryTime(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 font-bold uppercase ml-1 mb-1 block">Tags</label>
                        <input 
                          type="text" 
                          placeholder="comma, separated"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                   </div>

                   <Button onClick={handleSaveEntry} disabled={isSaving} className="w-full mt-4">
                     {isSaving ? 'Saving...' : 'Save Entry'}
                   </Button>
                </div>
             </div>
          </div>
        )}

        {/* Budget Modal */}
        {isBudgetModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-zinc-900 w-full max-w-xs rounded-3xl border border-zinc-800 p-6 animate-slide-up shadow-2xl">
               <h3 className="text-lg font-bold text-white mb-6 text-center">Monthly Budget</h3>
               
               <div className="flex items-center justify-center gap-2 mb-8">
                  <span className="text-2xl font-bold text-zinc-500">$</span>
                  <input 
                    type="number"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    className="w-32 bg-transparent text-4xl font-mono font-bold text-center text-white focus:outline-none border-b-2 border-zinc-800 focus:border-emerald-500"
                  />
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <Button variant="ghost" onClick={() => setIsBudgetModalOpen(false)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400">Cancel</Button>
                  <Button onClick={handleUpdateBudget} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
               </div>
            </div>
          </div>
        )}

        {/* Goal Modal */}
        {isGoalModalOpen && (
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
        )}

        {/* Info Modal */}
        {isInfoModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 p-6 animate-slide-up shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Fasting Stages</h2>
                <button onClick={() => setIsInfoModalOpen(false)} className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6">
                {[
                  { title: "Digesting", time: "0h - 4h", desc: "Blood sugar rises, insulin is secreted.", color: "text-orange-400", bg: "bg-orange-500/10" },
                  { title: "Normal State", time: "4h - 12h", desc: "Insulin drops, body burns stored glucose.", color: "text-blue-400", bg: "bg-blue-500/10" },
                  { title: "Metabolic Switch", time: "12h - 18h", desc: "Fat burning (ketosis) begins.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { title: "Autophagy", time: "18h+", desc: "Cellular cleanup and rejuvenation.", color: "text-violet-400", bg: "bg-violet-500/10" }
                ].map((stage, idx) => (
                  <div key={idx} className="relative pl-4 border-l-2 border-zinc-800">
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-zinc-900 ${stage.bg.replace('/10', '')} `}></div>
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className={`font-bold text-lg ${stage.color}`}>{stage.title}</h3>
                      <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-1 rounded">{stage.time}</span>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">{stage.desc}</p>
                  </div>
                ))}
              </div>
              <Button onClick={() => setIsInfoModalOpen(false)} className="w-full mt-8">Got it</Button>
            </div>
          </div>
        )}

        {/* Breathwork Overlay */}
        {isBreathworkOpen && <Breathwork onClose={() => setIsBreathworkOpen(false)} onSessionComplete={handleBreathworkComplete} />}

        {/* Trophy Room Overlay */}
        {isTrophyModalOpen && (
          <TrophyRoom 
            unlockedIds={userSettings.unlockedAchievements} 
            onClose={() => setIsTrophyModalOpen(false)} 
          />
        )}

      </div>
    </div>
  );
}
