
"use client";

import { useEffect } from 'react';
import { useAppStore, Message } from '@/lib/store';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

export function useChatSync() {
  const { user } = useAuth();
  const { currentProfile, setChatHistory } = useAppStore();

  // Sync Chat History for Current Profile
  useEffect(() => {
    if (!user || !currentProfile) {
      setChatHistory([]);
      return;
    }

    const chatsRef = collection(db, 'users', user.uid, 'profiles', currentProfile.id, 'chats');
    const q = query(chatsRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      
      setChatHistory(messages);
    });

    return () => unsubscribe();
  }, [user, currentProfile, setChatHistory]);
}
