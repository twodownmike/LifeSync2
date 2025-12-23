import { useEffect } from 'react';
import { ACHIEVEMENTS } from '../lib/constants';
import { useNotifications } from './useNotifications';

export function useAchievements(entries, userSettings, updateSettings) {
  const { sendNotification } = useNotifications();

  useEffect(() => {
    if (!entries || !userSettings || !updateSettings) return;

    const checkAchievements = () => {
      const unlocked = new Set(userSettings.unlockedAchievements || []);
      const newUnlocks = [];

      // Calculate derived stats for checks
      // Fasting hours calculation (checking all meals)
      let maxFastHrs = 0;
      for (let i = 0; i < entries.length - 1; i++) {
        if (entries[i].type === 'meal') {
            const prevMeal = entries.slice(i + 1).find(e => e.type === 'meal');
            if (prevMeal) {
                const diffMs = new Date(entries[i].timestamp) - new Date(prevMeal.timestamp);
                const hours = diffMs / (1000 * 60 * 60);
                if (hours > maxFastHrs && hours < 100) maxFastHrs = hours;
            }
        }
      }

      ACHIEVEMENTS.forEach(achievement => {
        if (unlocked.has(achievement.id)) return;

        let isUnlocked = false;
        
        // Use specific check function if available
        if (achievement.check) {
            // We pass entries and extra context (like maxFastHrs)
            isUnlocked = achievement.check(entries, maxFastHrs);
        }

        if (isUnlocked) {
            newUnlocks.push(achievement.id);
            
            // Notify user immediately
            sendNotification(`🏆 Achievement Unlocked: ${achievement.title}`, {
                body: achievement.desc,
                icon: '/vite.svg'
            });

            // Optional: Play sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'); // Success chime
            audio.play().catch(e => console.log("Audio play failed", e));
        }
      });

      if (newUnlocks.length > 0) {
        // Unlock new achievements
        const updatedList = [...(userSettings.unlockedAchievements || []), ...newUnlocks];
        updateSettings({ 
            ...userSettings, 
            unlockedAchievements: updatedList 
        });
      }
    };

    checkAchievements();
  }, [entries, userSettings.unlockedAchievements]); // Depend on entries updates
}
