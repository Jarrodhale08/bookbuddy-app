/**
 * BookBuddy Notification Service
 * Handles push notifications using expo-notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  pushEnabled: boolean;
  reminders: boolean;
  achievements: boolean;
  weeklyReport: boolean;
  marketing: boolean;
  reminderTime: { hour: number; minute: number };
  reminderDays: number[]; // 1-7, Sunday = 1
}

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  reminders: true,
  achievements: true,
  weeklyReport: false,
  marketing: false,
  reminderTime: { hour: 20, minute: 0 }, // 8 PM - reading reminder
  reminderDays: [1, 2, 3, 4, 5, 6, 7], // Every day
};

const SETTINGS_KEY = '@bookbuddy_notification_settings';
const PUSH_TOKEN_KEY = '@bookbuddy_push_token';

class NotificationService {
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private expoPushToken: string | null = null;

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<void> {
    await this.loadSettings();
    await this.setupNotificationChannels();

    if (this.settings.pushEnabled) {
      await this.registerForPushNotifications();
    }
  }

  /**
   * Set up Android notification channels
   */
  private async setupNotificationChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F59E0B',
      });

      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Reading Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F59E0B',
        description: 'Daily reading reminders',
      });

      await Notifications.setNotificationChannelAsync('achievements', {
        name: 'Reading Achievements',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 500],
        lightColor: '#10B981',
        description: 'Reading milestone notifications',
      });

      await Notifications.setNotificationChannelAsync('recommendations', {
        name: 'Book Recommendations',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Personalized book recommendations',
      });
    }
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permission');
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Update with actual project ID
      });
      this.expoPushToken = tokenData.data;
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, this.expoPushToken);
      console.log('Push token:', this.expoPushToken);
      return this.expoPushToken;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Load settings from storage
   */
  async loadSettings(): Promise<NotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
    return this.settings;
  }

  /**
   * Save settings to storage
   */
  async saveSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));

      // Update scheduled notifications based on new settings
      if (settings.reminders !== undefined || settings.reminderTime || settings.reminderDays) {
        await this.scheduleReadingReminders();
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSettings {
    return this.settings;
  }

  /**
   * Schedule daily reading reminders
   */
  async scheduleReadingReminders(): Promise<void> {
    // Cancel existing reminders first
    await this.cancelScheduledNotifications('reading-reminder');

    if (!this.settings.pushEnabled || !this.settings.reminders) {
      return;
    }

    const { hour, minute } = this.settings.reminderTime;

    // Schedule for each enabled day
    for (const weekday of this.settings.reminderDays) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to Read! 📚',
          body: this.getRandomReadingReminder(),
          data: { type: 'reading-reminder', screen: '/(tabs)' },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour,
          minute,
        },
        identifier: `reading-reminder-${weekday}`,
      });
    }
  }

  /**
   * Get a random reading reminder message
   */
  private getRandomReadingReminder(): string {
    const reminders = [
      'Your books are waiting! Take a reading break.',
      'A few pages a day keeps boredom away!',
      'Ready to dive back into your current read?',
      'Your reading streak is counting on you!',
      'Adventure awaits in the pages of your book.',
      'Cozy up with a good book tonight.',
      'Your next chapter is calling!',
    ];
    return reminders[Math.floor(Math.random() * reminders.length)];
  }

  /**
   * Schedule weekly reading report
   */
  async scheduleWeeklyReport(): Promise<void> {
    await this.cancelScheduledNotifications('weekly-report');

    if (!this.settings.pushEnabled || !this.settings.weeklyReport) {
      return;
    }

    // Schedule for Sunday at 10 AM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your Weekly Reading Summary 📊',
        body: 'See how much you\'ve read this week!',
        data: { type: 'weekly-report', screen: '/(tabs)/stats' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // Sunday
        hour: 10,
        minute: 0,
      },
      identifier: 'weekly-report',
    });
  }

  /**
   * Send reading goal achievement notification
   */
  async sendAchievementNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    if (!this.settings.pushEnabled || !this.settings.achievements) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'achievement', ...data },
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'achievements' }),
      },
      trigger: null, // Send immediately
    });
  }

  /**
   * Send book recommendation notification
   */
  async sendRecommendationNotification(
    bookTitle: string,
    reason: string
  ): Promise<void> {
    if (!this.settings.pushEnabled || !this.settings.marketing) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Book Recommendation 📖',
        body: `You might enjoy "${bookTitle}" - ${reason}`,
        data: { type: 'recommendation', bookTitle },
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'recommendations' }),
      },
      trigger: null,
    });
  }

  /**
   * Send immediate notification
   */
  async sendImmediateNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    if (!this.settings.pushEnabled) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { ...data },
        sound: 'default',
      },
      trigger: null,
    });
  }

  /**
   * Cancel scheduled notifications by type
   */
  async cancelScheduledNotifications(prefix: string): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.identifier.startsWith(prefix)) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Check notification permissions
   */
  async checkPermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Set up notification response handler
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Set up notification received handler
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
