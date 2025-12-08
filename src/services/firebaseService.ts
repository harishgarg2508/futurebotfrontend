
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { ChartProfile, Message } from '@/lib/store';

// Profile Actions
export async function addProfileToFirebase(uid: string, profile: ChartProfile) {
  console.log("Saving profile to Firebase:", profile);
  await setDoc(doc(db, 'users', uid, 'profiles', profile.id), {
    id: profile.id,
    name: profile.name,
    gender: profile.gender || "male", // Ensure gender is saved, defaulting to male if missing
    date: profile.date,
    time: profile.time,
    location: profile.location,
    createdAt: Date.now()
  });
}

export async function removeProfileFromFirebase(uid: string, profileId: string) {
  await deleteDoc(doc(db, 'users', uid, 'profiles', profileId));
}

// Chat Actions
export async function sendMessageToFirebase(uid: string, profileId: string, message: Message) {
  // Use setDoc to use the client-generated ID
  await setDoc(doc(db, 'users', uid, 'profiles', profileId, 'chats', message.id), {
    role: message.role,
    content: message.content,
    timestamp: message.timestamp
  });
}
