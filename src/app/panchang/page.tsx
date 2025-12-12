"use client";

import React, { useEffect, useState } from 'react';
import SunArcHero from '@/components/panchang/SunArcHero';
import PanchangGrid from '@/components/panchang/PanchangGrid';
import ChaughadiyaRoad from '@/components/panchang/ChaughadiyaRoad';
import HoraRoad from '@/components/panchang/HoraRoad';
import RahuKaalWidget from '@/components/panchang/RahuKaalWidget';
import HoraWidget from '@/components/panchang/HoraWidget';
import ChaughadiyaWidget from '@/components/panchang/ChaughadiyaWidget';
import MonthlyHazardsComponent from '@/components/panchang/MonthlyHazards';
import LocationSearchModal from '@/components/panchang/LocationSearchModal';
import { PanchangResponse, HoraSlot } from '@/types/panchang';
import BenefitDetailsModal from '@/components/panchang/BenefitDetailsModal';
import { HORA_BENEFITS, CHAUGHADIYA_BENEFITS } from '@/components/panchang/data/benefits';
import { MapPin, Calendar } from 'lucide-react';

// Default Location: New Delhi
const DEFAULT_LOC = { lat: 28.6139, lon: 77.2090, timezone: "Asia/Kolkata", city: "New Delhi" };
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://harishgarg2508-vedic-engine.hf.space";

// Debug: Log the API URL on component load
console.log("🔧 Panchang API URL:", API_URL);
console.log("🔧 Environment Variable:", process.env.NEXT_PUBLIC_BACKEND_URL);

export default function PanchangPage() {
  const [data, setData] = useState<PanchangResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for Location & Date
  const [location, setLocation] = useState(DEFAULT_LOC);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Benefit Details Modal State
  const [benefitModal, setBenefitModal] = useState<{isOpen: boolean, type: "Hora"|"Chaughadiya", name: string, data: any}>({
      isOpen: false,
      type: "Chaughadiya",
      name: "",
      data: null
  });

  const openBenefit = (type: "Hora" | "Chaughadiya", name: string) => {
      // Create a clean lookup key
      // Chaughadiya names might be "Shubh"
      // Hora names are "Sun", "Moon", etc.
      let lookupKey = name;
      
      let data = null;
      if (type === "Hora") {
          data = HORA_BENEFITS[name];
      } else {
          // Chaughadiya might need normalization if passed "Shubh (Good)"
          // But our data uses simple names.
          data = CHAUGHADIYA_BENEFITS[name];
      }
      
      setBenefitModal({ isOpen: true, type, name, data });
  };

  // Initialize Date on Mount to Handle Midnight Changes Correctly
  useEffect(() => {
    const now = new Date();
    // Format YYYY-MM-DD manually to avoid timezone issues with toISOString() in some cases, 
    // or just use local string.
    // However, the backend expects YYYY-MM-DD.
    // Creating a local ISO string helper
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 10);
    setSelectedDate(localISOTime);
  }, []);

  useEffect(() => {
    // 1. Get User Location (Only on mount if default)
    // We only auto-detect if user hasn't manually set it? 
    // actually StepLocation logic is good but here we just align with defaults.
    // Let's run once.
    if (navigator.geolocation && location.lat === DEFAULT_LOC.lat && location.lon === DEFAULT_LOC.lon) {
       navigator.geolocation.getCurrentPosition(
         async (pos) => {
            // Reverse Geocode for City Name? Optional but good for UI.
            // For now, keep simple or fetch from OSM reverse like StepLocation did. 
            // Let's just update Lat/Lon and keep "Detected Location" or empty city.
             setLocation(prev => ({
                ...prev,
                lat: pos.coords.latitude, 
                lon: pos.coords.longitude,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                city: "Current Location"
            }));
         },
         (err) => {
             console.warn("Geolocation failed, using default:", err);
         }
       );
    }
  }, []);

  useEffect(() => {
    // 2. Fetch Panchang Data
    async function fetchData() {
       console.log("Fetching Panchang from:", API_URL); // Debug Log
       if (!selectedDate) return; // Prevent fetching with empty date
       setLoading(true);
       try {
           const res = await fetch(`${API_URL}/panchang/analyze`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                   date: selectedDate, // Use selected date
                   lat: location.lat, 
                   lon: location.lon,
                   timezone: location.timezone
               })
           });
           
           if (!res.ok) throw new Error("Failed to fetch Panchang data");
           const json = await res.json();
           setData(json);
       } catch (err: any) {
           setError(err.message);
       } finally {
           setLoading(false);
       }
    }
    
    fetchData();
  }, [location, selectedDate]);

  if (loading) {
      return (
          <div className="min-h-screen bg-[#050505] flex items-center justify-center text-yellow-500">
              <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-yellow-500 animate-spin" />
                  <p className="font-medium tracking-widest uppercase text-sm">Aligning Stars...</p>
              </div>
          </div>
      );
  }

  if (error || !data) {
      return (
          <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500 p-8 text-center">
              <div>
                  <h1 className="text-2xl font-bold mb-2">Cosmic Alignment Failed</h1>
                  <p>{error}</p>
                  <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-900/30 border border-red-500 rounded-full hover:bg-red-900/50">Retry</button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 selection:bg-yellow-500/30 overflow-x-hidden flex flex-col">
        {/* Navigation / Header - Relative to avoid overlap */}
        <div className="w-full p-4 flex justify-between items-center z-50 bg-[#050505]/80 backdrop-blur-sm sticky top-0 border-b border-white/5">
            <button className="text-white/70 hover:text-white transition-colors flex items-center gap-2" onClick={() => window.history.back()}>
               <span>←</span> <span className="text-sm font-medium uppercase tracking-wider">Back</span>
            </button>
            
            {/* Clickable Location/Date Pill */}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 hover:bg-white/10 transition-all active:scale-95 group"
            >
                <div className="flex items-center gap-1.5 text-xs font-medium text-white/80 group-hover:text-yellow-400">
                    <MapPin size={12} className="text-yellow-500" />
                    <span className="max-w-[100px] truncate">{location.city || "Location"}</span>
                </div>
                <div className="w-px h-3 bg-white/20" />
                <div className="flex items-center gap-1.5 text-xs font-mono text-white/60">
                    <Calendar size={12} />
                    <span>{new Date(selectedDate || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
            </button>
        </div>

        {/* 1. Sun Arc Hero */}
        <SunArcHero 
           heroData={data.hero_sun_arc} 
           coreData={data.core_data}
           currentChaughadiya={data.widgets.chaughadiya_roadmap.current}
           currentHora={data.widgets.hora_roadmap?.find(slot => {
               const nowTime = data.meta.current_time;
               if (slot.start_time > slot.end_time) {
                   return nowTime >= slot.start_time || nowTime < slot.end_time;
               }
               return nowTime >= slot.start_time && nowTime < slot.end_time;
           })}
           displayDate={data.meta.display_date}
           onChaughadiyaClick={(name) => openBenefit("Chaughadiya", name)}
           onHoraClick={(name) => openBenefit("Hora", name)}
        />

        {/* 2. Main Grid */}
        <div className="relative z-20 space-y-2">
            <PanchangGrid 
                coreData={data.core_data} 
                widgets={data.widgets} 
            />

            {/* 3. Chaughadiya Road */}
            <ChaughadiyaRoad 
                data={data.widgets.chaughadiya_roadmap}
                horaData={data.widgets.hora_roadmap}
                onItemClick={(type, name) => openBenefit(type, name)}
            />
            
            {/* 4. Hora Road - New Bar */}
            <HoraRoad 
                data={data.widgets.hora_roadmap}
                currentTime={data.meta.current_time}
                onItemClick={(planet) => openBenefit("Hora", planet)}
            />
            
            {/* 5. Rahu Kaal */}
            <RahuKaalWidget 
                data={data.widgets.rahu_kaal}
            />
            
            {/* 6. Hora Widget */}
            <HoraWidget 
                data={data.widgets.hora_roadmap}
                currentTime={data.meta.current_time}
                onHoraClick={(planet) => openBenefit("Hora", planet)}
            />
            
            {/* 7. Chaughadiya Widget */}
            <ChaughadiyaWidget 
                data={data.widgets.chaughadiya_roadmap}
                currentTime={data.meta.current_time}
                onChaughadiyaClick={(name) => openBenefit("Chaughadiya", name)}
            />
            
            {/* 8. Monthly Hazards */}
            <MonthlyHazardsComponent 
                data={data.widgets.monthly_hazards}
                currentDate={selectedDate}
            />
        </div>
        
        {/* Footer Polish */}
        <div className="text-center text-white/10 text-[10px] pb-8 uppercase tracking-widest">
            Detailed Calculations by Swiss Ephemeris
        </div>

        {/* Control Modal */}
        <LocationSearchModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            currentDate={selectedDate}
            currentCity={location.city}
            onUpdate={(lat, lon, timezone, city) => setLocation({ lat, lon, timezone, city })}
            onDateUpdate={(date) => {
                 setSelectedDate(date);
                 setIsModalOpen(false); // Close on date update or keep open? User preference. Closing is safer.
            }}
        />

        {/* Benefit Details Modal */}
        <BenefitDetailsModal 
            isOpen={benefitModal.isOpen}
            onClose={() => setBenefitModal(prev => ({ ...prev, isOpen: false }))}
            type={benefitModal.type}
            name={benefitModal.name}
            data={benefitModal.data}
        />
    </div>
  );
}
