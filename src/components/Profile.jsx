import React, { useState } from 'react';
import { 
  X, Settings, LogIn, LogOut, Sparkles, Eye, EyeOff 
} from 'lucide-react';
import { Card, Button } from './UI';

export default function Profile({ 
  user, 
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
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Profile</h2>
        <Button variant="ghost" onClick={onClose}>
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
              onClick={onSignIn}
              className="flex items-center gap-2 text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold hover:bg-gray-200 transition-colors"
            >
              <LogIn size={12} />
              Sign in with Google
            </button>
          ) : (
            <button 
              onClick={onSignOut}
              className="flex items-center gap-2 text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full font-medium hover:bg-zinc-700 transition-colors"
            >
              <LogOut size={12} />
              Sign Out
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-4 text-emerald-400">
            <Settings size={20} />
            <h3 className="font-bold text-white">Settings</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="text-xs text-zinc-500 font-medium uppercase block mb-2">Display Name</label>
              <input 
                type="text" 
                value={userSettings.displayName}
                onChange={(e) => setUserSettings({...userSettings, displayName: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="text-xs text-zinc-500 font-medium uppercase block mb-2">Fitness Goal</label>
                  <textarea 
                    rows="3"
                    placeholder="e.g. Build muscle, hit 225lb bench, run a 5k"
                    value={userSettings.fitnessGoal || ''}
                    onChange={(e) => setUserSettings({...userSettings, fitnessGoal: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
               </div>
               
               <div>
                  <label className="text-xs text-zinc-500 font-medium uppercase block mb-2">Diet Goal</label>
                  <textarea 
                    rows="3"
                    placeholder="e.g. Eat 180g protein, stay under 2500 cals"
                    value={userSettings.dietGoal || ''}
                    onChange={(e) => setUserSettings({...userSettings, dietGoal: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 font-medium uppercase block mb-2">Dietary Preferences</label>
                <input 
                  type="text" 
                  placeholder="e.g. Keto, Vegan"
                  value={userSettings.dietaryPreferences || ''}
                  onChange={(e) => setUserSettings({...userSettings, dietaryPreferences: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-medium uppercase block mb-2">Fasting Goal (h)</label>
                <input 
                  type="number" 
                  value={userSettings.fastingGoal}
                  onChange={(e) => setUserSettings({...userSettings, fastingGoal: parseInt(e.target.value) || 16})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 mt-2">
               <div className="flex justify-between items-center mb-2">
                 <label className="text-xs text-violet-400 font-medium uppercase flex items-center gap-2">
                    <Sparkles size={12} /> OpenAI API Key
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 placeholder:text-zinc-700 font-mono text-sm"
               />
               <p className="text-[10px] text-zinc-500 mt-1">
                 Saved locally in your browser. Never synced to server.
               </p>
             </div>

              <Button onClick={onSave} disabled={isSaving} className="w-full mt-2">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
  );
}
