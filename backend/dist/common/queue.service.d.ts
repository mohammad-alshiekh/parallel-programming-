import type { Queue } from 'bull';
export declare class QueueService {
    private invoiceQueue;
    private notificationQueue;
    constructor(invoiceQueue: Queue, notificationQueue: Queue);
    addInvoiceGenerationTask(orderId: string, userId: string): Promise<import("bull").Job<any>>;
    addNotificationTask(userId: string, message: string, type: string): Promise<import("bull").Job<any>>;
    getQueueStats(): Promise<{
        invoices: import("bull").JobCounts;
        notifications: import("bull").JobCounts;
    }>;
}
