import React from 'react';
import { X, Lock, Trophy } from 'lucide-react';
import { ACHIEVEMENTS } from '../lib/constants';

export default function TrophyRoom({ onClose, unlockedIds = [] }) {
  const unlockedSet = new Set(unlockedIds);

  const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const tierColors = {
    bronze: 'from-orange-700 to-orange-900 border-orange-800 text-orange-200',
    silver: 'from-zinc-400 to-zinc-600 border-zinc-500 text-zinc-100',
    gold: 'from-yellow-500 to-yellow-700 border-yellow-600 text-yellow-100',
    platinum: 'from-cyan-400 to-cyan-600 border-cyan-500 text-cyan-100',
    diamond: 'from-violet-500 to-violet-700 border-violet-600 text-violet-100'
  };

  const tierLabels = {
    bronze: 'Bronze Tier',
    silver: 'Silver Tier',
    gold: 'Gold Tier',
    platinum: 'Platinum Tier',
    diamond: 'Diamond Tier'
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-zinc-950 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-zinc-800 flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Background Ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/5 blur-3xl rounded-full -ml-20 -mb-20 pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-zinc-800/50 relative z-10">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-yellow-500">
                 <Trophy size={24} />
              </div>
              <div>
                 <h2 className="text-2xl font-bold text-white tracking-tight">Trophy Room</h2>
                 <p className="text-zinc-500 text-sm">
                    {unlockedSet.size} / {ACHIEVEMENTS.length} Unlocked
                 </p>
              </div>
           </div>
           <button 
             onClick={onClose}
             className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
           >
              <X size={20} />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 scrollbar-hide relative z-10">
           {tiers.map((tier) => {
              const tierAchievements = ACHIEVEMENTS.filter(a => a.tier === tier);
              if (tierAchievements.length === 0) return null;

              return (
                 <div key={tier} className="space-y-4">
                    <h3 className={`text-sm font-bold uppercase tracking-widest pl-1 opacity-70 ${tierColors[tier].split(' ')[2]}`}>
                       {tierLabels[tier]}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       {tierAchievements.map(achievement => {
                          const isUnlocked = unlockedSet.has(achievement.id);
                          const Icon = achievement.icon;
                          
                          return (
                             <div 
                               key={achievement.id}
                               className={`
                                  relative p-4 rounded-2xl border transition-all duration-300 group
                                  ${isUnlocked 
                                    ? `bg-gradient-to-br ${tierColors[tier].split(' ').slice(0,2).join(' ')}/10 border-white/5 hover:border-white/10` 
                                    : 'bg-zinc-900/30 border-zinc-800/50 opacity-60 grayscale'}
                               `}
                             >
                                <div className="flex items-start gap-4">
                                   <div className={`
                                      p-3 rounded-xl flex-shrink-0 relative overflow-hidden
                                      ${isUnlocked 
                                        ? `bg-gradient-to-br ${tierColors[tier]} shadow-lg` 
                                        : 'bg-zinc-800 text-zinc-600'}
                                   `}>
                                      {isUnlocked ? <Icon size={20} className="text-white" /> : <Lock size={20} />}
                                      
                                      {/* Shine effect */}
                                      {isUnlocked && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 skew-y-12"></div>}
                                   </div>
                                   
                                   <div>
                                      <h4 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>
                                         {achievement.title}
                                      </h4>
                                      <p className="text-xs text-zinc-500 leading-snug">
                                         {achievement.desc}
                                      </p>
                                      {isUnlocked && (
                                         <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-black/20 border border-white/10">
                                            <span>+{achievement.points} XP</span>
                                         </div>
                                      )}
                                   </div>
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 </div>
              );
           })}
        </div>

      </div>
    </div>
  );
}
