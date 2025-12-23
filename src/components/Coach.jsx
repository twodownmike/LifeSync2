import React, { useState } from 'react';
import { Calendar, Dumbbell, Utensils, Zap, Trash2, Key, Sparkles, User, Send, Brain } from 'lucide-react';
import { Button } from './UI';
import { MarkdownText } from './MarkdownText';
import { useCoach } from '../hooks/useCoach';

export default function Coach({ user, apiKey, entries, userSettings, fastingData, bioPhase, onOpenSettings }) {
  const { messages, loading, sendMessage, clearChat, chatEndRef } = useCoach(user, apiKey, entries, userSettings, fastingData, bioPhase);
  const [chatInput, setChatInput] = useState('');

  const quickActions = [
    { label: "Daily Plan", icon: Calendar, prompt: "Generate a specific plan for today considering my recent logs and goals." },
    { label: "Workout", icon: Dumbbell, prompt: "Suggest a workout for me right now." },
    { label: "Meal Idea", icon: Utensils, prompt: "Suggest a meal that fits my diet and current fasting state." },
    { label: "Motivation", icon: Zap, prompt: "I need some motivation. Give me a hard truth based on the dopamine protocol." },
  ];

  const handleSend = () => {
    sendMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative">
      <div className="flex-shrink-0 flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/20 rounded-full text-violet-400">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">AI Coach</h2>
        </div>
        
        {messages.length > 0 && (
          <button 
            onClick={clearChat}
            className="p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-full hover:bg-zinc-800"
            title="Reset Chat"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {!apiKey && (
         <div className="flex-shrink-0 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center space-y-2 mb-4 mx-1">
            <Key className="mx-auto text-red-400" size={24} />
            <h3 className="font-bold text-white text-sm">API Key Missing</h3>
            <Button variant="secondary" onClick={onOpenSettings} className="w-full h-8 text-xs">Go to Settings</Button>
         </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-6 pb-36">
         {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-100">
              <div className="space-y-2">
                 <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto border border-zinc-800">
                    <Brain size={32} className="text-violet-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white">Hello, {userSettings.displayName}</h3>
                 <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                   I'm ready to analyze your data. What's on your mind?
                 </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 w-full px-2">
                {quickActions.map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => sendMessage(action.prompt)}
                    className="flex flex-col items-center gap-2 p-4 bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 rounded-2xl transition-all active:scale-95"
                  >
                     <action.icon size={24} className="text-violet-400" />
                     <span className="text-xs font-medium text-zinc-300">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
         ) : (
           <>
             {messages.map((msg) => (
               <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 {msg.role === 'assistant' && (
                   <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles size={14} className="text-violet-400" />
                   </div>
                 )}
                 
                 <div className={`max-w-[80%] rounded-2xl p-4 border ${
                   msg.role === 'user' 
                     ? 'bg-zinc-800 border-zinc-700 text-white rounded-tr-sm' 
                     : 'bg-zinc-900 border-zinc-800 text-zinc-200 rounded-tl-sm'
                 }`}>
                   {msg.role === 'user' ? (
                     msg.content
                   ) : (
                     <MarkdownText text={msg.content} />
                   )}
                 </div>

                 {msg.role === 'user' && (
                   <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1 border border-zinc-700">
                      <User size={14} className="text-zinc-400" />
                   </div>
                 )}
               </div>
             ))}
             
             {loading && (
               <div className="flex justify-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                     <Sparkles size={14} className="text-violet-400" />
                  </div>
                 <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex gap-2 items-center rounded-tl-sm">
                   <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></span>
                   <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-100"></span>
                   <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-200"></span>
                 </div>
               </div>
             )}
             <div ref={chatEndRef} />
           </>
         )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800 pb-safe transition-all">
         {messages.length > 0 && (
           <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
             {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(action.prompt)}
                  className="flex-shrink-0 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 whitespace-nowrap hover:text-white hover:border-zinc-700 transition-colors"
                >
                  {action.label}
                </button>
             ))}
           </div>
         )}

         <div className="p-4 pt-0">
           <div className="flex gap-2">
             <input
               type="text"
               value={chatInput}
               onChange={(e) => setChatInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Ask your coach..."
               className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 h-12 text-white focus:outline-none focus:border-violet-500 transition-colors"
             />
             <button 
               onClick={handleSend}
               disabled={loading || !chatInput.trim()}
               className="w-12 h-12 flex items-center justify-center bg-violet-600 text-white rounded-xl hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               <Send size={20} />
             </button>
           </div>
         </div>
      </div>
    </div>
  );
}
