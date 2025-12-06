
"use client";

import { useEffect } from 'react';
import { useAppStore, ChartProfile } from '@/lib/store';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

export function useProfileSync() {
  const { user } = useAuth();
  const setSavedProfiles = useAppStore((state) => state.setSavedProfiles);

  // Sync Profiles from Firebase
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'profiles'), 
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const profiles: ChartProfile[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          date: data.date,
          time: data.time,
          location: data.location
        };
      });
      setSavedProfiles(profiles);
    });

    return () => unsubscribe();
  }, [user, setSavedProfiles]);
}
