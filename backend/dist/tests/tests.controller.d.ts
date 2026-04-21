import { TestsService, TestResult } from './tests.service';
export declare class TestsController {
    private readonly testsService;
    constructor(testsService: TestsService);
    testRaceCondition(): Promise<TestResult>;
    testConcurrencyControl(): Promise<TestResult>;
}
