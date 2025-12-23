import React, { useState, useMemo } from 'react';
import { 
  X, Settings, LogIn, LogOut, Sparkles, Eye, EyeOff, Trophy, Lock,
  Activity, Calendar, Ruler, Scale, User as UserIcon, ChevronRight,
  Dumbbell, Utensils, Flame, Zap
} from 'lucide-react';
import { Card, Button } from './UI';
import { ACHIEVEMENTS, calculateStreak } from '../lib/constants';

export default function Profile({ 
  user, 
  entries = [],
  userSettings, 
  setUserSettings, 
  apiKey, 
  setApiKey, 
  onSave, 
  isSaving, 
  onSignIn, 
  onSignOut, 
  onClose 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showApiKey, setShowApiKey] = useState(false);
  const unlockedSet = new Set(userSettings.unlockedAchievements || []);

  // Calculate Stats
  const stats = useMemo(() => {
    const totalWorkouts = entries.filter(e => e.type === 'workout').length;
    const totalMeals = entries.filter(e => e.type === 'meal').length;
    const currentStreak = calculateStreak(entries);
    // Simple join date estimation (first entry) or just "N/A"
    const firstEntry = entries[entries.length - 1];
    const memberSince = firstEntry ? new Date(firstEntry.timestamp).toLocaleDateString() : 'New User';
    
    return { totalWorkouts, totalMeals, currentStreak, memberSince };
  }, [entries]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'stats', label: 'Stats' },
    { id: 'settings', label: 'Settings' }
  ];

  const renderOverview = () => (
    <div className="space-y-6 animate-slide-up">
      {/* Bio Summary Card */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <UserIcon size={18} className="text-emerald-500" />
            Bio Metrics
          </h3>
          <button 
            onClick={() => setActiveTab('settings')}
            className="text-xs text-emerald-400 font-medium hover:text-emerald-300"
          >
            Edit
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
            <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
              <Ruler size={12} /> Height
            </div>
            <div className="text-lg font-mono font-bold text-zinc-200">
              {userSettings.height || '--'} <span className="text-xs text-zinc-600 font-sans">cm</span>
            </div>
          </div>
          <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
            <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
              <Scale size={12} /> Weight
            </div>
            <div className="text-lg font-mono font-bold text-zinc-200">
              {userSettings.weight || '--'} <span className="text-xs text-zinc-600 font-sans">kg</span>
            </div>
          </div>
          <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
            <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
              <Calendar size={12} /> Age
            </div>
            <div className="text-lg font-mono font-bold text-zinc-200">
              {userSettings.age || '--'}
            </div>
          </div>
          <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
            <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
              <Activity size={12} /> Level
            </div>
            <div className="text-sm font-bold text-zinc-200 capitalize truncate">
              {userSettings.activityLevel || 'Moderate'}
            </div>
          </div>
        </div>
      </Card>

      {/* Achievements Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-zinc-400 text-sm uppercase tracking-wider">Recent Achievements</h3>
          <span className="text-xs text-zinc-500 font-mono">
             {unlockedSet.size} / {ACHIEVEMENTS.length} Unlocked
          </span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {ACHIEVEMENTS.map(achievement => {
             const isUnlocked = unlockedSet.has(achievement.id);
             
             const Icon = achievement.icon;
             let tierColor = 'text-zinc-600';
             let tierBg = 'bg-zinc-950 border-zinc-900';
             
             if (isUnlocked) {
                if (achievement.tier === 'bronze') {
                    tierColor = 'text-orange-400';
                    tierBg = 'bg-orange-950/30 border-orange-500/20';
                }
                if (achievement.tier === 'silver') {
                    tierColor = 'text-zinc-300';
                    tierBg = 'bg-zinc-800/50 border-zinc-700/50';
                }
                if (achievement.tier === 'gold') {
                    tierColor = 'text-yellow-400';
                    tierBg = 'bg-yellow-950/30 border-yellow-500/20';
                }
                if (achievement.tier === 'platinum') {
                    tierColor = 'text-cyan-400';
                    tierBg = 'bg-cyan-950/30 border-cyan-500/20';
                }
                if (achievement.tier === 'diamond') {
                    tierColor = 'text-indigo-400';
                    tierBg = 'bg-indigo-950/30 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]';
                }
             }

             return (
                <div 
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                    ${isUnlocked 
                       ? 'bg-zinc-900 border-zinc-800' 
                       : 'bg-zinc-950/30 border-zinc-900/50 opacity-60 grayscale'}`}
                >
                   <div className={`p-2 rounded-full border ${tierBg} ${tierColor}`}>
                      {isUnlocked ? <Icon size={16} /> : <Lock size={16} />}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                          <h4 className={`text-sm font-bold truncate ${isUnlocked ? 'text-zinc-200' : 'text-zinc-600'}`}>
                             {achievement.title}
                          </h4>
                          {isUnlocked && (
                              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${tierBg} ${tierColor}`}>
                                  {achievement.tier}
                              </span>
                          )}
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{achievement.desc}</p>
                   </div>
                </div>
             )
          })}
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-4 animate-slide-up">
      <div className="grid grid-cols-2 gap-4">
         <Card className="flex flex-col items-center justify-center py-6 gap-2">
            <div className="p-3 rounded-full bg-orange-500/10 text-orange-500 mb-1">
               <Flame size={24} />
            </div>
            <div className="text-3xl font-bold text-white font-mono">{stats.currentStreak}</div>
            <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Day Streak</div>
         </Card>
         <Card className="flex flex-col items-center justify-center py-6 gap-2">
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500 mb-1">
               <Dumbbell size={24} />
            </div>
            <div className="text-3xl font-bold text-white font-mono">{stats.totalWorkouts}</div>
            <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Workouts</div>
         </Card>
         <Card className="flex flex-col items-center justify-center py-6 gap-2">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 mb-1">
               <Utensils size={24} />
            </div>
            <div className="text-3xl font-bold text-white font-mono">{stats.totalMeals}</div>
            <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Meals</div>
         </Card>
         <Card className="flex flex-col items-center justify-center py-6 gap-2">
            <div className="p-3 rounded-full bg-violet-500/10 text-violet-500 mb-1">
               <UserIcon size={24} />
            </div>
            <div className="text-xs font-bold text-white text-center mt-1">{stats.memberSince}</div>
            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mt-1">Joined</div>
         </Card>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
         <h4 className="text-sm font-bold text-white mb-2">Account Status</h4>
         <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Membership</span>
            <span className="text-emerald-400 font-bold">Free Tier</span>
         </div>
         <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-zinc-500">Cloud Sync</span>
            <span className={user ? "text-emerald-400 font-bold" : "text-zinc-600 font-bold"}>
               {user ? "Active" : "Guest (Local)"}
            </span>
         </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-slide-up pb-8">
       {/* Personal Details */}
       <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Personal Details</h3>
          
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Display Name</label>
            <input 
              type="text" 
              value={userSettings.displayName}
              onChange={(e) => setUserSettings({...userSettings, displayName: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs text-zinc-400 mb-1.5 block">Age</label>
               <input 
                 type="number" 
                 value={userSettings.age || ''}
                 onChange={(e) => setUserSettings({...userSettings, age: e.target.value})}
                 className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                 placeholder="25"
               />
             </div>
             <div>
               <label className="text-xs text-zinc-400 mb-1.5 block">Gender</label>
               <select 
                 value={userSettings.gender || ''}
                 onChange={(e) => setUserSettings({...userSettings, gender: e.target.value})}
                 className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm appearance-none"
               >
                 <option value="">Select</option>
                 <option value="male">Male</option>
                 <option value="female">Female</option>
                 <option value="other">Other</option>
               </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs text-zinc-400 mb-1.5 block">Height (cm)</label>
               <input 
                 type="number" 
                 value={userSettings.height || ''}
                 onChange={(e) => setUserSettings({...userSettings, height: e.target.value})}
                 className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                 placeholder="175"
               />
             </div>
             <div>
               <label className="text-xs text-zinc-400 mb-1.5 block">Weight (kg)</label>
               <input 
                 type="number" 
                 value={userSettings.weight || ''}
                 onChange={(e) => setUserSettings({...userSettings, weight: e.target.value})}
                 className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                 placeholder="70"
               />
             </div>
          </div>

          <div>
             <label className="text-xs text-zinc-400 mb-1.5 block">Activity Level</label>
             <select 
               value={userSettings.activityLevel || 'moderate'}
               onChange={(e) => setUserSettings({...userSettings, activityLevel: e.target.value})}
               className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm appearance-none"
             >
               <option value="sedentary">Sedentary (Office job)</option>
               <option value="light">Light Active (1-2 days/week)</option>
               <option value="moderate">Moderate (3-5 days/week)</option>
               <option value="active">Active (6-7 days/week)</option>
               <option value="athlete">Athlete (2x per day)</option>
             </select>
          </div>
       </div>

       {/* Goals */}
       <div className="space-y-4 pt-4 border-t border-zinc-900">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Goals & Preferences</h3>
          
          <div>
             <label className="text-xs text-zinc-400 mb-1.5 block">Fitness Goal</label>
             <textarea 
               rows="2"
               placeholder="e.g. Build muscle, run a 5k"
               value={userSettings.fitnessGoal || ''}
               onChange={(e) => setUserSettings({...userSettings, fitnessGoal: e.target.value})}
               className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm resize-none"
             />
          </div>

          <div>
             <label className="text-xs text-zinc-400 mb-1.5 block">Diet Goal</label>
             <textarea 
               rows="2"
               placeholder="e.g. 2500 calories, 180g protein"
               value={userSettings.dietGoal || ''}
               onChange={(e) => setUserSettings({...userSettings, dietGoal: e.target.value})}
               className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm resize-none"
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs text-zinc-400 mb-1.5 block">Diet Type</label>
               <input 
                 type="text" 
                 placeholder="Keto, Vegan..."
                 value={userSettings.dietaryPreferences || ''}
                 onChange={(e) => setUserSettings({...userSettings, dietaryPreferences: e.target.value})}
                 className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
               />
             </div>
             <div>
               <label className="text-xs text-zinc-400 mb-1.5 block">Fasting Goal (h)</label>
               <input 
                 type="number" 
                 value={userSettings.fastingGoal}
                 onChange={(e) => setUserSettings({...userSettings, fastingGoal: parseInt(e.target.value) || 16})}
                 className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
               />
             </div>
          </div>
       </div>

       {/* API Key */}
       <div className="pt-4 border-t border-zinc-900">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-violet-400 font-bold uppercase flex items-center gap-2">
               <Sparkles size={12} /> AI Coach API Key
            </label>
            <button 
              onClick={() => setShowApiKey(!showApiKey)} 
              className="text-zinc-500 hover:text-white text-[10px] flex items-center gap-1 transition-colors"
            >
              {showApiKey ? <EyeOff size={12} /> : <Eye size={12} />}
              {showApiKey ? "Hide" : "Show"}
            </button>
          </div>
          <input 
           type={showApiKey ? "text" : "password"} 
           placeholder="sk-proj-..."
           value={apiKey}
           onChange={(e) => setApiKey(e.target.value)}
           className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 placeholder:text-zinc-700 font-mono text-xs"
          />
          <p className="text-[10px] text-zinc-600 mt-2">
            Required for the AI Coach. Stored locally in your browser.
          </p>
       </div>

       <Button onClick={onSave} disabled={isSaving} className="w-full mt-4" variant="primary">
         {isSaving ? 'Saving Changes...' : 'Save Changes'}
       </Button>
    </div>
  );

  return (
    <div className="animate-fade-in flex flex-col h-full pb-20">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
           <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700 text-xl font-bold overflow-hidden shadow-lg">
             {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
             ) : (
                <span>{userSettings.displayName.charAt(0).toUpperCase()}</span>
             )}
           </div>
           <div>
             <h2 className="text-xl font-bold text-white">{userSettings.displayName}</h2>
             <p className="text-emerald-500 text-xs font-medium flex items-center gap-1">
               {user?.isAnonymous ? "Guest Account" : "Synced Account"}
             </p>
           </div>
        </div>
        <div className="flex flex-col items-end gap-2">
           <Button variant="ghost" onClick={onClose} className="p-2 h-auto w-auto">
             <X size={20} />
           </Button>
           {user?.isAnonymous ? (
            <button onClick={onSignIn} className="text-xs text-zinc-400 hover:text-white underline">Sign In</button>
           ) : (
            <button onClick={onSignOut} className="text-xs text-zinc-500 hover:text-red-400">Sign Out</button>
           )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-zinc-900/50 rounded-xl mb-6 border border-zinc-800/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-hide">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
}
