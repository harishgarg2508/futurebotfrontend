/**
 * Notification Scheduler Service
 * 
 * This service handles automatic daily notification scheduling WITHOUT requiring
 * the user to open the app every day.
 * 
 * Strategy:
 * 1. Schedule a "midnight refresh" notification that triggers daily at 00:01 AM
 * 2. When this notification fires, it re-fetches panchang data and schedules all notifications
 * 3. This creates a self-sustaining cycle of daily notifications
 * 
 * For web/PWA: Uses service workers
 * For native: Uses Capacitor Local Notifications with repeating schedule
 */

import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { NotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/notifications';

const MIDNIGHT_REFRESH_ID = 999999;
const VOICE_CHANNEL_ID = 'astro_voice_alerts';

/**
 * Schedule the midnight auto-refresh notification
 * This runs daily at 00:01 AM to re-schedule all notifications for the new day
 */
export async function scheduleMidnightRefresh() {
  try {
    if (Capacitor.getPlatform() === 'web') {
      // For web, we'll use service worker periodic sync (if available)
      await registerServiceWorkerSync();
      return;
    }

    // Cancel any existing midnight refresh
    await LocalNotifications.cancel({ notifications: [{ id: MIDNIGHT_REFRESH_ID }] });

    // Get tomorrow's midnight
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 1, 0, 0); // 00:01 AM

    console.log('📅 Scheduling midnight refresh for:', tomorrow.toLocaleString());

    // Schedule repeating daily notification at midnight
    await LocalNotifications.schedule({
      notifications: [{
        id: MIDNIGHT_REFRESH_ID,
        title: '🌟 Daily Panchang Update',
        body: 'Refreshing your daily astro alerts...',
        schedule: {
          at: tomorrow,
          every: 'day', // Repeat daily
          allowWhileIdle: true
        },
        channelId: VOICE_CHANNEL_ID,
        sound: 'default_beep.mp3',
        smallIcon: 'ic_launcher',
        extra: {
          type: 'midnight_refresh',
          action: 'reschedule_all'
        },
        ongoing: false,
        autoCancel: true
      }]
    });

    console.log('✅ Midnight auto-refresh scheduled!');
  } catch (e) {
    console.error('❌ Failed to schedule midnight refresh:', e);
  }
}

/**
 * Fetch panchang data for today and schedule notifications
 * This is called by the midnight refresh notification
 */
export async function fetchAndScheduleNotifications() {
  // Only run in browser/client context
  if (typeof window === 'undefined') {
    console.log('⚠️ Skipping notification scheduling (not in browser)');
    return;
  }

  try {
    console.log('🔄 Auto-scheduling notifications for today...');

    // Get user preferences
    const { value } = await Preferences.get({ key: 'notification_preferences' });
    const prefs: NotificationPreferences = value 
      ? { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(value) }
      : DEFAULT_NOTIFICATION_PREFERENCES;

    // Get user location (or use default)
    const { value: locValue } = await Preferences.get({ key: 'user_location' });
    const location = locValue 
      ? JSON.parse(locValue) 
      : { lat: 28.6139, lon: 77.2090, timezone: 'Asia/Kolkata' };

    // Fetch today's panchang data
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch('/api/panchang/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: today,
        lat: location.lat,
        lon: location.lon,
        timezone: location.timezone
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch panchang data');
    }

    const panchangData = await response.json();

    // Schedule notifications based on preferences
    await scheduleNotificationsFromPreferences(panchangData, prefs);

    // Re-schedule tomorrow's midnight refresh
    await scheduleMidnightRefresh();

    console.log('✅ Auto-scheduling complete!');
  } catch (e) {
    console.error('❌ Auto-scheduling failed:', e);
    // Retry tomorrow
    await scheduleMidnightRefresh();
  }
}

/**
 * Schedule all notifications based on user preferences and panchang data
 */
async function scheduleNotificationsFromPreferences(
  panchangData: any, 
  prefs: NotificationPreferences
) {
  const notifications: any[] = [];
  const now = new Date();
  let notificationId = 1000;

  // Helper to parse time and apply offset
  const parseTimeWithOffset = (timeStr: string, offsetMinutes: number) => {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    date.setMinutes(date.getMinutes() + offsetMinutes);
    return date;
  };

  // Helper to get sound path
  const getSound = (soundName: string) => {
    return soundName || 'default_beep.mp3';
  };

  // 1. RAHU KAAL
  const rahuKaal = panchangData?.widgets?.rahu_kaal;
  if (rahuKaal) {
    // Rahu Kaal Start
    if (prefs.rahuKaalStart.enabled && rahuKaal.start) {
      const triggerTime = parseTimeWithOffset(rahuKaal.start, prefs.rahuKaalStart.timeOffsetMinutes);
      if (triggerTime > now) {
        notifications.push({
          id: notificationId++,
          title: '⚠️ Rahu Kaal Starting Soon',
          body: `Inauspicious period begins at ${rahuKaal.start}`,
          schedule: { at: triggerTime, allowWhileIdle: true },
          channelId: VOICE_CHANNEL_ID,
          sound: getSound(prefs.rahuKaalStart.sound),
          smallIcon: 'ic_launcher',
          extra: { type: 'rahu_kaal_start' }
        });
      }
    }

    // Rahu Kaal End
    if (prefs.rahuKaalEnd.enabled && rahuKaal.end) {
      const triggerTime = parseTimeWithOffset(rahuKaal.end, prefs.rahuKaalEnd.timeOffsetMinutes);
      if (triggerTime > now) {
        notifications.push({
          id: notificationId++,
          title: '✅ Rahu Kaal Ending Soon',
          body: `Inauspicious period ends at ${rahuKaal.end}`,
          schedule: { at: triggerTime, allowWhileIdle: true },
          channelId: VOICE_CHANNEL_ID,
          sound: getSound(prefs.rahuKaalEnd.sound),
          smallIcon: 'ic_launcher',
          extra: { type: 'rahu_kaal_end' }
        });
      }
    }
  }

  // 2. ABHIJEET MUHURAT
  const abhijit = panchangData?.widgets?.special_muhurats?.abhijit_muhurat;
  if (prefs.abhijeetMuhurat.enabled && abhijit?.start) {
    const triggerTime = parseTimeWithOffset(abhijit.start, prefs.abhijeetMuhurat.timeOffsetMinutes);
    if (triggerTime > now) {
      notifications.push({
        id: notificationId++,
        title: '✨ Abhijeet Muhurat Starting',
        body: 'Best time for success in new ventures!',
        schedule: { at: triggerTime, allowWhileIdle: true },
        channelId: VOICE_CHANNEL_ID,
        sound: getSound(prefs.abhijeetMuhurat.sound),
        smallIcon: 'ic_launcher',
        extra: { type: 'abhijeet' }
      });
    }
  }

  // 3. CHAUGHADIYA
  const chaughadiya = panchangData?.widgets?.chaughadiya_roadmap?.day || [];
  chaughadiya.forEach((slot: any) => {
    const isGood = slot.type === 'Good' || slot.color === 'green';
    const setting = isGood ? prefs.chaughadiyaGood : prefs.chaughadiyaBad;

    if (setting.enabled && slot.start_time) {
      const triggerTime = parseTimeWithOffset(slot.start_time, setting.timeOffsetMinutes);
      if (triggerTime > now) {
        notifications.push({
          id: notificationId++,
          title: `${isGood ? '🟢' : '🔴'} ${slot.name} Period`,
          body: slot.meaning || 'Chaughadiya period starting',
          schedule: { at: triggerTime, allowWhileIdle: true },
          channelId: VOICE_CHANNEL_ID,
          sound: getSound(setting.sound),
          smallIcon: 'ic_launcher',
          extra: { type: 'chaughadiya', name: slot.name }
        });
      }
    }
  });

  // 4. DAILY TITHI (Morning 8 AM)
  if (prefs.dailyTithi.enabled) {
    const morning = new Date();
    morning.setHours(8, 0, 0, 0);
    morning.setMinutes(morning.getMinutes() + prefs.dailyTithi.timeOffsetMinutes);
    
    if (morning > now && panchangData?.core_data?.tithi) {
      const tithi = panchangData.core_data.tithi;
      notifications.push({
        id: notificationId++,
        title: '📅 Today\'s Tithi',
        body: `${tithi.name} (${tithi.paksha})`,
        schedule: { at: morning, allowWhileIdle: true },
        channelId: VOICE_CHANNEL_ID,
        sound: getSound(prefs.dailyTithi.sound),
        smallIcon: 'ic_launcher',
        extra: { type: 'daily_tithi' }
      });
    }
  }

  // 5. DAILY NAKSHATRA
  if (prefs.dailyNakshatra.enabled) {
    const morning = new Date();
    morning.setHours(8, 5, 0, 0); // Slightly offset from Tithi
    morning.setMinutes(morning.getMinutes() + prefs.dailyNakshatra.timeOffsetMinutes);
    
    if (morning > now && panchangData?.core_data?.nakshatra) {
      const nakshatra = panchangData.core_data.nakshatra;
      notifications.push({
        id: notificationId++,
        title: '⭐ Today\'s Nakshatra',
        body: nakshatra.name,
        schedule: { at: morning, allowWhileIdle: true },
        channelId: VOICE_CHANNEL_ID,
        sound: getSound(prefs.dailyNakshatra.sound),
        smallIcon: 'ic_launcher',
        extra: { type: 'daily_nakshatra' }
      });
    }
  }

  // 6. DAILY YOGA
  if (prefs.dailyYoga.enabled) {
    const morning = new Date();
    morning.setHours(8, 10, 0, 0); // Further offset
    morning.setMinutes(morning.getMinutes() + prefs.dailyYoga.timeOffsetMinutes);
    
    if (morning > now && panchangData?.core_data?.yoga) {
      const yoga = panchangData.core_data.yoga;
      notifications.push({
        id: notificationId++,
        title: '🧘 Today\'s Yoga',
        body: yoga.name,
        schedule: { at: morning, allowWhileIdle: true },
        channelId: VOICE_CHANNEL_ID,
        sound: getSound(prefs.dailyYoga.sound),
        smallIcon: 'ic_launcher',
        extra: { type: 'daily_yoga' }
      });
    }
  }

  // Schedule all notifications
  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
    console.log(`✅ Scheduled ${notifications.length} notifications for today`);
  }
}

/**
 * Register service worker for web/PWA periodic background sync
 */
async function registerServiceWorkerSync() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if periodic sync is supported
    if ('periodicSync' in registration) {
      // @ts-ignore - periodicSync is not in all TS definitions yet
      await registration.periodicSync.register('daily-notification-refresh', {
        minInterval: 24 * 60 * 60 * 1000 // 24 hours
      });
      console.log('✅ Service Worker periodic sync registered');
    } else {
      console.warn('⚠️ Periodic Background Sync not supported');
      // Fallback: Store next check time and check on app open
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 1, 0, 0);
      await Preferences.set({ 
        key: 'next_notification_check', 
        value: tomorrow.toISOString() 
      });
    }
  } catch (e) {
    console.error('Service worker sync registration failed:', e);
  }
}

/**
 * Initialize the notification scheduler
 * Call this when the app starts and when user saves preferences
 */
export async function initializeNotificationScheduler() {
  // Only run in browser/client context
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Check permissions first
    if (Capacitor.getPlatform() !== 'web') {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        console.log('⚠️ Notification permissions not granted');
        return;
      }
    }

    // Schedule initial notifications for today
    await fetchAndScheduleNotifications();

    console.log('✅ Notification scheduler initialized');
  } catch (e) {
    console.error('❌ Failed to initialize notification scheduler:', e);
  }
}

/**
 * Check if we need to refresh notifications (for web fallback)
 * Call this when app opens
 */
export async function checkAndRefreshIfNeeded() {
  try {
    const { value } = await Preferences.get({ key: 'next_notification_check' });
    if (!value) return;

    const nextCheck = new Date(value);
    const now = new Date();

    if (now >= nextCheck) {
      console.log('🔄 Time to refresh notifications...');
      await fetchAndScheduleNotifications();
    }
  } catch (e) {
    console.error('Check and refresh failed:', e);
  }
}
