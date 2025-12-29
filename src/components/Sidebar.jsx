import React from 'react';
import { Home, Clock, Brain, TrendingUp, Sparkles, LogOut, Settings, Wallet } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onSignOut, userPhoto, userName }) {
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'fasting', label: 'Fasting', icon: Clock },
    { id: 'focus', label: 'Focus Mode', icon: Brain },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'coach', label: 'AI Coach', icon: Sparkles },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-zinc-950 border-r border-zinc-900 pt-8 pb-6 px-4">
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-4 mb-10">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center transform rotate-3 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
           <svg 
             viewBox="0 0 24 24" 
             fill="none" 
             stroke="currentColor" 
             strokeWidth="3" 
             strokeLinecap="round" 
             strokeLinejoin="round" 
             className="text-black w-5 h-5"
           >
             <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
           </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">LifeSync</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-zinc-900 text-white shadow-inner border border-zinc-800/50' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
                }`}
            >
              <Icon 
                size={20} 
                className={`transition-colors ${isActive ? 'text-emerald-500' : 'group-hover:text-zinc-400'}`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="pt-6 border-t border-zinc-900 mt-4">
         <button 
           onClick={() => setActiveTab('profile')}
           className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all
             ${activeTab === 'profile' ? 'bg-zinc-900 border border-zinc-800' : 'hover:bg-zinc-900/30'}
           `}
         >
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center text-zinc-400">
               {userPhoto ? (
                 <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-xs font-bold">{userName?.charAt(0) || 'U'}</span>
               )}
            </div>
            <div className="flex-1 text-left">
               <div className="text-sm font-bold text-white truncate">{userName || 'Guest'}</div>
               <div className="text-[10px] text-zinc-500">View Profile</div>
            </div>
            <Settings size={16} className="text-zinc-600" />
         </button>
      </div>
    </aside>
  );
}
