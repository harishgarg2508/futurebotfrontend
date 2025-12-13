"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Preferences } from '@capacitor/preferences';
import { Bell, ChevronLeft, Volume2 } from 'lucide-react';
import { 
  NotificationPreferences, 
  DEFAULT_NOTIFICATION_PREFERENCES,
  AVAILABLE_SOUNDS,
  TIME_OFFSET_OPTIONS,
  NotificationSetting
} from '@/types/notifications';
import { useTranslation } from "react-i18next";

export default function NotificationSettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Location state
  const [location, setLocation] = useState({ 
    lat: 28.6139, 
    lon: 77.2090, 
    timezone: 'Asia/Kolkata', 
    city: 'New Delhi' 
  });
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Load preferences and location on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load notification preferences
        const { value } = await Preferences.get({ key: 'notification_preferences' });
        if (value) {
          const loaded = JSON.parse(value);
          setPreferences({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...loaded });
        }
        
        // Load saved location
        const { value: locValue } = await Preferences.get({ key: 'user_location' });
        if (locValue) {
          const savedLocation = JSON.parse(locValue);
          setLocation(savedLocation);
        }
      } catch (e) {
        console.error('Failed to load preferences', e);
      } finally {
        setLoading(false);
      }
    };
    loadPreferences();
  }, []);

  // Test notification function
  const testNotification = async () => {
    try {
      const { Capacitor } = await import('@capacitor/core');
      const platform = Capacitor.getPlatform();
      
      if (platform === 'web') {
        // PWA/Web Platform
        if (!('Notification' in window)) {
          alert('❌ Notifications not supported in this browser.\n\nTry Chrome, Edge, or Firefox.');
          return;
        }
        
        let perm = Notification.permission;
        console.log('Current permission:', perm);
        
        if (perm === 'default') {
          alert('📢 Requesting notification permission...\n\nClick "Allow" in the browser prompt.');
          perm = await Notification.requestPermission();
          console.log('New permission:', perm);
        }
        
        if (perm !== 'granted') {
          alert('❌ Notification permission denied.\n\n1. Click the lock icon in address bar\n2. Allow notifications\n3. Refresh page and try again');
          return;
        }
        
        // Show immediate notification (PWA can't schedule background notifications)
        alert('✅ Showing notification NOW!\n\n⚠️ PWA Limitation: Background scheduled notifications require native mobile app.\n\nFor full notification scheduling, install as APK from:\nnpm run build:mobile');
        
        new Notification('🌟 Test Notification - PWA', {
          body: 'Instant notification works! For scheduled notifications, install native app.',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          requireInteraction: true
        });
      } else {
        // Native Mobile App
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const perm = await LocalNotifications.checkPermissions();
        
        if (perm.display !== 'granted') {
          const req = await LocalNotifications.requestPermissions();
          if (req.display !== 'granted') {
            alert('❌ Permission not granted.\n\nGo to device Settings → Apps → FutureBot → Notifications → Enable');
            return;
          }
        }
        
        const testTime = new Date(Date.now() + 15000);
        await LocalNotifications.schedule({
          notifications: [{
            id: 999998,
            title: '🌟 Test Notification',
            body: 'Your notifications are working perfectly!',
            schedule: { at: testTime, allowWhileIdle: true },
            sound: preferences.rahuKaalStart.sound,
            smallIcon: 'ic_launcher',
            channelId: 'astro_voice_alerts'
          }]
        });
        alert('✅ Native app test scheduled in 15 seconds!\n\nKeep app in background and wait.');
      }
    } catch (e: any) {
      alert('❌ Test failed: ' + e.message + '\n\nCheck console for details.');
      console.error('Test notification error:', e);
    }
  };

  // Detect current GPS location
  const detectLocation = async () => {
    setDetectingLocation(true);
    try {
      if (!navigator.geolocation) {
        alert('❌ Geolocation not supported by your browser');
        setDetectingLocation(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            city: 'Current Location'
          };
          
          // Try to get city name from reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${newLocation.lat}&lon=${newLocation.lon}&format=json`
            );
            const data = await response.json();
            newLocation.city = data.address?.city || data.address?.town || data.address?.village || 'Current Location';
          } catch (e) {
            console.warn('Failed to get city name:', e);
          }
          
          setLocation(newLocation);
          setDetectingLocation(false);
          alert(`✅ Location detected: ${newLocation.city}`);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('❌ Failed to detect location. Please enable location permissions.');
          setDetectingLocation(false);
        }
      );
    } catch (e) {
      console.error('Error detecting location:', e);
      setDetectingLocation(false);
    }
  };

  // Save preferences
  const savePreferences = async () => {
    setSaving(true);
    try {
      // Save notification preferences
      await Preferences.set({ 
        key: 'notification_preferences', 
        value: JSON.stringify(preferences) 
      });
      
      // Save location
      await Preferences.set({ 
        key: 'user_location', 
        value: JSON.stringify(location) 
      });
      
      // Initialize auto-scheduler - this will schedule midnight refresh
      // So notifications continue daily WITHOUT opening the app
      const { initializeNotificationScheduler } = await import('@/services/notificationScheduler');
      await initializeNotificationScheduler();
      
      // Show success feedback
      setTimeout(() => setSaving(false), 500);
    } catch (e) {
      console.error('Failed to save preferences', e);
      setSaving(false);
    }
  };

  // Update a specific setting
  const updateSetting = (key: keyof NotificationPreferences, field: keyof NotificationSetting, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  // Section Component
  const SettingSection = ({ 
    title, 
    icon, 
    children 
  }: { 
    title: string; 
    icon: string; 
    children: React.ReactNode;
  }) => (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2 mb-4 px-4">
        <span>{icon}</span>
        {title}
      </h2>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  // Individual Setting Row
  const SettingRow = ({ 
    label, 
    description,
    settingKey 
  }: { 
    label: string; 
    description: string;
    settingKey: keyof NotificationPreferences;
  }) => {
    const setting = preferences[settingKey];
    
    return (
      <div className="glass-card p-4 mx-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">{label}</h3>
            <p className="text-white/50 text-xs mt-1">{description}</p>
          </div>
          <label className="switch ml-4">
            <input 
              type="checkbox" 
              checked={setting.enabled} 
              onChange={(e) => updateSetting(settingKey, 'enabled', e.target.checked)} 
            />
            <span className="slider round"></span>
          </label>
        </div>
        
        {setting.enabled && (
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10">
            {/* Time Offset */}
            <div>
              <label className="text-xs text-white/60 block mb-1.5">Notify</label>
              <select 
                value={setting.timeOffsetMinutes}
                onChange={(e) => updateSetting(settingKey, 'timeOffsetMinutes', parseInt(e.target.value))}
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 focus:outline-none appearance-none cursor-pointer hover:bg-[#252525] transition-colors"
                style={{ 
                  colorScheme: 'dark',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '16px',
                  paddingRight: '32px'
                }}
              >
                {TIME_OFFSET_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-[#1a1a1a] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sound Picker */}
            <div>
              <label className="text-xs text-white/60 block mb-1.5">Sound</label>
              <select 
                value={setting.sound}
                onChange={(e) => updateSetting(settingKey, 'sound', e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 focus:outline-none appearance-none cursor-pointer hover:bg-[#252525] transition-colors"
                style={{ 
                  colorScheme: 'dark',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '16px',
                  paddingRight: '32px'
                }}
              >
                {AVAILABLE_SOUNDS.map(sound => (
                  <option key={sound} value={sound} className="bg-[#1a1a1a] text-white">
                    {sound.replace(/\.(mp3|wav)$/, '').replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-yellow-500 text-sm">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Back</span>
          </button>
          
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Bell size={20} className="text-yellow-500" />
            Notification Settings
          </h1>
          
          <button 
            onClick={savePreferences}
            disabled={saving}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              saving 
                ? 'bg-green-500/50 text-white cursor-not-allowed' 
                : 'bg-yellow-500 text-black hover:bg-yellow-400 active:scale-95'
            }`}
          >
            {saving ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="pt-6 pb-10">
        {/* Location Section */}
        <div className="mb-6 mx-4">
          <div className="glass-card p-4">
            <h2 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
              📍 Notification Location
            </h2>
            <p className="text-xs text-white/50 mb-3">
              Notifications are scheduled based on this location's Panchang timings
            </p>
            
            {/* Current Location Display */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-3">
              <div className="text-sm font-semibold text-white">{location.city}</div>
              <div className="text-xs text-white/50 mt-1">
                {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
              </div>
              <div className="text-xs text-white/40 mt-1">{location.timezone}</div>
            </div>
            
            {/* Location Actions */}
            <button
              onClick={detectLocation}
              disabled={detectingLocation}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-lg hover:from-blue-400 hover:to-cyan-400 active:scale-95 transition-all shadow-lg disabled:opacity-50"
            >
              {detectingLocation ? '🔍 Detecting...' : '📍 Use Current GPS Location'}
            </button>
            
            <div className="mt-2 text-xs text-center text-white/40">
              Or change location in Panchang page
            </div>
          </div>
        </div>

        {/*       <option key={sound} value={sound} className="bg-[#1a1a1a] text-white">
                    {sound.replace(/\.(mp3|wav)$/, '').replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-yellow-500 text-sm">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Back</span>
          </button>
          
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Bell size={20} className="text-yellow-500" />
            Notification Settings
          </h1>
          
          <button 
            onClick={savePreferences}
            disabled={saving}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              saving 
                ? 'bg-green-500/50 text-white cursor-not-allowed' 
                : 'bg-yellow-500 text-black hover:bg-yellow-400 active:scale-95'
            }`}
          >
            {saving ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="pt-6 pb-10">
        {/* Test Notification */}
        <div className="mb-6 mx-4">
          <div className="glass-card p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-purple-300 mb-1">🧪 Test Notifications</h2>
                <p className="text-xs text-white/50">Verify notifications work (15 sec delay)</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={testNotification}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:from-purple-400 hover:to-pink-400 active:scale-95 transition-all shadow-lg"
              >
                🔔 Test Alert
              </button>
              <button
                onClick={async () => {
                  try {
                    const { Capacitor } = await import('@capacitor/core');
                    const platform = Capacitor.getPlatform();
                    
                    if (platform === 'web') {
                      const perm = Notification.permission;
                      alert(`📱 You're using PWA (Web App)\n\n` +
                        `Permission: ${perm}\n\n` +
                        `⚠️ PWA LIMITATION:\n` +
                        `- Can't schedule background notifications\n` +
                        `- Can only show instant notifications\n` +
                        `- Can't check scheduled queue\n\n` +
                        `✅ SOLUTION:\n` +
                        `Install native Android/iOS app:\n` +
                        `npm run build:mobile → APK/IPA`);
                      return;
                    }
                    
                    const { LocalNotifications } = await import('@capacitor/local-notifications');
                    const pending = await LocalNotifications.getPending();
                    
                    if (pending.notifications.length === 0) {
                      alert('📭 No notifications scheduled.\n\n' +
                        'Steps to schedule:\n' +
                        '1. Save your preferences here\n' +
                        '2. Open Panchang page once\n' +
                        '3. Notifications auto-schedule daily');
                    } else {
                      const list = pending.notifications
                        .slice(0, 10) // Show first 10
                        .map((n, i) => `${i + 1}. ${n.title}\n   ID: ${n.id}`)
                        .join('\n\n');
                      alert(`📬 ${pending.notifications.length} notifications scheduled:\n\n${list}`);
                    }
                  } catch (e: any) {
                    alert('❌ Error: ' + e.message);
                    console.error('Queue check error:', e);
                  }
                }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-lg hover:from-blue-400 hover:to-cyan-400 active:scale-95 transition-all shadow-lg"
              >
                📋 Check Queue
              </button>
            </div>
          </div>
        </div>
        {/* Rahu Kaal Section */}
        <SettingSection title="Rahu Kaal" icon="⚠️">
          <SettingRow 
            label="Rahu Kaal Starts"
            description="Alert when inauspicious Rahu period begins"
            settingKey="rahuKaalStart"
          />
          <SettingRow 
            label="Rahu Kaal Ends"
            description="Alert when Rahu period ends"
            settingKey="rahuKaalEnd"
          />
        </SettingSection>

        {/* Auspicious Times */}
        <SettingSection title="Auspicious Times" icon="✨">
          <SettingRow 
            label="Abhijeet Muhurat"
            description="Best time for success in new ventures"
            settingKey="abhijeetMuhurat"
          />
        </SettingSection>

        {/* Chaughadiya */}
        <SettingSection title="Chaughadiya Periods" icon="⏰">
          <SettingRow 
            label="Good Chaughadiya"
            description="Alert for Shubh, Labh, Amrit, Char periods"
            settingKey="chaughadiyaGood"
          />
          <SettingRow 
            label="Bad Chaughadiya"
            description="Alert for Rog, Kaal, Udveg periods"
            settingKey="chaughadiyaBad"
          />
        </SettingSection>

        {/* Daily Updates */}
        <SettingSection title="Daily Updates" icon="📅">
          <SettingRow 
            label="Daily Tithi"
            description="Morning notification about today's Tithi"
            settingKey="dailyTithi"
          />
          <SettingRow 
            label="Daily Nakshatra"
            description="Morning notification about today's Nakshatra"
            settingKey="dailyNakshatra"
          />
          <SettingRow 
            label="Daily Yoga"
            description="Morning notification about today's Yoga"
            settingKey="dailyYoga"
          />
        </SettingSection>

        {/* Special Tithis */}
        <SettingSection title="Special Tithis" icon="🌙">
          <SettingRow 
            label="Ekadashi"
            description="Alert on Ekadashi days (fasting reminder)"
            settingKey="ekadashi"
          />
          <SettingRow 
            label="Purnima (Full Moon)"
            description="Alert on Purnima days"
            settingKey="purnima"
          />
          <SettingRow 
            label="Amavasya (New Moon)"
            description="Alert on Amavasya days"
            settingKey="amavasya"
          />
        </SettingSection>

        {/* Planetary Hours */}
        <SettingSection title="Hora (Planetary Hours)" icon="🪐">
          <SettingRow 
            label="Hora Changes"
            description="Alert when planetary hour changes"
            settingKey="horaChanges"
          />
        </SettingSection>

        {/* Monthly Hazards */}
        <SettingSection title="Monthly Hazards" icon="⚡">
          <SettingRow 
            label="Bhadra Period"
            description="Warning for Bhadra inauspicious times"
            settingKey="bhadraWarning"
          />
          <SettingRow 
            label="Panchak Period"
            description="Warning for Panchak 5-day hazard period"
            settingKey="panchakWarning"
          />
        </SettingSection>

        {/* Disha Shool */}
        <SettingSection title="Direction" icon="🧭">
          <SettingRow 
            label="Disha Shool"
            description="Daily direction to avoid (morning alert)"
            settingKey="dishaShool"
          />
        </SettingSection>
      </div>

      {/* Info Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-white/10 p-4">
        <p className="text-xs text-white/40 text-center">
          💡 Notifications are based on your current location and today's date only
        </p>
      </div>

      {/* CSS for Switch */}
      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: 0.3s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
        }
        input:checked + .slider {
          background-color: #EAB308;
          border-color: #EAB308;
        }
        input:checked + .slider:before {
          transform: translateX(20px);
          background-color: black;
        }
        .slider.round {
          border-radius: 24px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }
      `}</style>
      </div>
    </div>
  );
}
