import { Injectable } from '@nestjs/common';

/**
 * NFR #2: Resource Management - Concurrency Control
 * Implements a thread pool pattern to limit concurrent operations
 * Prevents resource exhaustion and maintains system stability
 */
@Injectable()
export class ConcurrencyControlService {
  private activeOperations = 0;
  private readonly maxConcurrency = 50; // Maximum concurrent operations
  private readonly waitQueue: Array<() => void> = [];

  /**
   * Acquire a slot for concurrent operation
   * If max concurrency reached, waits in queue
   */
  async acquire(): Promise<void> {
    if (this.activeOperations < this.maxConcurrency) {
      this.activeOperations++;
      return;
    }

    // Wait in queue until slot available
    return new Promise((resolve) => {
      this.waitQueue.push(() => {
        this.activeOperations++;
        resolve();
      });
    });
  }

  /**
   * Release a slot and process next in queue
   */
  release(): void {
    this.activeOperations--;
    const next = this.waitQueue.shift();
    if (next) {
      next();
    }
  }

  /**
   * Execute function with concurrency control
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  /**
   * Get current concurrency stats
   */
  getStats() {
    return {
      activeOperations: this.activeOperations,
      maxConcurrency: this.maxConcurrency,
      queueLength: this.waitQueue.length,
    };
  }
}
