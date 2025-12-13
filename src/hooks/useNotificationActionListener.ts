/**
 * Notification Action Handler
 * 
 * Listens for notification actions (especially the midnight refresh)
 * and handles re-scheduling of notifications
 */

import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { fetchAndScheduleNotifications } from '@/services/notificationScheduler';

export function useNotificationActionListener() {
  useEffect(() => {
    if (Capacitor.getPlatform() === 'web') return;

    let actionListener: any;
    let receivedListener: any;

    // Listen for notification actions
    const setupListeners = async () => {
      actionListener = await LocalNotifications.addListener(
        'localNotificationActionPerformed',
        async (notification) => {
          console.log('📲 Notification action performed:', notification);

          const extra = notification.notification.extra;
          
          // Handle midnight refresh
          if (extra?.type === 'midnight_refresh' || extra?.action === 'reschedule_all') {
            console.log('🌙 Midnight refresh triggered, re-scheduling notifications...');
            try {
              await fetchAndScheduleNotifications();
            } catch (e) {
              console.error('Failed to auto-reschedule:', e);
            }
          }

          // Handle other notification taps
          if (extra?.type === 'rahu_kaal_start' || extra?.type === 'abhijeet') {
            // Maybe navigate to panchang page
            // router.push('/panchang');
          }
        }
      );

      // Also listen for notifications received in foreground
      receivedListener = await LocalNotifications.addListener(
        'localNotificationReceived',
        async (notification) => {
          console.log('📬 Notification received in foreground:', notification);
          
          const extra = notification.extra;
          
          // If it's midnight refresh, trigger rescheduling immediately
          if (extra?.type === 'midnight_refresh') {
            console.log('🌙 Midnight refresh received, re-scheduling...');
            try {
              await fetchAndScheduleNotifications();
            } catch (e) {
              console.error('Failed to auto-reschedule:', e);
            }
          }
        }
      );
    };

    setupListeners();

    // Cleanup
    return () => {
      actionListener?.remove();
      receivedListener?.remove();
    };
  }, []);
}
