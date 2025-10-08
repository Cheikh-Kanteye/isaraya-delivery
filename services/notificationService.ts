import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';

interface NotificationConfig {
  firebaseServerKey: string;
  firebaseProjectId: string;
}

let notificationConfig: NotificationConfig | null = null;

export const notificationService = {
  async initialize(config: NotificationConfig): Promise<void> {
    notificationConfig = config;

    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
      if (!token) {
        await this.registerForPushNotifications();
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  },

  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        console.log('Push notifications not supported on web');
        return null;
      }

      const existingToken = await AsyncStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
      if (existingToken) {
        return existingToken;
      }

      return null;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return null;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  },

  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
    } catch (error) {
      console.error('Failed to save FCM token:', error);
    }
  },

  async sendTokenToServer(token: string, userId: string): Promise<void> {
    try {
      console.log('Sending FCM token to server:', { token, userId });
    } catch (error) {
      console.error('Failed to send token to server:', error);
    }
  },

  async schedulePushNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    try {
      console.log('Scheduling notification:', { title, body, data });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  },

  async handleNotificationReceived(
    notification: any,
    onNotification?: (notification: any) => void
  ): Promise<void> {
    console.log('Notification received:', notification);
    if (onNotification) {
      onNotification(notification);
    }
  },

  async handleNotificationResponse(
    response: any,
    onResponse?: (response: any) => void
  ): Promise<void> {
    console.log('Notification response:', response);
    if (onResponse) {
      onResponse(response);
    }
  },

  async clearAllNotifications(): Promise<void> {
    try {
      console.log('Clearing all notifications');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  },
};
