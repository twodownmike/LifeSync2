import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

export function useCoach(user, apiKey, entries, routines, userSettings, fastingData, bioPhase) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch Messages
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'artifacts', appId, 'users', user.uid, 'coach_messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Scroll to bottom on new messages
      setTimeout(() => {
        if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    });
    return () => unsubscribe();
  }, [user]);

  const clearChat = async () => {
    if (!user || messages.length === 0) return;
    if (!window.confirm("Clear your conversation history?")) return;
    
    try {
      const msgsToDelete = [...messages];
      setMessages([]); // Optimistic update
      
      const deletePromises = msgsToDelete.map(msg => 
        deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'coach_messages', msg.id))
      );
      await Promise.all(deletePromises);
    } catch (err) {
      console.error("Error clearing chat:", err);
    }
  };

  const sendMessage = async (textInput) => {
    const cleanedKey = apiKey.trim();
    if (!cleanedKey || !cleanedKey.startsWith('sk-')) {
       alert("Invalid API Key. Please check settings.");
       return;
    }
    if (!textInput || !textInput.trim()) return;

    setLoading(true);

    try {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'coach_messages'), {
            role: 'user',
            content: textInput,
            createdAt: new Date().toISOString()
        });

        // --- Context Building ---

        // 1. Logs
        const formatMood = (e) => {
            if (!e.mood && !e.energy) return '';
            return `[Mood: ${e.mood || '-'}/10, Energy: ${e.energy || '-'}/10]`;
        };

        const allMeals = entries
            .filter(e => e.type === 'meal')
            .slice(0, 10) // Limit context
            .map(e => `- ${new Date(e.timestamp).toLocaleDateString()} ${new Date(e.timestamp).toLocaleTimeString()}: ${e.title} ${formatMood(e)} (${e.note || ''})`)
            .join('\n');

        const allWorkouts = entries
            .filter(e => e.type === 'workout')
            .slice(0, 10)
            .map(e => {
                const exercises = e.exercises ? e.exercises.map(ex => `${ex.name} ${ex.weight}lb x ${ex.reps}`).join(', ') : '';
                return `- ${new Date(e.timestamp).toLocaleDateString()}: ${e.title} ${formatMood(e)} ${exercises ? '{' + exercises + '}' : ''}`;
            }).join('\n');

        const allJournals = entries
            .filter(e => e.type === 'journal' || e.type === 'breathwork' || e.type === 'work_session')
            .slice(0, 10)
            .map(e => `- ${new Date(e.timestamp).toLocaleDateString()}: [${e.type.toUpperCase()}] ${e.title} ${formatMood(e)} - ${e.note || ''}`)
            .join('\n');

        // 2. Routines
        const todayIndex = new Date().getDay();
        const routineContext = routines.map(r => {
            const isToday = r.days.includes(todayIndex);
            const isDone = (r.completedDates || []).includes(new Date().toISOString().split('T')[0]);
            return `- ${r.title} (${r.type}): ${isToday ? (isDone ? "DONE" : "PENDING") : "Not scheduled today"}`;
        }).join('\n');
        
        // 3. Physiology
        const totalFastHours = fastingData.hours + (fastingData.minutes/60);
        let physioState = "Normal fed state";
        if (totalFastHours > 18) physioState = "Deep Autophagy (Cellular Repair Mode)";
        else if (totalFastHours > 12) physioState = "Ketosis (Fat Burning Mode)";
        else if (totalFastHours > 4) physioState = "Fasting State (Insulin Dropping)";
        else if (totalFastHours > 0) physioState = "Digesting / Absorbative Phase";

        const systemPrompt = `
          You are LifeSync AI, an elite bio-hacking coach and health strategist.
          Your goal is to optimize the user's energy, focus, and longevity using their real-time data.
          
          ### USER PROFILE
          - **Name:** ${userSettings.displayName}
          - **Stats:** ${userSettings.age || '?'}yo, ${userSettings.weight || '?'}lbs, ${userSettings.height || '?'}
          - **Goals:** ${userSettings.fitnessGoal} (Fitness), ${userSettings.dietGoal} (Diet)
          - **Bio Phase:** ${bioPhase.title} (${bioPhase.desc}) -> Tailor advice to this circadian phase.
          
          ### REAL-TIME PHYSIOLOGY
          - **Fasting:** ${fastingData.hours}h ${fastingData.minutes}m (${fastingData.label})
          - **State:** ${physioState}
          - **Goal:** ${userSettings.fastingGoal}h

          ### ROUTINE STATUS (Today)
          ${routineContext || "No active routines."}
          
          ### RECENT LOGS (Last 10 Entries)
          **Meals:**
          ${allMeals || "No recent meals."}
          
          **Workouts:**
          ${allWorkouts || "No recent workouts."}
          
          **Activity & Mood:**
          ${allJournals || "No recent activity."}

          ### GUIDELINES
          1. **Be Concise & Punchy:** Avoid long paragraphs. Use bullet points and short sentences.
          2. **Data-Driven:** Reference specific logs, mood ratings, or metrics (e.g., "I see your energy was low after that meal...").
          3. **Bio-Rhythm Aware:** If it's late (Phase: Recover), suggest winding down. If early (Phase: Prime), suggest action.
          4. **Hard Truths:** If the user is missing routines or breaking fasts early, call them out gently but firmly.
          5. **Formatting:**
             - Use '###' for small section headers.
             - Use '> ' for a "Key Takeaway" or "Quote of the Moment" at the end.
             - Use '**bold**' for emphasis.
             - Use numbered lists for action plans.
        `;

        const history = messages.map(m => ({ role: m.role, content: m.content }));

        const apiMessages = [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: textInput }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cleanedKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: apiMessages,
              max_tokens: 600
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'coach_messages'), {
            role: 'assistant',
            content: data.choices[0].message.content,
            createdAt: new Date().toISOString()
        });

    } catch (error) {
       console.error("AI Error", error);
       alert("Error communicating with Coach. Check API key.");
    } finally {
       setLoading(false);
    }
  };

  return { messages, loading, sendMessage, clearChat, chatEndRef };
}
