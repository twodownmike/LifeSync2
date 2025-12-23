import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Dumbbell, Utensils, Zap, Trash2, Key, Sparkles, User, Send, Brain, Activity, Clock } from 'lucide-react';
import { Button } from './UI';
import { MarkdownText } from './MarkdownText';
import { useCoach } from '../hooks/useCoach';

export default function Coach({ user, apiKey, entries, userSettings, fastingData, bioPhase, onOpenSettings }) {
  const { messages, loading, sendMessage, clearChat, chatEndRef } = useCoach(user, apiKey, entries, userSettings, fastingData, bioPhase);
  const [chatInput, setChatInput] = useState('');

  const quickActions = [
    { label: "Daily Plan", icon: Calendar, prompt: "Generate a bio-hacked schedule for today based on my current fasting state and goals." },
    { label: "Workout", icon: Dumbbell, prompt: "Suggest a targeted workout based on my recent training history." },
    { label: "Meal Idea", icon: Utensils, prompt: "Suggest a nutrient-dense meal that fits my goals." },
    { label: "Motivation", icon: Zap, prompt: "I need a mindset shift. Give me a hard truth." },
  ];

  const handleSend = () => {
    sendMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative">
      {/* Header & Context Bar */}
      <div className="flex-shrink-0 px-2 pt-2 pb-4 bg-gradient-to-b from-black to-transparent z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-xl text-violet-400 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <Sparkles size={20} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-white leading-none">AI Coach</h2>
               <p className="text-[10px] text-zinc-500 font-mono mt-1">POWERED BY OPENAI</p>
            </div>
          </div>
          
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              className="p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
              title="Reset Chat"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Live Context Chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 rounded-full border border-zinc-800 flex-shrink-0">
              <Activity size={12} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide">{fastingData.label}</span>
           </div>
           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 rounded-full border border-zinc-800 flex-shrink-0">
              <Clock size={12} className="text-violet-400" />
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide">{bioPhase.title}: {bioPhase.desc}</span>
           </div>
        </div>
      </div>

      {!apiKey && (
         <div className="flex-shrink-0 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center space-y-2 mb-4 mx-4">
            <Key className="mx-auto text-red-400" size={24} />
            <h3 className="font-bold text-white text-sm">API Key Missing</h3>
            <Button variant="secondary" onClick={onOpenSettings} className="w-full h-8 text-xs">Go to Settings</Button>
         </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-40">
         {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8 opacity-100">
              <div className="space-y-4">
                 <div className="w-20 h-20 bg-zinc-900/50 rounded-3xl flex items-center justify-center mx-auto border border-zinc-800 shadow-2xl relative">
                    <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full"></div>
                    <Brain size={40} className="text-violet-400 relative z-10" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white">Ready to Optimize?</h3>
                    <p className="text-zinc-500 text-sm max-w-xs mx-auto mt-2 leading-relaxed">
                      I've analyzed your {fastingData.label.toLowerCase()} state and recent logs.
                    </p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                {quickActions.map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => sendMessage(action.prompt)}
                    className="flex flex-col items-center gap-2 p-4 bg-zinc-900/50 border border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-900 rounded-2xl transition-all active:scale-95 group"
                  >
                     <action.icon size={20} className="text-zinc-400 group-hover:text-violet-400 transition-colors" />
                     <span className="text-xs font-bold text-zinc-300">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
         ) : (
           <>
             {messages.map((msg) => (
               <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                 {msg.role === 'assistant' && (
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-violet-500/20">
                      <Sparkles size={14} className="text-white" />
                   </div>
                 )}
                 
                 <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                   msg.role === 'user' 
                     ? 'bg-zinc-800 text-white rounded-tr-sm' 
                     : 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 rounded-tl-sm'
                 }`}>
                   {msg.role === 'user' ? (
                     <p className="text-sm leading-relaxed">{msg.content}</p>
                   ) : (
                     <div className="text-sm leading-relaxed prose prose-invert prose-p:my-1 prose-headings:text-violet-200 prose-headings:font-bold prose-headings:text-sm prose-strong:text-violet-300">
                        <MarkdownText text={msg.content} />
                     </div>
                   )}
                   <div className={`text-[9px] mt-2 opacity-40 uppercase font-bold tracking-wider ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </div>
                 </div>

                 {msg.role === 'user' && (
                   <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1 border border-zinc-700">
                      <User size={14} className="text-zinc-400" />
                   </div>
                 )}
               </div>
             ))}
             
             {loading && (
               <div className="flex justify-start gap-3 animate-pulse">
                 <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 mt-1">
                     <Brain size={14} className="text-violet-500" />
                  </div>
                 <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex gap-2 items-center rounded-tl-sm">
                   <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                   <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-100"></span>
                   <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-200"></span>
                 </div>
               </div>
             )}
             <div ref={chatEndRef} className="h-4" />
           </>
         )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 pb-safe transition-all z-20">
         {/* Suggestions Row */}
         {messages.length > 0 && !loading && (
           <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar mask-linear-fade">
             {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(action.prompt)}
                  className="flex-shrink-0 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-400 whitespace-nowrap hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
                >
                  {action.label}
                </button>
             ))}
           </div>
         )}

         <div className="p-4 pt-0">
           <div className="flex gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all">
             <input
               type="text"
               value={chatInput}
               onChange={(e) => setChatInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Ask your coach..."
               className="flex-1 bg-transparent px-3 text-sm text-white focus:outline-none placeholder:text-zinc-600"
             />
             <button 
               onClick={handleSend}
               disabled={loading || !chatInput.trim()}
               className="w-10 h-10 flex items-center justify-center bg-violet-600 text-white rounded-xl hover:bg-violet-500 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-600 transition-all shadow-lg shadow-violet-500/20"
             >
               <Send size={16} />
             </button>
           </div>
         </div>
      </div>
    </div>
  );
}
