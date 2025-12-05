'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepName from '@/components/onboarding/StepName';
import StepDate from '@/components/onboarding/StepDate';
import StepTime from '@/components/onboarding/StepTime';
import StepLocation from '@/components/onboarding/StepLocation';
import PlanetarySidebar from '@/components/dashboard/PlanetarySidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import { getBirthChart } from '@/services/api/birthChart';
import { Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import StepLogin from '@/components/onboarding/StepLogin';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, addDoc, getDocs } from 'firebase/firestore';

import ChartList from '@/components/dashboard/ChartList';

type Phase = 'landing' | 'dashboard' | 'name' | 'date' | 'time' | 'location' | 'login' | 'awakening' | 'consultation';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('landing');
  const [userData, setUserData] = useState({
    name: '',
    date: '',
    time: '',
    location: { name: '', lat: 0, lon: 0 },
  });
  const [chartData, setChartData] = useState<any>(null);
  const [awakeningMessage, setAwakeningMessage] = useState('Consulting the Ephemeris...');
  const { user } = useAuth();

  // Hydrate from LocalStorage or Firestore
  React.useEffect(() => {
    const hydrate = async () => {
      // 1. Try LocalStorage
      const saved = localStorage.getItem('vedicUser');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUserData(parsed);
        if (parsed.name && parsed.date && parsed.time && parsed.location?.lat) {
           // Data loaded from local
        }
        return; 
      }

      // 2. Try Firestore if logged in
      if (user) {
        try {
          // Assuming we store the latest chart or user profile in a standard path
          // For now, let's look for the most recent chart in the subcollection
          const chartsRef = collection(db, 'users', user.uid, 'charts');
          // In a real app we'd order by createdAt desc and limit 1
          const snapshot = await getDocs(chartsRef);
          if (!snapshot.empty) {
            const firstDoc = snapshot.docs[0].data();
            // Map back to userData structure if needed
            setUserData({
                name: firstDoc.name,
                date: firstDoc.date,
                time: firstDoc.time,
                location: firstDoc.location
            });
            // Also save to local for next time
            localStorage.setItem('vedicUser', JSON.stringify(firstDoc));
          }
        } catch (err) {
            console.error("Hydration failed", err);
        }
      }
    };

    hydrate();
  }, [user]);

  const saveUserData = async (data: typeof userData) => {
    // Save to LocalStorage
    localStorage.setItem('vedicUser', JSON.stringify(data));

    // Save to Firestore if logged in
    if (user) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'charts'), {
          ...data,
          createdAt: new Date(),
        });
      } catch (e) {
        console.error("Error saving to Firestore", e);
      }
    }
  };

  const handleNext = (data: any) => {
    setUserData((prev) => ({ ...prev, ...data }));
    
    if (phase === 'name') setPhase('date');
    else if (phase === 'date') setPhase('time');
    else if (phase === 'time') setPhase('location');
    else if (phase === 'location') {
      setUserData((prev) => ({ ...prev, location: data }));
      setPhase('login');
    } else if (phase === 'login') {
      setPhase('awakening');
      const finalData = { ...userData }; // Ensure we have the latest
      saveUserData(finalData);
      fetchChart(finalData);
    }
  };

  const handleBack = () => {
    if (phase === 'date') setPhase('name');
    else if (phase === 'time') setPhase('date');
    else if (phase === 'location') setPhase('time');
    else if (phase === 'login') setPhase('location');
  };

  const fetchChart = async (finalData: typeof userData) => {
    try {
      // Simulate "Waking up" message if it takes too long
      const timeout = setTimeout(() => {
        setAwakeningMessage('Waking up the Oracle... please wait...');
      }, 3000);

      const data = await getBirthChart({
        date: finalData.date,
        time: finalData.time,
        lat: finalData.location.lat,
        lon: finalData.location.lon,
      });
      
      clearTimeout(timeout);
      setChartData(data);
      setPhase('consultation');
    } catch (error) {
      console.error('Failed to fetch chart:', error);
      setAwakeningMessage('The stars are silent. Please try again later.');
      // Ideally show a retry button here
    }
  };

  const handleSendMessage = async (message: string) => {
    // Call the Chat API route
    const response = await axios.post('/api/chat', {
      message,
      userData,
      chartData, // Pass context if needed, or let the backend handle it via session/tools
      // Ideally, we send the message and the backend uses the tools (getTransits etc)
      // We might need to send the user's birth details so the backend tools can use them
    });
    return response.data.response;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-vedic-blue text-white selection:bg-vedic-gold/30">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/stars.png')] opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-vedic-blue/50 to-vedic-blue pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {phase === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center space-y-8 z-10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-full border border-vedic-gold/20 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-vedic-gold/40 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-vedic-gold" />
                </div>
              </div>
            </motion.div>
            
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-vedic-gold to-vedic-gold-light">
                VedicAI
              </h1>
              <p className="text-xl text-gray-400 font-light tracking-wide">
                The Autonomous Astrological Agent
              </p>
            </div>

            <button
              onClick={() => setPhase('name')}
              className="px-8 py-4 glass-button rounded-full text-lg tracking-widest uppercase hover:bg-vedic-gold hover:text-vedic-blue transition-all duration-500"
            >
              Enter the Void
            </button>
            
            {user && (
              <button
                onClick={() => setPhase('dashboard')}
                className="mt-4 text-sm text-gray-400 hover:text-vedic-gold transition-colors"
              >
                View Saved Charts
              </button>
            )}
          </motion.div>
        )}

        {phase === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="w-full min-h-screen pt-20"
          >
            <ChartList 
              onSelectChart={(chart) => {
                setUserData(chart);
                setPhase('awakening');
                fetchChart(chart);
              }}
              onNewChart={() => setPhase('name')}
            />
          </motion.div>
        )}

        {phase === 'name' && <StepName key="name" onNext={(name) => handleNext({ name })} />}
        
        {phase === 'date' && (
          <StepDate
            key="date"
            name={userData.name}
            onNext={(date) => handleNext({ date })}
            onBack={handleBack}
          />
        )}
        
        {phase === 'time' && (
          <StepTime
            key="time"
            onNext={(time) => handleNext({ time })}
            onBack={handleBack}
          />
        )}
        
        {phase === 'location' && (
          <StepLocation
            key="location"
            onNext={(location) => handleNext(location)}
            onBack={handleBack}
          />
        )}

        {phase === 'login' && (
          <StepLogin
            key="login"
            onNext={() => handleNext({})}
            onBack={handleBack}
          />
        )}

        {phase === 'awakening' && (
          <motion.div
            key="awakening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center space-y-6 z-10"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-vedic-gold/20 blur-xl rounded-full animate-pulse" />
              <Loader2 className="w-16 h-16 text-vedic-gold animate-spin relative z-10" />
            </div>
            <p className="text-xl text-vedic-gold font-serif animate-pulse">
              {awakeningMessage}
            </p>
          </motion.div>
        )}

        {phase === 'consultation' && (
          <motion.div
            key="consultation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex w-full h-screen"
          >
            <PlanetarySidebar chartData={chartData} />
            <div className="flex-1 h-full flex flex-col bg-vedic-blue/50 backdrop-blur-sm">
              {/* 3D Chart View Toggle or Split View */}
              <div className="flex-1 overflow-hidden">
                <ChatInterface
                  initialMessage={`I see you are a ${chartData?.ascendant?.sign || 'seeker'} Ascendant with a powerful Sun... What do you seek to know?`}
                  userData={userData}
                  chartData={chartData}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
