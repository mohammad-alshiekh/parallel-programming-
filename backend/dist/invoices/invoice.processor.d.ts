import type { Job } from 'bull';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Order } from '../orders/order.entity';
export declare class InvoiceProcessor {
    private invoiceRepository;
    private orderRepository;
    constructor(invoiceRepository: Repository<Invoice>, orderRepository: Repository<Order>);
    generateInvoice(job: Job<{
        orderId: string;
        userId: string;
    }>): Promise<{
        success: boolean;
        invoiceId: string;
    }>;
}
