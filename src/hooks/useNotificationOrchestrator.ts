import { useEffect, useState } from 'react';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

// Configuration for Custom Channels (Android requirement)
const VOICE_CHANNEL_ID = 'astro_voice_alerts';

// Helper to play sound on Web/Desktop


// Helper to play sound on Web/Desktop
const playWebSound = (filename: string) => {
    if (Capacitor.getPlatform() === 'web') {
        // Sounds are in public/sounds, so we reference them relative to root
        // Note: 'voice_success.wav' -> '/sounds/voice_success.wav'
        try {
            const audio = new Audio(`/sounds/${filename}`);
            audio.play().catch(e => console.warn("Web Audio Blocked:", e));
        } catch (e) {
            console.error("Audio Error:", e);
        }
    }
};

// Helper to map names to assets (User can customize this)
const getNotificationAssets = (name: string, type: string) => { 
    const isDesktop = Capacitor.getPlatform() === 'web';
    const prefix = isDesktop ? '/icons/desktop_banner_' : '/icons/banner_';

    // Default
    let assets = {
        icon: '/icons/icon-192x192.png',
        banner: undefined as string | undefined, 
        sound: 'voice_success.wav'
    };

    const lowerName = name.toLowerCase();

    // --- 1. SPECIAL EVENTS ---
    if (type === 'rahu') {
        assets.banner = prefix + 'rahu.png';
        assets.sound = 'rahu_kaal.mp3'; // FIXED: use rahu_kaal.mp3
    } else if (type === 'abhijeet') {
        assets.banner = prefix + 'abhijeet.png';
        assets.sound = 'abhijeet_muhurt.mp3';
    } else if (type === 'tithi') {
        assets.banner = prefix + 'tithi.png';
        // Specific Tithi Sounds
        if (lowerName.includes('purnima')) assets.sound = 'purnima.mp3';
        else if (lowerName.includes('amavasya')) assets.sound = 'amavasya.mp3';
        else if (lowerName.includes('ekadashi')) assets.sound = 'ekadashi.mp3';
        else assets.sound = 'voice_success.wav'; // Default Tithi
    } 
    else if (type === 'bhadra') {
        assets.banner = prefix + 'red.png';
        assets.sound = 'bhadra_time.mp3';
    }
    else if (type === 'panchak') {
        assets.banner = prefix + 'red.png';
        assets.sound = 'panchak_time.mp3';
    }

    // --- 2. CHAUGHADIYA LOGIC ---
    else {
        // Good Types
        if (type === 'good' || ['shubh', 'labh', 'amrit', 'char'].some(k => lowerName.includes(k))) {
            assets.banner = prefix + 'green.png';
            assets.sound = 'laabh_bela.mp3'; // "Laabh Bela"
        } 
        // Bad Types
        else if (type === 'bad' || ['rog', 'kaal', 'udveg'].some(k => lowerName.includes(k))) {
            assets.banner = prefix + 'red.png';
            assets.sound = 'rog_bela.mp3'; // "Rog Bela"
        } else {
            // Fallback
            assets.banner = prefix + 'green.png';
            assets.sound = 'laabh_bela.mp3';
        }
    }
    
    return assets;
};

export const useNotificationOrchestrator = (
  panchangData: any,   // The JSON data from your engine
  selectedDate: string // "2025-12-13" (The date user is viewing)
) => {
  const [permissions, setPermissions] = useState('prompt');
  const [voiceEnabled, setVoiceEnabled] = useState(true); // User toggle state

  // 1. Initial Setup: Create Channel & Load Preferences
  useEffect(() => {
    const init = async () => {
      try {
        // Create Android Channel for Custom Sound (Android Only)
        if (Capacitor.getPlatform() === 'android') {
            await LocalNotifications.createChannel({
                id: VOICE_CHANNEL_ID,
                name: 'Astro Voice Alerts',
                description: 'Voice notifications for Hora and Chaughadiya',
                importance: 5, // Max importance
                sound: 'voice_success.wav', // Default fallback
                visibility: 1,
                vibration: true,
            });
        }

        // Load User Voice Preference
        const { value } = await Preferences.get({ key: 'voice_enabled' });
        if (value !== null) setVoiceEnabled(JSON.parse(value));
        
        checkPermissions();
      } catch (e) {
        console.error("Error initializing notifications", e);
      }
    };
    init();
  }, []);

  // 2. Permission Checker
  const checkPermissions = async () => {
    try {
        const perm = await LocalNotifications.checkPermissions();
        setPermissions(perm.display);
    } catch (e) {
        console.error("Error checking permissions", e);
    }
  };

  // 3. The Scheduling Logic
  const scheduleDailyHabit = async () => {
    try {
        // SECURITY CHECK: Only schedule if viewing TODAY's date
        const todayStr = new Date().toISOString().split('T')[0];
        if (selectedDate !== todayStr) {
            console.log("Viewing future/past date. Skipping notification schedule.");
            return; 
        }

        // Request Permission if needed
        if (permissions !== 'granted') {
            try {
                const req = await LocalNotifications.requestPermissions();
                if (req.display !== 'granted') return;
                setPermissions(req.display);
            } catch (e) {
                console.warn("Permission request failed", e);
                return;
            }
        }

        // A. Clear Old Alerts (Idempotency)
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
           await LocalNotifications.cancel(pending);
        }

        // @ts-ignore
        const notifications: any[] = [];
        const now = new Date();
  
        // Helper to parse "HH:MM"
        const parseTime = (timeStr: string) => {
             const [h, m] = timeStr.split(':');
             const d = new Date();
             d.setHours(parseInt(h), parseInt(m), 0);
             return d;
        };

        // --- B. CHAUGHADIYA ---
        const chaughadiya = panchangData?.widgets?.chaughadiya_roadmap?.day || panchangData?.roadmaps?.chaughadiya;
        
        if (chaughadiya) {
            chaughadiya.forEach((slot: any, index: number) => {
                let triggerTime;
                if (slot.start) triggerTime = parseTime(slot.start);
                else if (slot.start_time) triggerTime = parseTime(slot.start_time);
                
                if (triggerTime && triggerTime > now) {
                    let type = 'neutral';
                    if (slot.meta?.color === 'green' || slot.type === 'Good') type = 'good';
                    else if (slot.meta?.color === 'red' || slot.type === 'Bad') type = 'bad';

                    const assets = getNotificationAssets(slot.name, type);
                    let finalSound = voiceEnabled ? assets.sound : 'default_beep';

                    notifications.push({
                        id: 100 + index,
                        title: `${slot.name} (${type === 'good' ? 'Positive' : 'Caution'})`,
                        body: slot.meta?.advice || slot.meaning || "Astro Event Started",
                        schedule: { at: triggerTime },
                        channelId: VOICE_CHANNEL_ID,
                        sound: finalSound, 
                        smallIcon: Capacitor.getPlatform() === 'web' ? assets.icon : 'ic_stat_sun',
                        largeIcon: assets.banner,
                        attachments: Capacitor.getPlatform() === 'web' && assets.banner ? [{ id: 'image', url: assets.banner }] : undefined,
                        actionTypeId: 'OPEN_PANCHANG',
                        extra: { type: 'chaughadiya', data: slot, banner: assets.banner }
                    });
                }
            });
        }

        // --- C. RAHU KAAL ---
        const rahu = panchangData?.widgets?.rahu_kaal || panchangData?.rahu_kaal;
        if (rahu && rahu.start) {
             const startT = parseTime(rahu.start);
             const endT = parseTime(rahu.end);
             
             if (startT > now) {
                 const assets = getNotificationAssets('Rahu Kaal', 'rahu');
                 notifications.push({
                     id: 301,
                     title: "⚠️ Rahu Kaal Begins",
                     body: "Inauspicious period. Avoid starting new tasks.",
                     schedule: { at: startT },
                     channelId: VOICE_CHANNEL_ID,
                     sound: 'voice_warning.wav',
                     smallIcon: Capacitor.getPlatform() === 'web' ? assets.icon : 'ic_stat_sun',
                     largeIcon: assets.banner,
                     attachments: [{ id: 'image', url: assets.banner }],
                     extra: { type: 'rahu', banner: assets.banner }
                 });
             }
             if (endT > now) {
                  notifications.push({
                     id: 302,
                     title: "✅ Rahu Kaal Ends",
                     body: "The inauspicious period has passed.",
                     schedule: { at: endT },
                     channelId: VOICE_CHANNEL_ID,
                     sound: 'voice_success.wav',
                     smallIcon: 'ic_stat_sun',
                     extra: { type: 'rahu_end' }
                 });
             }
        }

        // --- D. ABHIJEET MUHURAT ---
        const abhijit = panchangData?.widgets?.special_muhurats?.abhijit_muhurat;
        if (abhijit && abhijit.start) {
            const startT = parseTime(abhijit.start);
            if (startT > now) {
                const assets = getNotificationAssets('Abhijeet', 'abhijeet');
                notifications.push({
                     id: 401,
                     title: "✨ Abhijeet Muhurat Begins",
                     body: "Best time for success in new ventures!",
                     schedule: { at: startT },
                     channelId: VOICE_CHANNEL_ID,
                     sound: 'voice_success.wav',
                     smallIcon: Capacitor.getPlatform() === 'web' ? assets.icon : 'ic_stat_sun',
                     largeIcon: assets.banner,
                     attachments: [{ id: 'image', url: assets.banner }],
                     extra: { type: 'abhijeet', banner: assets.banner }
                 });
            }
        }

        // --- E. DAILY TITHI ---
        const tithi = panchangData?.core_data?.tithi;
        if (tithi) {
             const morning = new Date();
             morning.setHours(8, 0, 0, 0);
             if (now < morning) {
                 const assets = getNotificationAssets('Tithi', 'tithi');
                 let msg = `Today is ${tithi.name} (${tithi.paksha}).`;
                 if (tithi.name.includes('Ekadashi')) msg += " Reminder: Avoid eating Rice/Grains.";
                 
                 notifications.push({
                     id: 501,
                     title: "📅 Daily Tithi Update",
                     body: msg,
                     schedule: { at: morning },
                     channelId: VOICE_CHANNEL_ID,
                     sound: 'voice_success.wav',
                     smallIcon: Capacitor.getPlatform() === 'web' ? assets.icon : 'ic_stat_sun',
                     largeIcon: assets.banner,
                     attachments: [{ id: 'image', url: assets.banner }],
                     extra: { type: 'tithi', banner: assets.banner }
                 });
             }
        }

        // F. Commit Schedule
        if (notifications.length > 0) {
            await LocalNotifications.schedule({ notifications });
            console.log(`✅ Habit Armed: ${notifications.length} voice alerts set for today.`);
        }
    } catch (e) {
        console.error("Error scheduling notifications", e);
    }
  };

  // 4. Public Toggle Function
  const toggleVoice = async (enabled: boolean) => {
    setVoiceEnabled(enabled);
    await Preferences.set({ key: 'voice_enabled', value: JSON.stringify(enabled) });
    scheduleDailyHabit();
  };

  // Re-schedule on Data Change
  useEffect(() => {
    if (panchangData) {
      scheduleDailyHabit();
    }
  }, [panchangData, voiceEnabled]); 

  // 5. Manual Test Function (UPDATED FOR RAHU TEST)
  const testNotification = async () => {
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        perm = req;
    }
    if (perm.display !== 'granted') {
        return `❌ Permission Denied (Status: ${perm.display}).`;
    }

    const now = new Date();
    const triggerTime = new Date(now.getTime() + 5000); 
    const testId = 900000 + Math.floor(Math.random() * 10000);

    try {
        await LocalNotifications.cancel({ notifications: [{ id: 999 }] }).catch(() => {});

        // Re-ensure Channel Exists (Mobile Only)
        if (Capacitor.getPlatform() === 'android') {
             await LocalNotifications.createChannel({
                id: VOICE_CHANNEL_ID,
                name: 'Astro Voice Alerts',
                description: 'Voice notifications for Hora and Chaughadiya',
                importance: 5, 
                sound: 'voice_success.wav',
                visibility: 1,
                vibration: true,
            }).catch(e => console.error("Channel Ensure Failed", e));
        }

        // TEST ABHIJEET SOUND & BANNER
        const assets = getNotificationAssets('Abhijeet Test', 'abhijeet');
        const testSound = assets.sound; // 'abhijeet_muhurt.mp3'
        const testBanner = assets.banner; // Platform-specific banner handled in helper
 
        if (Capacitor.getPlatform() === 'web') {
            setTimeout(() => {
                new Notification("Test Abhijeet Alert " + new Date().toLocaleTimeString(), {
                    body: "✨ Abhijeet Muhurat Begins! Best time for success.",
                    icon: '/icons/icon-192x192.png',
                    image: testBanner, 
                    requireInteraction: true,
                    silent: true
                } as NotificationOptions & { image?: string });
                if (voiceEnabled) playWebSound(testSound);
            }, 5000);
            return "✅ Scheduled Abhijeet Test! (Waits 5s)";
        } else {
            const scheduleResult = await LocalNotifications.schedule({
                notifications: [{
                    id: testId,
                    title: "Test Abhijeet Alert",
                    body: "✨ Abhijeet Muhurat Begins! Best time for success.",
                    schedule: { at: triggerTime, allowWhileIdle: true },
                    channelId: VOICE_CHANNEL_ID,
                    sound: testSound,
                    smallIcon: 'ic_stat_sun', 
                    largeIcon: testBanner,
                    actionTypeId: 'OPEN_PANCHANG',
                    extra: { type: 'test_abhijeet' }
                }]
            });
            console.log("Schedule Result:", scheduleResult);
            return "✅ Scheduled Native Abhijeet Test! Watch notification tray in 5s.";
        }
    } catch (e: any) {
        console.error("Test Schedule Failed:", e);
        // Return error string to be alerted by the UI
        throw new Error(`Schedule Failed: ${e.message}`);
    }
  };

  return { permissions, requestPermissions: LocalNotifications.requestPermissions, toggleVoice, voiceEnabled, testNotification };
};
