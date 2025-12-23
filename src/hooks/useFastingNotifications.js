import { useEffect, useRef } from 'react';
import { useNotifications } from './useNotifications';

export function useFastingNotifications(fastingData, userSettings) {
  const { sendNotification } = useNotifications();
  const lastNotifiedPhaseRef = useRef(null);

  useEffect(() => {
    if (!fastingData) return;
    
    // Convert current duration to total hours
    const totalHours = fastingData.hours + (fastingData.minutes / 60);
    const goal = userSettings.fastingGoal || 16;
    
    // Determine current phase
    let currentPhase = 'digest'; // 0-4
    if (totalHours >= 18) currentPhase = 'autophagy';
    else if (totalHours >= 12) currentPhase = 'burning';
    else if (totalHours >= 4) currentPhase = 'normal';

    const isGoalReached = totalHours >= goal;

    // Initialize ref on first run to avoid notifying for past events on reload
    if (lastNotifiedPhaseRef.current === null) {
        if (isGoalReached) lastNotifiedPhaseRef.current = 'goal_reached';
        else lastNotifiedPhaseRef.current = currentPhase;
        return;
    }

    // Check for transitions
    if (isGoalReached && lastNotifiedPhaseRef.current !== 'goal_reached') {
       sendNotification("Fasting Goal Reached! 🎉", {
          body: `You've completed your ${goal} hour fast. Great work!`,
          requireInteraction: true
       });
       lastNotifiedPhaseRef.current = 'goal_reached';
    }
    else if (!isGoalReached) {
        // Phase transitions
        if (currentPhase === 'normal' && lastNotifiedPhaseRef.current === 'digest') {
            sendNotification("Metabolic Switch 🔵", {
                body: "You've entered the Normal State. Blood sugar has stabilized."
            });
            lastNotifiedPhaseRef.current = 'normal';
        } else if (currentPhase === 'burning' && lastNotifiedPhaseRef.current === 'normal') {
            sendNotification("Fat Burning Activated 🔥", {
                body: "You've entered Ketosis. Your body is now burning fat for fuel."
            });
            lastNotifiedPhaseRef.current = 'burning';
        } else if (currentPhase === 'autophagy' && lastNotifiedPhaseRef.current === 'burning') {
             sendNotification("Autophagy Started 🧬", {
                body: "Deep cellular repair mode activated. Inflammation is decreasing."
            });
            lastNotifiedPhaseRef.current = 'autophagy';
        } else if (currentPhase === 'digest' && lastNotifiedPhaseRef.current !== 'digest') {
            // Reset occurred (meal logged)
            lastNotifiedPhaseRef.current = 'digest';
        }
    }

  }, [fastingData, userSettings.fastingGoal, sendNotification]);
}
