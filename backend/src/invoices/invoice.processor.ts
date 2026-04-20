import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { Order } from '../orders/order.entity';

/**
 * NFR #3: Async Queue Processor
 * Handles background invoice generation tasks
 * Runs outside the main request/response cycle
 */
@Processor('invoices')
export class InvoiceProcessor {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  @Process('generate-invoice')
  async generateInvoice(job: Job<{ orderId: string; userId: string }>) {
    const { orderId, userId } = job.data;

    try {
      const order = await this.orderRepository.findOne({ where: { id: orderId } });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Simulate invoice generation
      const invoiceContent = `
        INVOICE
        -------
        Order ID: ${orderId}
        User ID: ${userId}
        Total Amount: $${order.totalAmount}
        Items: ${JSON.stringify(order.items)}
        Generated at: ${new Date().toISOString()}
      `;

      const invoice = this.invoiceRepository.create({
        orderId,
        userId,
        content: invoiceContent,
        status: 'generated',
      });

      await this.invoiceRepository.save(invoice);

      // Update order with invoice reference
      await this.orderRepository.update(orderId, { invoiceId: invoice.id });

      return { success: true, invoiceId: invoice.id };
    } catch (error) {
      console.error('Invoice generation failed:', error);
      throw error;
    }
  }
}
