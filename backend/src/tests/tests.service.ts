import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private productsService: ProductsService,
    private ordersService: OrdersService,
  ) {}

  /**
   * Test 1: Race Condition & Optimistic Locking
   */
  async testRaceCondition(): Promise<TestResult> {
    const startTime = Date.now();
    const results: TestResult = {
      name: 'Race Condition & Optimistic Locking Test',
      description: 'Tests concurrent data protection with optimistic locking',
      nfr: 'NFR #1: Concurrent Data Protection',
      startTime,
      endTime: 0,
      duration: 0,
      steps: [],
      metrics: {
        successful: 0,
        failed: 0,
        successRate: 0,
        totalRequests: 10,
      },
      productData: {
        initialQuantity: 0,
        finalQuantity: 0,
        expectedQuantity: 0,
        isCorrect: false,
        initialVersion: 0,
        finalVersion: 0,
      },
      status: 'PASSED',
      message: '',
    };

    try {
      // Step 1: Create test product
      results.steps.push({
        step: 1,
        description: '📦 Creating test product...',
        status: 'running' as const,
      });

      const product = await this.productsService.create(
        `Race Condition Test ${Date.now()}`,
        'Product for race condition testing',
        100,
        10
      );

      results.steps[0].status = 'completed' as const;
      results.productData.initialQuantity = product.quantity;
      results.productData.initialVersion = product.version;

      // Step 2: Simulate concurrent requests (race condition)
      results.steps.push({
        step: 2,
        description: '🏃 Simulating 10 concurrent reserve requests...',
        status: 'running' as const,
      });

      const concurrentRequests = Array(10)
        .fill(null)
        .map(() =>
          this.productsService.updateQuantity(product.id, 1, product.version)
            .then(() => ({ error: false }))
            .catch(() => ({ error: true })),
        );

      const reserveResults = await Promise.all(concurrentRequests);
      const successful = reserveResults.filter((r) => !r.error);
      const failed = reserveResults.filter((r) => r.error);

      results.steps[1].status = 'completed' as const;
      results.metrics.successful = successful.length;
      results.metrics.failed = failed.length;
      results.metrics.successRate = (successful.length / 10) * 100;

      // Step 3: Verify final quantity
      results.steps.push({
        step: 3,
        description: '🔍 Verifying final quantity...',
        status: 'running' as const,
      });

      const finalProduct = await this.productRepository.findOne({
        where: { id: product.id },
      });

      results.steps[2].status = 'completed' as const;
      if (finalProduct) {
        results.productData.finalQuantity = finalProduct.quantity;
        results.productData.expectedQuantity = 10 - successful.length;
        results.productData.isCorrect =
          finalProduct.quantity === results.productData.expectedQuantity &&
          finalProduct.quantity >= 0;
        results.productData.finalVersion = finalProduct.version;
      } else {
        throw new Error('Product not found after test');
      }

      // Determine test status
      if (
        results.productData.isCorrect &&
        results.metrics.successRate === 100
      ) {
        results.status = 'PASSED';
        results.message =
          '✅ System protects data from race conditions successfully!';
      } else if (results.metrics.successRate >= 95) {
        results.status = 'WARNING';
        results.message =
          '⚠️ System works but may have minor issues with data consistency';
      } else {
        results.status = 'FAILED';
        results.message =
          '❌ Data protection failed! Race condition detected.';
      }
    } catch (error: any) {
      results.status = 'ERROR';
      results.message = `Error during test: ${error?.message || 'Unknown error'}`;
      results.steps.push({
        step: -1,
        description: '❌ Test Error',
        status: 'failed' as const,
      });
    }

    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;
    return results;
  }

  /**
   * Test 2: Concurrency Control & Resource Management
   */
  async testConcurrencyControl(): Promise<TestResult> {
    const startTime = Date.now();
    const results: TestResult = {
      name: 'Concurrency Control & Resource Management Test',
      description: 'Tests resource management under high concurrent load',
      nfr: 'NFR #2: Resource Management',
      startTime,
      endTime: 0,
      duration: 0,
      steps: [],
      metrics: {
        successful: 0,
        failed: 0,
        successRate: 0,
        totalRequests: 100,
        minTime: 0,
        maxTime: 0,
        avgTime: 0,
        requestsPerSecond: 0,
      },
      productData: {
        initialQuantity: 0,
        finalQuantity: 0,
        expectedQuantity: 0,
        isCorrect: false,
      },
      status: 'PASSED',
      message: '',
    };

    try {
      // Step 1: Create test product
      results.steps.push({
        step: 1,
        description: '📦 Creating test product with 1000 units...',
        status: 'running' as const,
      });

      const product = await this.productsService.create(
        `Concurrency Test ${Date.now()}`,
        'Product for concurrency testing',
        50,
        1000
      );

      results.productData.initialQuantity = product.quantity;
      results.steps[0].status = 'completed' as const;

      // Step 2: Create test user
      results.steps.push({
        step: 2,
        description: '👤 Creating test user...',
        status: 'running' as const,
      });

      const user = await this.userRepository.save({
        email: `test${Date.now()}@example.com`,
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
      });

      results.steps[1].status = 'completed' as const;

      // Step 3: Simulate 100 concurrent orders
      results.steps.push({
        step: 3,
        description: '⚡ Simulating 100 concurrent order requests...',
        status: 'running' as const,
      });

      const requestStartTime = Date.now();
      const concurrentOrders = Array(100)
        .fill(null)
        .map(() =>
          this.ordersService
            .createOrder(user.id, [{ productId: product.id, quantity: 1 }])
            .then(() => ({
              success: true,
              time: Date.now() - requestStartTime,
            }))
            .catch(() => ({
              success: false,
              time: Date.now() - requestStartTime,
            })),
        );

      const orderResults = await Promise.all(concurrentOrders);
      const successful = orderResults.filter((r) => r.success);
      const failed = orderResults.filter((r) => !r.success);
      const totalTime = Date.now() - requestStartTime;

      results.steps[2].status = 'completed' as const;
      results.metrics.successful = successful.length;
      results.metrics.failed = failed.length;
      results.metrics.successRate = (successful.length / 100) * 100;

      // Calculate time metrics
      const times = successful.map((r) => r.time);
      if (times.length > 0) {
        results.metrics.minTime = Math.min(...times);
        results.metrics.maxTime = Math.max(...times);
        results.metrics.avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        results.metrics.requestsPerSecond = +(
          (successful.length / (totalTime / 1000))
        ).toFixed(2);
      }

      // Step 4: Verify product quantity
      results.steps.push({
        step: 4,
        description: '🔍 Verifying final product quantity...',
        status: 'running' as const,
      });

      const finalProduct = await this.productRepository.findOne({
        where: { id: product.id },
      });

      if (finalProduct) {
        results.productData.finalQuantity = finalProduct.quantity;
        results.productData.expectedQuantity =
          product.quantity - successful.length;
        results.productData.isCorrect =
          finalProduct.quantity === results.productData.expectedQuantity;
      } else {
        throw new Error('Product not found after test');
      }

      results.steps[3].status = 'completed' as const;

      // Determine test status
      if (
        results.productData.isCorrect &&
        results.metrics.successRate === 100
      ) {
        results.status = 'PASSED';
        results.message =
          '✅ System manages resources successfully under concurrent load!';
      } else if (results.metrics.successRate >= 95) {
        results.status = 'WARNING';
        results.message =
          '⚠️ System works but some requests failed under load';
      } else {
        results.status = 'FAILED';
        results.message =
          '❌ Resource management failed under concurrent load!';
      }
    } catch (error: any) {
      results.status = 'ERROR';
      results.message = `Error during test: ${error?.message || 'Unknown error'}`;
      results.steps.push({
        step: -1,
        description: '❌ Test Error',
        status: 'failed' as const,
      });
    }

    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;
    return results;
  }
}
