/**
 * Notification Store - Notification Settings Management
 *
 * Manages notification preferences and scheduling for BookBuddy.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../services/notification.service';

export interface NotificationSettings {
  pushEnabled: boolean;
  reminders: boolean;
  achievements: boolean;
  weeklyReport: boolean;
  marketing: boolean;
  reminderTime: {
    hour: number;
    minute: number;
  };
  reminderDays: number[]; // 1-7 for Sun-Sat
}

interface NotificationState extends NotificationSettings {
  // Status
  permissionGranted: boolean;
  pushToken: string | null;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  togglePush: (enabled: boolean) => Promise<void>;
  toggleReminders: (enabled: boolean) => Promise<void>;
  setReminderTime: (hour: number, minute: number) => Promise<void>;
  setReminderDays: (days: number[]) => Promise<void>;
  scheduleReminders: () => Promise<void>;
  cancelReminders: () => Promise<void>;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  reminders: true,
  achievements: true,
  weeklyReport: true,
  marketing: false,
  reminderTime: {
    hour: 20, // 8 PM - good time for evening reading
    minute: 0,
  },
  reminderDays: [1, 2, 3, 4, 5, 6, 7], // Every day
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      permissionGranted: false,
      pushToken: null,
      isInitialized: false,

      /**
       * Initialize notification service
       */
      initialize: async () => {
        if (get().isInitialized) return;

        try {
          const token = await notificationService.initialize();
          const hasPermission = await notificationService.checkPermissions();

          set({
            pushToken: token,
            permissionGranted: hasPermission,
            isInitialized: true,
          });

          // Schedule reminders if enabled
          if (hasPermission && get().reminders) {
            await get().scheduleReminders();
          }
        } catch (error) {
          console.error('Failed to initialize notifications:', error);
          set({ isInitialized: true });
        }
      },

      /**
       * Request notification permissions
       */
      requestPermissions: async () => {
        const granted = await notificationService.requestPermissions();
        set({ permissionGranted: granted });

        if (granted) {
          const token = await notificationService.registerForPushNotifications();
          set({ pushToken: token });
        }

        return granted;
      },

      /**
       * Update notification settings
       */
      updateSettings: async (settings: Partial<NotificationSettings>) => {
        set(settings);

        // Reschedule reminders if time or days changed
        if (settings.reminderTime || settings.reminderDays) {
          if (get().reminders && get().permissionGranted) {
            await get().scheduleReminders();
          }
        }
      },

      /**
       * Toggle push notifications
       */
      togglePush: async (enabled: boolean) => {
        set({ pushEnabled: enabled });

        if (!enabled) {
          await notificationService.cancelAllNotifications();
        } else if (get().reminders) {
          await get().scheduleReminders();
        }
      },

      /**
       * Toggle reading reminders
       */
      toggleReminders: async (enabled: boolean) => {
        set({ reminders: enabled });

        if (enabled && get().permissionGranted) {
          await get().scheduleReminders();
        } else {
          await get().cancelReminders();
        }
      },

      /**
       * Set reminder time
       */
      setReminderTime: async (hour: number, minute: number) => {
        set({
          reminderTime: { hour, minute },
        });

        if (get().reminders && get().permissionGranted) {
          await get().scheduleReminders();
        }
      },

      /**
       * Set reminder days
       */
      setReminderDays: async (days: number[]) => {
        set({ reminderDays: days });

        if (get().reminders && get().permissionGranted) {
          await get().scheduleReminders();
        }
      },

      /**
       * Schedule reading reminders
       */
      scheduleReminders: async () => {
        // Cancel existing reminders first
        await get().cancelReminders();

        const { reminderTime, reminderDays } = get();

        if (reminderDays.length > 0) {
          // Schedule daily reading reminder
          await notificationService.scheduleDailyReminder(
            reminderTime.hour,
            reminderTime.minute,
            'Time to read!',
            'Continue your reading journey with BookBuddy'
          );
        }
      },

      /**
       * Cancel all reading reminders
       */
      cancelReminders: async () => {
        await notificationService.cancelNotificationsByType('reading_reminder');
      },
    }),
    {
      name: 'bookbuddy-notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pushEnabled: state.pushEnabled,
        reminders: state.reminders,
        achievements: state.achievements,
        weeklyReport: state.weeklyReport,
        marketing: state.marketing,
        reminderTime: state.reminderTime,
        reminderDays: state.reminderDays,
      }),
    }
  )
);

export default useNotificationStore;
