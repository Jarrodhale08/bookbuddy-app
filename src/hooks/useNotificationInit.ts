/**
 * useNotificationInit Hook
 * Initializes push notifications on app startup
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notification.service';

export function useNotificationInit() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Initialize notification service
    notificationService.initialize().catch(console.warn);

    // Listen for notifications received while app is foregrounded
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    // Listen for notification interactions (taps)
    responseListener.current = notificationService.addNotificationResponseListener(
      (response) => {
        const data = response.notification.request.content.data;

        // Navigate based on notification type
        if (data?.screen) {
          router.push(data.screen as any);
        } else if (data?.type === 'reading-reminder') {
          router.push('/(tabs)');
        } else if (data?.type === 'achievement') {
          router.push('/(tabs)/profile');
        }
      }
    );

    // Schedule default reminders
    notificationService.scheduleReadingReminders().catch(console.warn);
    notificationService.scheduleWeeklyReport().catch(console.warn);

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);
}

export default useNotificationInit;
