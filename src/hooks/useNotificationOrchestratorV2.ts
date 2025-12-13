import { useEffect, useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { NotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/notifications';

const VOICE_CHANNEL_ID = 'astro_voice_alerts';

// Helper to play sound on Web
const playWebSound = (filename: string) => {
    if (Capacitor.getPlatform() === 'web') {
        try {
            const audio = new Audio(`/sounds/${filename}`);
            audio.play().catch(e => console.warn("Web Audio Blocked:", e));
        } catch (e) {
            console.error("Audio Error:", e);
        }
    }
};

// Helper to get banner image based on type
const getBannerImage = (type: string) => {
    const isNative = Capacitor.getPlatform() !== 'web';
    const isMobileWeb = typeof window !== 'undefined' && window.innerWidth < 768;
    const useMobileAssets = isNative || isMobileWeb;
    const prefix = useMobileAssets ? '/icons/banner_' : '/icons/desktop_banner_';
    
    const bannerMap: Record<string, string> = {
        'rahu': 'rahu.png',
        'abhijeet': 'abhijeet.png',
        'tithi': 'tithi.png',
        'good': 'green.png',
        'bad': 'red.png',
        'bhadra': 'red.png',
        'panchak': 'red.png',
        'default': 'green.png'
    };
    
    return prefix + (bannerMap[type] || bannerMap['default']);
};

export const useNotificationOrchestrator = (
  panchangData?: any,
  selectedDate?: string
) => {
  const [permissions, setPermissions] = useState('prompt');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);

  // Load notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { value } = await Preferences.get({ key: 'notification_preferences' });
        if (value) {
          const loaded = JSON.parse(value);
          setPreferences({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...loaded });
        }
      } catch (e) {
        console.error('Failed to load notification preferences', e);
      }
    };
    loadPreferences();
  }, []);

  // Permission Checker
  const checkPermissions = async () => {
    try {
        if (Capacitor.getPlatform() === 'web') {
             if ('Notification' in window) {
                 const status = Notification.permission;
                 setPermissions(status === 'granted' ? 'granted' : 'prompt');
                 if (status === 'default') {
                     setShowPermissionBanner(true);
                 }
             }
        } else {
            const perm = await LocalNotifications.checkPermissions();
            setPermissions(perm.display);
        }
    } catch (e) {
        console.error("Error checking permissions", e);
    }
  };

  // Initial Setup
  useEffect(() => {
    const init = async () => {
      try {
        if (Capacitor.getPlatform() === 'android') {
            await LocalNotifications.createChannel({
                id: VOICE_CHANNEL_ID,
                name: 'Astro Voice Alerts',
                description: 'Voice notifications for Hora and Chaughadiya',
                importance: 5,
                sound: 'voice_success.wav',
                visibility: 1,
                vibration: true,
            });
        }

        const { value } = await Preferences.get({ key: 'voice_enabled' });
        if (value !== null) setVoiceEnabled(JSON.parse(value));
        
        if (Capacitor.getPlatform() !== 'web') {
             let perm = await LocalNotifications.checkPermissions();
             if (perm.display === 'prompt') {
                 perm = await LocalNotifications.requestPermissions();
             }
             setPermissions(perm.display);
             
             LocalNotifications.addListener('localNotificationReceived', (notification) => {
                console.log('Notification Received:', notification);
             });
        } else {
             checkPermissions();
        }
      } catch (e) {
        console.error("Error initializing notifications", e);
      }
    };
    init();
  }, []);

  // Main Scheduling Logic
  const scheduleDailyHabit = async () => {
    try {
        // Only schedule for today's date
        const todayStr = new Date().toISOString().split('T')[0];
        if (selectedDate !== todayStr) {
            console.log("Viewing future/past date. Skipping notification schedule.");
            return; 
        }

        // Request Permission if needed
        if (permissions !== 'granted') {
            try {
                if (Capacitor.getPlatform() !== 'web') {
                    const req = await LocalNotifications.requestPermissions();
                    if (req.display !== 'granted') return;
                    setPermissions(req.display);
                }
            } catch (e) {
                console.warn("Permission request failed", e);
                return;
            }
        }

        // Clear old notifications
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
           await LocalNotifications.cancel(pending);
        }

        const notifications: any[] = [];
        const now = new Date();
  
        // Helper to parse time and apply offset
        const parseTimeWithOffset = (timeStr: string, offsetMinutes: number) => {
             const [h, m] = timeStr.split(':');
             const d = new Date();
             d.setHours(parseInt(h), parseInt(m), 0);
             d.setMinutes(d.getMinutes() - offsetMinutes);
             return d;
        };

        let notificationId = 100;

        // --- RAHU KAAL ---
        const rahu = panchangData?.widgets?.rahu_kaal || panchangData?.rahu_kaal;
        if (rahu && rahu.start) {
             // Start notification
             if (preferences.rahuKaalStart.enabled) {
                 const startT = parseTimeWithOffset(rahu.start, preferences.rahuKaalStart.timeOffsetMinutes);
                 if (startT > now) {
                     notifications.push({
                         id: notificationId++,
                         title: "⚠️ Rahu Kaal Begins",
                         body: preferences.rahuKaalStart.timeOffsetMinutes > 0 
                             ? `Starting in ${preferences.rahuKaalStart.timeOffsetMinutes} minutes. Avoid new tasks.`
                             : "Inauspicious period. Avoid starting new tasks.",
                         schedule: { at: startT },
                         channelId: VOICE_CHANNEL_ID,
                         sound: voiceEnabled ? preferences.rahuKaalStart.sound : 'default_beep',
                         smallIcon: Capacitor.getPlatform() === 'web' ? '/icons/icon-192x192.png' : 'ic_launcher',
                         largeIcon: getBannerImage('rahu'),
                         attachments: [{ id: 'image', url: getBannerImage('rahu') }],
                         extra: { type: 'rahu_start' }
                     });
                 }
             }
             
             // End notification
             if (preferences.rahuKaalEnd.enabled) {
                 const endT = parseTimeWithOffset(rahu.end, preferences.rahuKaalEnd.timeOffsetMinutes);
                 if (endT > now) {
                     notifications.push({
                         id: notificationId++,
                         title: "✅ Rahu Kaal Ends",
                         body: "The inauspicious period has passed.",
                         schedule: { at: endT },
                         channelId: VOICE_CHANNEL_ID,
                         sound: voiceEnabled ? preferences.rahuKaalEnd.sound : 'default_beep',
                         smallIcon: 'ic_launcher',
                         extra: { type: 'rahu_end' }
                     });
                 }
             }
        }

        // --- ABHIJEET MUHURAT ---
        const abhijit = panchangData?.widgets?.special_muhurats?.abhijit_muhurat;
        if (abhijit && abhijit.start && preferences.abhijeetMuhurat.enabled) {
            const startT = parseTimeWithOffset(abhijit.start, preferences.abhijeetMuhurat.timeOffsetMinutes);
            if (startT > now) {
                notifications.push({
                     id: notificationId++,
                     title: "✨ Abhijeet Muhurat",
                     body: preferences.abhijeetMuhurat.timeOffsetMinutes > 0
                         ? `Starting in ${preferences.abhijeetMuhurat.timeOffsetMinutes} minutes! Best time for success.`
                         : "Best time for success in new ventures!",
                     schedule: { at: startT },
                     channelId: VOICE_CHANNEL_ID,
                     sound: voiceEnabled ? preferences.abhijeetMuhurat.sound : 'default_beep',
                     smallIcon: Capacitor.getPlatform() === 'web' ? '/icons/icon-192x192.png' : 'ic_launcher',
                     largeIcon: getBannerImage('abhijeet'),
                     attachments: [{ id: 'image', url: getBannerImage('abhijeet') }],
                     extra: { type: 'abhijeet' }
                 });
            }
        }

        // --- CHAUGHADIYA ---
        const chaughadiya = panchangData?.widgets?.chaughadiya_roadmap?.day || panchangData?.roadmaps?.chaughadiya;
        if (chaughadiya) {
            chaughadiya.forEach((slot: any) => {
                let triggerTime;
                if (slot.start) triggerTime = slot.start;
                else if (slot.start_time) triggerTime = slot.start_time;
                else return;
                
                const isGood = slot.meta?.color === 'green' || slot.type === 'Good';
                const isBad = slot.meta?.color === 'red' || slot.type === 'Bad';
                
                if (isGood && preferences.chaughadiyaGood.enabled) {
                    const scheduleTime = parseTimeWithOffset(triggerTime, preferences.chaughadiyaGood.timeOffsetMinutes);
                    if (scheduleTime > now) {
                        notifications.push({
                            id: notificationId++,
                            title: `${slot.name} (Good Period)`,
                            body: preferences.chaughadiyaGood.timeOffsetMinutes > 0
                                ? `Starting in ${preferences.chaughadiyaGood.timeOffsetMinutes} minutes`
                                : slot.meta?.advice || slot.meaning || "Auspicious time for activities",
                            schedule: { at: scheduleTime },
                            channelId: VOICE_CHANNEL_ID,
                            sound: voiceEnabled ? preferences.chaughadiyaGood.sound : 'default_beep',
                            smallIcon: Capacitor.getPlatform() === 'web' ? '/icons/icon-192x192.png' : 'ic_launcher',
                            largeIcon: getBannerImage('good'),
                            extra: { type: 'chaughadiya_good', data: slot }
                        });
                    }
                } else if (isBad && preferences.chaughadiyaBad.enabled) {
                    const scheduleTime = parseTimeWithOffset(triggerTime, preferences.chaughadiyaBad.timeOffsetMinutes);
                    if (scheduleTime > now) {
                        notifications.push({
                            id: notificationId++,
                            title: `${slot.name} (Caution)`,
                            body: preferences.chaughadiyaBad.timeOffsetMinutes > 0
                                ? `Starting in ${preferences.chaughadiyaBad.timeOffsetMinutes} minutes`
                                : slot.meta?.advice || slot.meaning || "Inauspicious period approaching",
                            schedule: { at: scheduleTime },
                            channelId: VOICE_CHANNEL_ID,
                            sound: voiceEnabled ? preferences.chaughadiyaBad.sound : 'default_beep',
                            smallIcon: Capacitor.getPlatform() === 'web' ? '/icons/icon-192x192.png' : 'ic_launcher',
                            largeIcon: getBannerImage('bad'),
                            extra: { type: 'chaughadiya_bad', data: slot }
                        });
                    }
                }
            });
        }

        // --- HORA CHANGES ---
        const horaData = panchangData?.widgets?.hora_roadmap;
        if (horaData && preferences.horaChanges.enabled) {
            horaData.forEach((slot: any) => {
                const startTime = slot.start_time || slot.start;
                if (startTime) {
                    const scheduleTime = parseTimeWithOffset(startTime, preferences.horaChanges.timeOffsetMinutes);
                    if (scheduleTime > now) {
                        notifications.push({
                            id: notificationId++,
                            title: `${slot.planet} Hora`,
                            body: preferences.horaChanges.timeOffsetMinutes > 0
                                ? `Starting in ${preferences.horaChanges.timeOffsetMinutes} minutes`
                                : `${slot.planet} hora has begun`,
                            schedule: { at: scheduleTime },
                            channelId: VOICE_CHANNEL_ID,
                            sound: voiceEnabled ? preferences.horaChanges.sound : 'default_beep',
                            smallIcon: Capacitor.getPlatform() === 'web' ? '/icons/icon-192x192.png' : 'ic_launcher',
                            extra: { type: 'hora', planet: slot.planet }
                        });
                    }
                }
            });
        }

        // --- DAILY UPDATES (8 AM) ---
        const morning = new Date();
        morning.setHours(8, 0, 0, 0);
        
        if (now < morning) {
            // Daily Tithi
            const tithi = panchangData?.core_data?.tithi;
            if (tithi && preferences.dailyTithi.enabled) {
                const scheduleTime = new Date(morning.getTime() - preferences.dailyTithi.timeOffsetMinutes * 60000);
                let msg = `Today is ${tithi.name} (${tithi.paksha})`;
                
                // Check for special tithis
                const isEkadashi = tithi.name.toLowerCase().includes('ekadashi');
                const isPurnima = tithi.name.toLowerCase().includes('purnima');
                const isAmavasya = tithi.name.toLowerCase().includes('amavasya');
                
                if (isEkadashi && preferences.ekadashi.enabled) {
                    msg += ". Reminder: Avoid eating Rice/Grains.";
                }
                
                notifications.push({
                    id: notificationId++,
                    title: "📅 Daily Tithi",
                    body: msg,
                    schedule: { at: scheduleTime },
                    channelId: VOICE_CHANNEL_ID,
                    sound: voiceEnabled ? (
                        isEkadashi ? preferences.ekadashi.sound :
                        isPurnima ? preferences.purnima.sound :
                        isAmavasya ? preferences.amavasya.sound :
                        preferences.dailyTithi.sound
                    ) : 'default_beep',
                    smallIcon: Capacitor.getPlatform() === 'web' ? '/icons/icon-192x192.png' : 'ic_launcher',
                    largeIcon: getBannerImage('tithi'),
                    extra: { type: 'daily_tithi' }
                });
            }
            
            // Daily Nakshatra
            const nakshatra = panchangData?.core_data?.nakshatra;
            if (nakshatra && preferences.dailyNakshatra.enabled) {
                const scheduleTime = new Date(morning.getTime() - preferences.dailyNakshatra.timeOffsetMinutes * 60000);
                notifications.push({
                    id: notificationId++,
                    title: "⭐ Daily Nakshatra",
                    body: `Today's Nakshatra is ${nakshatra.name}`,
                    schedule: { at: scheduleTime },
                    channelId: VOICE_CHANNEL_ID,
                    sound: voiceEnabled ? preferences.dailyNakshatra.sound : 'default_beep',
                    smallIcon: 'ic_launcher',
                    extra: { type: 'daily_nakshatra' }
                });
            }
            
            // Daily Yoga
            const yoga = panchangData?.core_data?.yoga;
            if (yoga && preferences.dailyYoga.enabled) {
                const scheduleTime = new Date(morning.getTime() - preferences.dailyYoga.timeOffsetMinutes * 60000);
                notifications.push({
                    id: notificationId++,
                    title: "🧘 Daily Yoga",
                    body: `Today's Yoga is ${yoga.name}`,
                    schedule: { at: scheduleTime },
                    channelId: VOICE_CHANNEL_ID,
                    sound: voiceEnabled ? preferences.dailyYoga.sound : 'default_beep',
                    smallIcon: 'ic_launcher',
                    extra: { type: 'daily_yoga' }
                });
            }
            
            // Disha Shool
            const dishaShool = panchangData?.widgets?.disha_shool;
            if (dishaShool && preferences.dishaShool.enabled) {
                const scheduleTime = new Date(morning.getTime() - preferences.dishaShool.timeOffsetMinutes * 60000);
                notifications.push({
                    id: notificationId++,
                    title: "🧭 Direction Warning",
                    body: `Avoid ${dishaShool.direction} direction today. ${dishaShool.remedy}`,
                    schedule: { at: scheduleTime },
                    channelId: VOICE_CHANNEL_ID,
                    sound: voiceEnabled ? preferences.dishaShool.sound : 'default_beep',
                    smallIcon: 'ic_launcher',
                    extra: { type: 'disha_shool' }
                });
            }
        }

        // Schedule all notifications
        if (notifications.length > 0) {
            await LocalNotifications.schedule({ notifications });
            console.log(`✅ Scheduled ${notifications.length} notifications based on user preferences.`);
        } else {
            console.log('ℹ️ No notifications enabled in settings.');
        }
    } catch (e) {
        console.error("Error scheduling notifications", e);
    }
  };

  // Toggle Voice
  const toggleVoice = async (enabled: boolean) => {
    setVoiceEnabled(enabled);
    await Preferences.set({ key: 'voice_enabled', value: JSON.stringify(enabled) });
    scheduleDailyHabit();
  };

  // Re-schedule when data or preferences change
  useEffect(() => {
    if (panchangData && Object.keys(preferences).length > 0) {
      scheduleDailyHabit();
    }
  }, [panchangData, voiceEnabled, preferences]);

  // Test Notification
  const testNotification = async () => {
    if (Capacitor.getPlatform() === 'web') {
        if (!('Notification' in window)) return "❌ Browser doesn't support notifications";
        
        let p = Notification.permission;
        if (p !== 'granted') {
             try {
                p = await Notification.requestPermission();
                setPermissions(p === 'granted' ? 'granted' : 'prompt');
                if (p === 'granted') setShowPermissionBanner(false);
             } catch (err) {
                console.error("Permission error", err);
             }
        }
        
        if (p !== 'granted') {
            return "❌ Permission Blocked";
        }

        if (voiceEnabled && preferences.abhijeetMuhurat.enabled) {
            playWebSound(preferences.abhijeetMuhurat.sound);
        }

        setTimeout(async () => {
            const title = "Test Alert " + new Date().toLocaleTimeString();
            const options: any = {
                body: "✨ This is a test notification!",
                icon: '/icons/icon-192x192.png',
                image: getBannerImage('abhijeet'),
                requireInteraction: true,
            };

            if ('serviceWorker' in navigator) {
                try {
                    const reg = await navigator.serviceWorker.getRegistration();
                    if (reg) {
                        await reg.showNotification(title, options);
                        return;
                    }
                } catch (e) {
                    console.error("SW Notification Failed", e);
                }
            }

            const n = new Notification(title, options);
            n.onclick = () => { window.focus(); n.close(); };
        }, 5000);

        return "✅ Test notification scheduled (5s)";
    } else {
        let perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
            const req = await LocalNotifications.requestPermissions();
            perm = req;
        }
        if (perm.display !== 'granted') {
            return `❌ Permission Denied`;
        }

        const now = new Date();
        const triggerTime = new Date(now.getTime() + 5000);
        const testId = 900000 + Math.floor(Math.random() * 10000);

        try {
            if (Capacitor.getPlatform() === 'android') {
                 await LocalNotifications.createChannel({
                    id: VOICE_CHANNEL_ID,
                    name: 'Astro Voice Alerts',
                    description: 'Test channel',
                    importance: 5, 
                    sound: preferences.abhijeetMuhurat.sound,
                    visibility: 1,
                    vibration: true,
                });
            }

            await LocalNotifications.schedule({
                notifications: [{
                    id: testId,
                    title: "Test Notification",
                    body: "✨ Your notification settings are working!",
                    schedule: { at: triggerTime, allowWhileIdle: true },
                    channelId: VOICE_CHANNEL_ID,
                    sound: voiceEnabled ? preferences.abhijeetMuhurat.sound : 'default_beep',
                    smallIcon: 'ic_launcher',
                    largeIcon: getBannerImage('abhijeet'),
                    extra: { type: 'test' }
                }]
            });
            return "✅ Test notification scheduled (5s)";

        } catch (e: any) {
            console.error("Test Failed:", e);
            return `❌ Schedule Failed: ${e.message}`;
        }
    }
  };

  // Web Permission Request
  const requestWebPermissions = async () => {
      if ('Notification' in window) {
          try {
              const p = await Notification.requestPermission();
              setPermissions(p === 'granted' ? 'granted' : 'prompt');
              if (p === 'granted') {
                  setShowPermissionBanner(false);
                  scheduleDailyHabit();
              }
          } catch (e) {
              console.error("Permission Request Error", e);
          }
      }
  };
  
  const dismissPermissionBanner = () => {
      setShowPermissionBanner(false);
  };

  return { 
      permissions, 
      toggleVoice, 
      voiceEnabled, 
      testNotification,
      showPermissionBanner,
      requestWebPermissions,
      dismissPermissionBanner
  };
};
