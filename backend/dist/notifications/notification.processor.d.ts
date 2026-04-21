import type { Job } from 'bull';
export declare class NotificationProcessor {
    sendNotification(job: Job<{
        userId: string;
        message: string;
        type: string;
    }>): Promise<{
        success: boolean;
        userId: string;
        type: string;
    }>;
}
