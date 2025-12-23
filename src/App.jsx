import React, { useState, useEffect } from 'react';
import { 
  Plus, Utensils, Dumbbell, BookOpen, Clock, 
  TrendingUp, Home, X, User, Sparkles, Brain, Zap
} from 'lucide-react';
import FocusMode from './components/FocusMode';
import Profile from './components/Profile';
import Analytics from './components/Analytics';
import Coach from './components/Coach';
import FastingTimer from './components/FastingTimer';
import Dashboard from './components/Dashboard';
import { Button } from './components/UI';
import { useAuth } from './hooks/useAuth';
import { useLifeSyncData } from './hooks/useLifeSyncData';
import { useFasting } from './hooks/useFasting';

export default function LifeSync() {
  const { user, loading: authLoading, signInWithGoogle, logout } = useAuth();
  const { 
    entries, routines, userSettings, isSaving, 
    addEntry, deleteEntry, updateSettings, createRoutine, toggleRoutine, deleteRoutine, setUserSettings 
  } = useLifeSyncData(user);
  
  const { fastingData, bioPhase, lastMeal } = useFasting(entries, userSettings);
  
  // Local UI State
  const [activeTab, setActiveTab] = useState('home');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('lifesync_openai_key') || '');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false); 
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false); 
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  
  const [modalType, setModalType] = useState(null); 
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [tempGoal, setTempGoal] = useState(16); 
  
  // Workout Builder
  const [exercises, setExercises] = useState([]); 
  const [exName, setExName] = useState('');
  const [exWeight, setExWeight] = useState('');
  const [exReps, setExReps] = useState('');

  // Routine Builder
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineType, setRoutineType] = useState('mindset');
  const [routineDays, setRoutineDays] = useState([]);

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
    setModalType(null);
    setExercises([]);
    setExName('');
    setExWeight('');
    setExReps('');
  };

  const handleSaveEntry = async () => {
    await addEntry({
        type: modalType,
        title: title || (modalType === 'meal' ? 'Quick Meal' : modalType === 'workout' ? 'Workout' : 'Journal Entry'),
        note,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        timestamp: new Date(entryTime).toISOString(),
        ...(modalType === 'workout' && { exercises: exercises }) 
    });
    closeModal();
  };

  const handleSaveRoutine = async () => {
    await createRoutine({
        title: routineTitle,
        type: routineType,
        days: routineDays.length > 0 ? routineDays : [0,1,2,3,4,5,6]
    });
    setIsRoutineModalOpen(false);
    setRoutineTitle('');
    setRoutineDays([]);
    setRoutineType('mindset');
  };

  const toggleDay = (dayIdx) => {
    if (routineDays.includes(dayIdx)) {
       setRoutineDays(routineDays.filter(d => d !== dayIdx));
    } else {
       setRoutineDays([...routineDays, dayIdx].sort());
    }
  };

  const addExerciseToSession = () => {
    if (!exName) return;
    setExercises([...exercises, { id: Date.now(), name: exName, weight: exWeight, reps: exReps }]);
    setExWeight('');
    setExReps('');
    setExName(''); 
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
  };

  const handleUpdateGoal = async () => {
    await updateSettings({ ...userSettings, fastingGoal: tempGoal });
    setIsGoalModalOpen(false);
  };

  if (authLoading) return <div className="h-screen w-full bg-black flex items-center justify-center text-zinc-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-emerald-500/30">
      <div className="max-w-md mx-auto h-screen flex flex-col relative bg-zinc-950 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <header className="px-6 pt-12 pb-4 flex items-center justify-between z-10 bg-gradient-to-b from-black to-transparent">
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
        <main className="flex-1 overflow-y-auto px-6 scrollbar-hide relative">
           {activeTab === 'home' && (
             <Dashboard 
                userSettings={userSettings}
                fastingData={fastingData}
                entries={entries}
                routines={routines}
                bioPhase={bioPhase}
                onDeleteEntry={deleteEntry}
                onToggleRoutine={toggleRoutine}
                onDeleteRoutine={deleteRoutine}
                onOpenRoutineModal={() => setIsRoutineModalOpen(true)}
                onOpenGoalModal={() => { setTempGoal(userSettings.fastingGoal); setIsGoalModalOpen(true); }}
                onOpenInfoModal={() => setIsInfoModalOpen(true)}
             />
           )}
           {activeTab === 'fasting' && (
             <FastingTimer 
                fastingData={fastingData} 
                userSettings={userSettings} 
                lastMeal={lastMeal}
                onOpenGoalModal={() => { setTempGoal(userSettings.fastingGoal); setIsGoalModalOpen(true); }}
                onOpenInfoModal={() => setIsInfoModalOpen(true)}
             />
           )}
           {activeTab === 'focus' && <FocusMode onSessionComplete={handleFocusSessionComplete} />}
           {activeTab === 'analytics' && <Analytics entries={entries} />}
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
            className="absolute bottom-24 right-6 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all z-20"
          >
            <Plus size={28} />
          </button>
        )}

        {/* Type Selector Overlay */}
        {isTypeSelectorOpen && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-end justify-end p-6 animate-fade-in" onClick={() => setIsTypeSelectorOpen(false)}>
             <div className="flex flex-col gap-3 items-end mb-20">
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
                <button onClick={() => setIsTypeSelectorOpen(false)} className="w-14 h-14 mt-2 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:rotate-90 transition-all">
                   <X size={24} />
                </button>
             </div>
          </div>
        )}

        {/* Navigation Bar */}
        <nav className="h-20 bg-zinc-950 border-t border-zinc-900 flex items-center justify-around px-2 pb-4 z-20">
           <button onClick={() => setActiveTab('home')} className={`p-3 rounded-2xl transition-all ${activeTab === 'home' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
           </button>
           <button onClick={() => setActiveTab('fasting')} className={`p-3 rounded-2xl transition-all ${activeTab === 'fasting' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Clock size={24} strokeWidth={activeTab === 'fasting' ? 2.5 : 2} />
           </button>
           <div className="w-12"></div> {/* Spacer for FAB */}
           <button onClick={() => setActiveTab('focus')} className={`p-3 rounded-2xl transition-all ${activeTab === 'focus' ? 'text-cyan-400 bg-cyan-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Brain size={24} strokeWidth={activeTab === 'focus' ? 2.5 : 2} />
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

                   {/* Workout Builder */}
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

        {/* Routine Modal */}
        {isRoutineModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
             <div className="bg-zinc-900 w-full max-w-sm rounded-3xl border border-zinc-800 p-6 animate-slide-up shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Create Routine</h3>
                <div className="space-y-4">
                   <div>
                      <label className="text-xs text-zinc-500 font-bold uppercase ml-1 mb-1 block">Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Morning Meditation"
                        value={routineTitle}
                        onChange={(e) => setRoutineTitle(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                   </div>
                   
                   <div>
                      <label className="text-xs text-zinc-500 font-bold uppercase ml-1 mb-1 block">Type</label>
                      <div className="flex gap-2">
                         {['mindset', 'exercise', 'diet'].map(t => (
                            <button 
                               key={t}
                               onClick={() => setRoutineType(t)}
                               className={`flex-1 py-2 rounded-xl text-xs font-bold border capitalize transition-all
                                  ${routineType === t 
                                    ? 'bg-emerald-500 text-black border-emerald-500' 
                                    : 'bg-zinc-950 text-zinc-500 border-zinc-800'}`}
                            >
                               {t}
                            </button>
                         ))}
                      </div>
                   </div>

                   <div>
                      <label className="text-xs text-zinc-500 font-bold uppercase ml-1 mb-1 block">Frequency</label>
                      <div className="flex justify-between gap-1">
                         {['S','M','T','W','T','F','S'].map((d, i) => (
                            <button
                               key={i}
                               onClick={() => toggleDay(i)}
                               className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all
                                  ${routineDays.includes(i) || routineDays.length === 0
                                    ? 'bg-zinc-800 text-white border-zinc-700'
                                    : 'bg-zinc-950 text-zinc-600 border-zinc-900'}`}
                            >
                               {d}
                            </button>
                         ))}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-2 text-center">
                         {routineDays.length === 0 ? "Every Day" : "Selected Days Only"}
                      </p>
                   </div>

                   <Button onClick={handleSaveRoutine} disabled={isSaving} className="w-full mt-2">
                     {isSaving ? 'Creating...' : 'Create Routine'}
                   </Button>
                   <Button variant="ghost" onClick={() => setIsRoutineModalOpen(false)} className="w-full">
                     Cancel
                   </Button>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
