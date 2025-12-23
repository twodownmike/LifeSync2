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
  const [routines, setRoutines] = useState([]);
  const [userSettings, setUserSettings] = useState({ 
    displayName: 'Guest', 
    fastingGoal: 16,
    fitnessGoal: '',
    dietGoal: '', 
    dietaryPreferences: '',
    unlockedAchievements: [],
    activeDetox: null 
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

  // Fetch Routines
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'routines');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRoutines = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoutines(fetchedRoutines);
    });
    return () => unsubscribe();
  }, [user]);

  // Actions
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

  const createRoutine = async (routineData) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'routines'), {
        ...routineData,
        completedDates: []
      });
    } catch (err) {
      console.error("Error creating routine:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRoutine = async (routineId, isCompleted) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    
    let newDates = routine.completedDates || [];
    if (isCompleted) {
      newDates = newDates.filter(d => d !== today);
    } else {
      newDates.push(today);
    }

    try {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'routines', routineId), {
        completedDates: newDates
      });
    } catch(err) {
      console.error("Error updating routine:", err);
      throw err;
    }
  };

  const deleteRoutine = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'routines', id));
    } catch (err) { 
        console.error(err); 
        throw err;
    }
  };

  return {
    entries,
    routines,
    userSettings,
    isSaving,
    addEntry,
    deleteEntry,
    updateSettings,
    createRoutine,
    toggleRoutine,
    deleteRoutine,
    setUserSettings // Exporting setter for local form state updates if needed, though updateSettings handles sync
  };
}
