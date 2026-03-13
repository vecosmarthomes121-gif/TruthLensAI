import { toast } from 'sonner';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
}

class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      toast.error('Notifications are blocked. Please enable them in browser settings.');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      
      if (result === 'granted') {
        toast.success('Notifications enabled! You\'ll receive updates on your verifications.');
        return true;
      } else {
        toast.info('Notifications disabled. You can enable them later in settings.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Show a browser notification
   */
  async show(options: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    if (this.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192.png',
        badge: options.badge || '/favicon.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        vibrate: [200, 100, 200],
      });

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Handle navigation based on notification data
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
        
        notification.close();
      };

      // Auto-close after 10 seconds if not requiring interaction
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 10000);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Notify about trending claim update
   */
  async notifyTrendingClaimUpdate(claim: string, newEvidenceCount: number): Promise<void> {
    await this.show({
      title: '🔄 Trending Claim Updated',
      body: `New evidence found for "${claim.substring(0, 60)}..." (${newEvidenceCount} new sources)`,
      tag: 'trending-update',
      requireInteraction: true,
      data: {
        type: 'trending-update',
        claim,
      },
    });
  }

  /**
   * Notify about achievement badge earned
   */
  async notifyBadgeEarned(badgeName: string, badgeIcon: string, description: string): Promise<void> {
    await this.show({
      title: `${badgeIcon} Achievement Unlocked!`,
      body: `${badgeName}: ${description}`,
      tag: 'badge-earned',
      requireInteraction: true,
      data: {
        type: 'badge',
        badgeName,
      },
    });
    
    // Also show a toast for immediate feedback
    toast.success(`${badgeIcon} Achievement unlocked: ${badgeName}!`, {
      duration: 5000,
    });
  }

  /**
   * Notify about media verification completion
   */
  async notifyMediaVerificationComplete(
    type: 'image' | 'video',
    truthScore: number,
    status: string
  ): Promise<void> {
    const emoji = type === 'image' ? '🖼️' : '🎥';
    const statusEmoji = truthScore >= 60 ? '✅' : truthScore >= 40 ? '⚠️' : '❌';
    
    await this.show({
      title: `${emoji} ${type === 'image' ? 'Image' : 'Video'} Verification Complete`,
      body: `${statusEmoji} Truth Score: ${truthScore}% - ${status.replace('-', ' ').toUpperCase()}`,
      tag: 'verification-complete',
      requireInteraction: true,
      data: {
        type: 'verification-complete',
        mediaType: type,
      },
    });
  }

  /**
   * Notify about verification streak milestone
   */
  async notifyStreakMilestone(days: number): Promise<void> {
    await this.show({
      title: '🔥 Verification Streak!',
      body: `Amazing! You've verified claims for ${days} days in a row. Keep it up!`,
      tag: 'streak-milestone',
      data: {
        type: 'streak',
        days,
      },
    });
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.permission === 'granted';
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }
}

export const notificationService = new NotificationService();
