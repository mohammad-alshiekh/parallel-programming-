import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
export interface TestStep {
    step: number;
    description: string;
    status: 'running' | 'completed' | 'failed';
}
export interface TestMetrics {
    successful: number;
    failed: number;
    successRate: number;
    totalRequests: number;
    minTime?: number;
    maxTime?: number;
    avgTime?: number;
    requestsPerSecond?: number;
}
export interface TestResult {
    name: string;
    description: string;
    nfr: string;
    startTime: number;
    endTime: number;
    duration: number;
    steps: TestStep[];
    metrics: TestMetrics;
    productData: {
        initialQuantity: number;
        finalQuantity: number;
        expectedQuantity: number;
        isCorrect: boolean;
        initialVersion?: number;
        finalVersion?: number;
    };
    status: 'PASSED' | 'WARNING' | 'FAILED' | 'ERROR';
    message: string;
}
export declare class TestsService {
    private productRepository;
    private userRepository;
    private orderRepository;
    private productsService;
    private ordersService;
    constructor(productRepository: Repository<Product>, userRepository: Repository<User>, orderRepository: Repository<Order>, productsService: ProductsService, ordersService: OrdersService);
    testRaceCondition(): Promise<TestResult>;
    testConcurrencyControl(): Promise<TestResult>;
}
