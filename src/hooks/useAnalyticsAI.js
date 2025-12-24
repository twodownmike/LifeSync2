import { useState } from 'react';

export function useAnalyticsAI(apiKey, userSettings, entries, fastingAnalysis, focusStats, weeklyActivity, weightTrends) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateAnalysis = async () => {
    const cleanedKey = apiKey?.trim();
    if (!cleanedKey || !cleanedKey.startsWith('sk-')) {
       setError("Invalid API Key. Please check settings.");
       return;
    }

    setLoading(true);
    setError(null);

    try {
        // Construct Context
        const statsContext = `
          ### USER PROFILE
          - Name: ${userSettings.displayName}
          - Goals: ${userSettings.fitnessGoal} (Fitness), ${userSettings.dietGoal} (Diet)
          - Fasting Goal: ${userSettings.fastingGoal}h

          ### KEY METRICS (Last 30 Days)
          - Average Fast: ${fastingAnalysis.avg}h
          - Longest Fast: ${fastingAnalysis.longest.toFixed(1)}h
          - Total Deep Work: ${focusStats}h
          - Streak: ${entries.length > 0 ? 'Active' : 'Inactive'}

          ### WEEKLY ACTIVITY (Last 7 Days)
          ${weeklyActivity.map(d => `- ${d.label}: ${d.meals} meals, ${d.workouts} workouts, ${d.focus} focus sessions`).join('\n')}

          ### WEIGHT TRENDS (Last 20 entries)
          ${weightTrends.length > 0 ? weightTrends.map(w => `- ${w.date}: ${w.value}lbs`).join('\n') : "No weight data recorded."}
        `;

        const systemPrompt = `
          You are an elite health data analyst. 
          Your job is to review the user's recent health data and provide a concise, high-impact analysis.
          
          STRUCTURE YOUR RESPONSE IN MARKDOWN:
          1. **Executive Summary**: 1-2 sentences on their overall progress.
          2. **Wins**: Bullet points of what they are doing well (consistency, fasting adherence, etc.).
          3. **Opportunities**: Bullet points of areas for improvement based on their goals.
          4. **Action Plan**: 3 specific, actionable steps for the next week.

          TONE: Professional, encouraging, but direct. No fluff.
        `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cleanedKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Here is my recent data:\n${statsContext}` }
              ],
              max_tokens: 800
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        setAnalysis(data.choices[0].message.content);

    } catch (err) {
       console.error("Analysis Error", err);
       setError(err.message || "Failed to generate analysis.");
    } finally {
       setLoading(false);
    }
  };

  return { analysis, loading, error, generateAnalysis, setAnalysis };
}
