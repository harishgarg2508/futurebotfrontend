
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'hi';

export interface PlanetPosition {
  name: string;
  longitude: number;
  sign: string;
  sign_id: number; // 1-12
  house: number; // 1-12
  nakshatra: string;
  isRetrograde: boolean;
  is_retrograde?: boolean; // API field
}

export interface ChartProfile {
  id: string;
  name: string;
  date: string;
  time: string;
  location: {
    lat: number;
    lon: number;
    city: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AppState {
  // UI State
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Data State
  currentProfile: ChartProfile | null;
  setCurrentProfile: (profile: ChartProfile | null) => void;
  
  savedProfiles: ChartProfile[];
  addProfile: (profile: ChartProfile) => void;
  removeProfile: (id: string) => void;
  setSavedProfiles: (profiles: ChartProfile[]) => void;
  
  // Active Chart Data (Calculated)
  currentChartData: {
    planets: Record<string, PlanetPosition>;
    ascendant: PlanetPosition;
  } | null;
  setChartData: (data: any) => void;

  // Chat State
  chatHistory: Message[];
  addMessage: (msg: Message) => void;
  clearChat: () => void;
  setChatHistory: (history: Message[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      
      currentProfile: null,
      setCurrentProfile: (profile) => set({ currentProfile: profile, currentChartData: null }),
      
      savedProfiles: [],
      addProfile: (profile) => set((state) => ({ 
        savedProfiles: [...state.savedProfiles, profile] 
      })),
      removeProfile: (id) => set((state) => ({
        savedProfiles: state.savedProfiles.filter(p => p.id !== id)
      })),
      setSavedProfiles: (profiles) => set({ savedProfiles: profiles }),
      
      currentChartData: null,
      setChartData: (data) => set({ currentChartData: data }),
      
      chatHistory: [],
      addMessage: (msg) => set((state) => ({ 
        chatHistory: [...state.chatHistory, msg] 
      })),
      clearChat: () => set({ chatHistory: [] }),
      setChatHistory: (history) => set({ chatHistory: history }),
    }),
    {
      name: 'futurebot-storage', // unique name
      partialize: (state) => ({ 
        language: state.language, 
        savedProfiles: state.savedProfiles 
      }), // Only persist language and profiles to localStorage
    }
  )
);
