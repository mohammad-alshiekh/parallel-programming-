export declare class ConcurrencyControlService {
    private activeOperations;
    private readonly maxConcurrency;
    private readonly waitQueue;
    acquire(): Promise<void>;
    release(): void;
    execute<T>(fn: () => Promise<T>): Promise<T>;
    getStats(): {
        activeOperations: number;
        maxConcurrency: number;
        queueLength: number;
    };
}
