import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

/**
 * NFR #3: Asynchronous Processing with Queues
 * Handles background tasks like invoice generation and notifications
 * Prevents blocking the main request/response cycle
 */
@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('invoices') private invoiceQueue: Queue,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  /**
   * Add invoice generation task to queue
   */
  async addInvoiceGenerationTask(orderId: string, userId: string) {
    return this.invoiceQueue.add(
      'generate-invoice',
      { orderId, userId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      },
    );
  }

  /**
   * Add notification task to queue
   */
  async addNotificationTask(userId: string, message: string, type: string) {
    return this.notificationQueue.add(
      'send-notification',
      { userId, message, type },
      {
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 1000,
        },
        removeOnComplete: true,
      },
    );
  }

  /**
   * Get queue stats
   */
  async getQueueStats() {
    const invoiceStats = await this.invoiceQueue.getJobCounts();
    const notificationStats = await this.notificationQueue.getJobCounts();

    return {
      invoices: invoiceStats,
      notifications: notificationStats,
    };
  }
}
