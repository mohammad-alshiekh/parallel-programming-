import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { ConcurrencyControlService } from '../common/concurrency-control.service';
import { QueueService } from '../common/queue.service';
export declare class OrdersService {
    private ordersRepository;
    private productsRepository;
    private concurrencyControl;
    private queueService;
    constructor(ordersRepository: Repository<Order>, productsRepository: Repository<Product>, concurrencyControl: ConcurrencyControlService, queueService: QueueService);
    createOrder(userId: string, items: Array<{
        productId: string;
        quantity: number;
    }>): Promise<Order>;
    findById(id: string): Promise<Order | null>;
    findByUserId(userId: string): Promise<Order[]>;
    updateStatus(id: string, status: string): Promise<Order | null>;
}
