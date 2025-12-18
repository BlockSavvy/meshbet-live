import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PUSH_TOKEN: 'meshbet_push_token',
  NOTIFICATIONS_ENABLED: 'meshbet_notifications_enabled',
};

export type NotificationType = 
  | 'bet_received'
  | 'bet_accepted'
  | 'bet_settled'
  | 'bet_cancelled'
  | 'peer_joined'
  | 'stream_started';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private pushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;
  private notificationCallbacks: ((notification: Notifications.Notification) => void)[] = [];
  private responseCallbacks: ((response: Notifications.NotificationResponse) => void)[] = [];

  async initialize(): Promise<boolean> {
    try {
      const enabled = await this.requestPermissions();
      if (!enabled) {
        console.log('[Notifications] Permissions not granted');
        return false;
      }

      await this.registerForPushNotifications();
      this.setupListeners();
      
      console.log('[Notifications] Service initialized');
      return true;
    } catch (error) {
      console.error('[Notifications] Failed to initialize:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('[Notifications] Web platform - using mock notifications');
      return true;
    }

    if (!Device.isDevice) {
      console.log('[Notifications] Not a physical device - notifications may not work');
      return true;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'MeshBet Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00ffff',
      });

      await Notifications.setNotificationChannelAsync('bets', {
        name: 'Betting Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#ff00ff',
      });
    }

    return true;
  }

  async registerForPushNotifications(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '6b24eab9-a29e-46d0-8520-84aaafbe3e07',
      });
      
      this.pushToken = tokenData.data;
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, this.pushToken);
      
      console.log('[Notifications] Push token:', this.pushToken);
      return this.pushToken;
    } catch (error) {
      console.error('[Notifications] Failed to get push token:', error);
      return null;
    }
  }

  private setupListeners(): void {
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Notifications] Received:', notification);
        this.notificationCallbacks.forEach(cb => cb(notification));
      }
    );

    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[Notifications] User responded:', response);
        this.responseCallbacks.forEach(cb => cb(response));
      }
    );
  }

  async sendLocalNotification(payload: NotificationPayload): Promise<string | null> {
    try {
      const channelId = payload.type.startsWith('bet_') ? 'bets' : 'default';
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: { type: payload.type, ...payload.data },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      console.log('[Notifications] Sent local notification:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('[Notifications] Failed to send notification:', error);
      return null;
    }
  }

  async notifyBetReceived(fromUser: string, amount: number, eventName: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'bet_received',
      title: 'New Bet Proposal',
      body: `${fromUser} wants to bet $${amount} on ${eventName}`,
      data: { fromUser, amount, eventName },
    });
  }

  async notifyBetAccepted(byUser: string, amount: number, eventName: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'bet_accepted',
      title: 'Bet Accepted!',
      body: `${byUser} accepted your $${amount} bet on ${eventName}`,
      data: { byUser, amount, eventName },
    });
  }

  async notifyBetSettled(won: boolean, amount: number, eventName: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'bet_settled',
      title: won ? 'You Won!' : 'Bet Settled',
      body: won 
        ? `Congratulations! You won $${amount * 2} on ${eventName}`
        : `You lost $${amount} on ${eventName}. Better luck next time!`,
      data: { won, amount, eventName },
    });
  }

  async notifyBetCancelled(reason: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'bet_cancelled',
      title: 'Bet Cancelled',
      body: reason,
    });
  }

  async notifyPeerJoined(peerName: string, eventName?: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'peer_joined',
      title: 'New Peer Connected',
      body: eventName 
        ? `${peerName} joined the ${eventName} viewing party`
        : `${peerName} connected to your mesh network`,
      data: { peerName, eventName },
    });
  }

  async notifyStreamStarted(hostName: string, streamTitle: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'stream_started',
      title: 'Live Stream Started',
      body: `${hostName} is now streaming: ${streamTitle}`,
      data: { hostName, streamTitle },
    });
  }

  onNotification(callback: (notification: Notifications.Notification) => void): () => void {
    this.notificationCallbacks.push(callback);
    return () => {
      const index = this.notificationCallbacks.indexOf(callback);
      if (index > -1) this.notificationCallbacks.splice(index, 1);
    };
  }

  onNotificationResponse(callback: (response: Notifications.NotificationResponse) => void): () => void {
    this.responseCallbacks.push(callback);
    return () => {
      const index = this.responseCallbacks.indexOf(callback);
      if (index > -1) this.responseCallbacks.splice(index, 1);
    };
  }

  async setEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, enabled ? 'true' : 'false');
  }

  async isEnabled(): Promise<boolean> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    return stored !== 'false';
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
    await this.setBadgeCount(0);
  }

  getPushToken(): string | null {
    return this.pushToken;
  }

  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }
}

export const notificationService = new NotificationService();
