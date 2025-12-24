import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

export function useLifeSyncData(user) {
  const [entries, setEntries] = useState([]);
  const [userSettings, setUserSettings] = useState({ 
    displayName: 'Guest', 
    fastingGoal: 16,
    fitnessGoal: '',
    dietGoal: '', 
    dietaryPreferences: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: 'moderate',
    unlockedAchievements: [],
    activeDetox: null,
    xp: 0,
    level: 1
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Entries
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'entries');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      fetchedEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setEntries(fetchedEntries);
    }, (error) => console.error("Error fetching entries:", error));
    return () => unsubscribe();
  }, [user]);

  // Fetch Settings
  useEffect(() => {
    if (!user) return;
    const settingsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserSettings(prev => ({ ...prev, ...docSnap.data() }));
      } else if (user.displayName) {
          // Initialize display name if settings don't exist yet but auth has it
          setUserSettings(prev => ({ ...prev, displayName: user.displayName }));
      }
    }, (error) => console.error("Error fetching settings:", error));
    return () => unsubscribe();
  }, [user]);

  // Actions
  const updateSettings = async (newSettings) => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Optimistic update
      setUserSettings(newSettings);
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), newSettings);
    } catch (err) {
      console.error("Error saving settings:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const awardXP = async (amount) => {
    if (!user) return;
    
    const currentXP = userSettings.xp || 0;
    const currentLevel = userSettings.level || 1;
    const newXP = currentXP + amount;
    
    // Level Curve: Threshold for next level = currentLevel * 100.
    // Recalculate level from scratch based on total XP
    let level = 1;
    let xpCounter = 0;
    while (true) {
        const xpNeeded = level * 100;
        if (newXP >= xpCounter + xpNeeded) {
            xpCounter += xpNeeded;
            level++;
        } else {
            break;
        }
    }

    const updates = { xp: newXP };
    if (level > currentLevel) {
        updates.level = level;
    }

    const newSettings = { ...userSettings, ...updates };
    await updateSettings(newSettings);
    
    return { newXP, newLevel: level, leveledUp: level > currentLevel };
  };

  const addEntry = async (entryData) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'entries'), entryData);
    } catch (err) {
      console.error("Error adding document:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'entries', id));
    } catch (err) {
      console.error("Error deleting doc:", err);
      throw err;
    }
  };

  return {
    entries,
    userSettings,
    isSaving,
    addEntry,
    deleteEntry,
    updateSettings,
    setUserSettings,
    awardXP
  };
}
