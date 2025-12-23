import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

export function useCoach(user, apiKey, entries, userSettings, fastingData, bioPhase) {
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

        const allMeals = entries.filter(e => e.type === 'meal').map(e => 
            `- ${new Date(e.timestamp).toLocaleDateString()} ${new Date(e.timestamp).toLocaleTimeString()}: ${e.title} (${e.note || ''})`
        ).join('\n');

        const allWorkouts = entries.filter(e => e.type === 'workout').map(e => {
            const exercises = e.exercises ? e.exercises.map(ex => `${ex.name} ${ex.weight}lb x ${ex.reps}`).join(', ') : '';
            return `- ${new Date(e.timestamp).toLocaleDateString()}: ${e.title} ${exercises ? '[' + exercises + ']' : ''} (${e.note || ''})`;
        }).join('\n');

        const allJournals = entries.filter(e => e.type === 'journal').map(e => 
            `- ${new Date(e.timestamp).toLocaleDateString()}: ${e.title} - ${e.note || ''}`
        ).join('\n');
        
        const lastMeal = entries.find(e => e.type === 'meal');

        const fastingContext = `
        Current Fasting Status:
        - State: ${fastingData.label}
        - Hours Fasted: ${fastingData.hours} hours, ${fastingData.minutes} minutes
        - Last Meal: ${lastMeal ? new Date(lastMeal.timestamp).toLocaleString() : 'None recorded'}
        `;

        const currentTime = new Date();

        const systemPrompt = `
          You are LifeSync AI, an elite fitness and lifestyle coach.
          
          USER PROFILE:
          - Name: ${userSettings.displayName}
          - Fitness Goal: ${userSettings.fitnessGoal || 'General Health'}
          - Diet Goal: ${userSettings.dietGoal || 'Eat Healthy'}
          - Dietary Prefs: ${userSettings.dietaryPreferences || 'Balanced'}
          - Current Time: ${currentTime.toLocaleString()}
          - Bio Phase: ${bioPhase.title} (${bioPhase.desc})
          
          FASTING DATA:
          ${fastingContext}
          
          HISTORY & LOGS:
          [MEAL LOGS]
          ${allMeals || "No meals logged."}
          
          [WORKOUT LOGS]
          ${allWorkouts || "No workouts logged."}
          
          [JOURNAL ENTRIES]
          ${allJournals || "No journal entries."}

          Respond with a concise, punchy, markdown formatted plan or answer. 
          Use ### for headers and ** for bold. Keep it actionable.
          Always consider the specific Fitness and Diet Goals provided.
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
              max_tokens: 500
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
