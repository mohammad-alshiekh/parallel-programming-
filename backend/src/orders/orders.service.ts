import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { ConcurrencyControlService } from '../common/concurrency-control.service';
import { QueueService } from '../common/queue.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private concurrencyControl: ConcurrencyControlService,
    private queueService: QueueService,
  ) {}

  /**
   * Create order with concurrency control and async task queueing
   * NFR #2: Uses concurrency control to limit simultaneous operations
   * NFR #3: Queues invoice generation and notification tasks
   */
  async createOrder(userId: string, items: Array<{ productId: string; quantity: number }>) {
    return this.concurrencyControl.execute(async () => {
      let totalAmount = 0;
      const orderItems: Array<{ productId: string; quantity: number; price: number }> = [];

      // Verify and lock products
      for (const item of items) {
        const product = await this.productsRepository.findOne({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestException(`Product ${item.productId} not found`);
        }

        if (product.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient quantity for product ${product.name}. Available: ${product.quantity}`,
          );
        }

        totalAmount += product.price * item.quantity;
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // Create order
      const order = this.ordersRepository.create({
        userId,
        items: orderItems,
        totalAmount,
        status: 'pending',
      });

      const savedOrder = await this.ordersRepository.save(order);

      // Reduce product quantities
      for (const item of items) {
        const product = await this.productsRepository.findOne({
          where: { id: item.productId },
        });
        if (product) {
          await this.productsRepository.update(item.productId, {
            quantity: product.quantity - item.quantity,
          });
        }
      }

      // Queue async tasks (NFR #3)
      await this.queueService.addInvoiceGenerationTask(savedOrder.id, userId);
      await this.queueService.addNotificationTask(
        userId,
        `Your order ${savedOrder.id} has been created`,
        'order_created',
      );

      return savedOrder;
    });
  }

  async findById(id: string) {
    return this.ordersRepository.findOne({ where: { id } });
  }

  async findByUserId(userId: string) {
    return this.ordersRepository.find({ where: { userId } });
  }

  async updateStatus(id: string, status: string) {
    await this.ordersRepository.update(id, { status });
    return this.ordersRepository.findOne({ where: { id } });
  }
}
