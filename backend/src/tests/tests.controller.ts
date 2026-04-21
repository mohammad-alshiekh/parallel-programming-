import { Controller, Get, UseGuards } from '@nestjs/common';
import { TestsService, TestResult } from './tests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tests')
@UseGuards(JwtAuthGuard)
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get('race-condition')
  async testRaceCondition(): Promise<TestResult> {
    return await this.testsService.testRaceCondition();
  }

  @Get('concurrency-control')
  async testConcurrencyControl(): Promise<TestResult> {
    return await this.testsService.testConcurrencyControl();
  }
}
