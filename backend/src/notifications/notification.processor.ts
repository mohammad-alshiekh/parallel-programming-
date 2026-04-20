import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';

/**
 * NFR #3: Async Queue Processor
 * Handles background notification tasks
 * Sends notifications without blocking the main request
 */
@Processor('notifications')
export class NotificationProcessor {
  @Process('send-notification')
  async sendNotification(job: Job<{ userId: string; message: string; type: string }>) {
    const { userId, message, type } = job.data;

    try {
      // Simulate sending notification
      console.log(`[NOTIFICATION] Sending ${type} to user ${userId}: ${message}`);

      // In production, this would integrate with email/SMS/push services
      // For now, we just log it

      return { success: true, userId, type };
    } catch (error) {
      console.error('Notification sending failed:', error);
      throw error;
    }
  }
}
