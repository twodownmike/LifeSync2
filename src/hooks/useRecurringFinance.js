import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

export function useRecurringFinance(user, addEntry) {
  const [recurringItems, setRecurringItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Recurring Items
  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }
    
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'recurring');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecurringItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Process Recurring Items (Check if due)
  useEffect(() => {
    if (!user || loading || recurringItems.length === 0) return;

    const processRecurring = async () => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

        for (const item of recurringItems) {
            if (!item.nextDueDate) continue;
            
            // Check if due date is today or in the past
            if (item.nextDueDate <= todayStr) {
                console.log(`Processing recurring item: ${item.title}`);
                
                // 1. Create the Transaction Entry
                await addEntry({
                    type: 'finance',
                    title: item.title,
                    amount: parseFloat(item.amount),
                    isExpense: item.isExpense,
                    category: item.category,
                    timestamp: new Date().toISOString(),
                    note: 'Recurring Transaction',
                    tags: ['recurring']
                });

                // 2. Calculate Next Due Date
                const currentDue = new Date(item.nextDueDate);
                let nextDate = new Date(currentDue);
                
                if (item.frequency === 'weekly') {
                    nextDate.setDate(nextDate.getDate() + 7);
                } else if (item.frequency === 'biweekly') {
                    nextDate.setDate(nextDate.getDate() + 14);
                } else if (item.frequency === 'monthly') {
                    nextDate.setMonth(nextDate.getMonth() + 1);
                } else if (item.frequency === 'yearly') {
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                }

                // Ensure next date is in the future if we missed multiple cycles
                // (Optional simplified logic: just set to next interval from NOW if significantly behind, 
                // but usually standard is to catch up or just advance from last due)
                // For simplicity/safety, let's just advance from the stored due date. 
                // If it's still in the past (e.g. app wasn't opened for months), this loop will catch it on next render/effect cycle 
                // or we could loop here. Let's handle one cycle per mounting/check to avoid mass spam if safe.
                
                const nextDateStr = nextDate.toISOString().split('T')[0];

                // 3. Update Recurring Item
                await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'recurring', item.id), {
                    nextDueDate: nextDateStr,
                    lastProcessed: new Date().toISOString()
                });
            }
        }
    };

    processRecurring();
  }, [user, recurringItems, loading]); // Depend on recurringItems so we re-check if list changes

  const addRecurringItem = async (data) => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'recurring'), {
        ...data,
        createdAt: new Date().toISOString()
    });
  };

  const deleteRecurringItem = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'recurring', id));
  };

  return {
    recurringItems,
    addRecurringItem,
    deleteRecurringItem
  };
}
