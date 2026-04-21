'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

interface TestResult {
  name: string;
  description: string;
  nfr: string;
  startTime: number;
  endTime: number;
  duration: number;
  steps: Array<{
    step: number;
    description: string;
    status: 'running' | 'completed' | 'failed';
  }>;
  metrics: {
    successful: number;
    failed: number;
    successRate: number;
    totalRequests: number;
    minTime?: number;
    maxTime?: number;
    avgTime?: number;
    requestsPerSecond?: number;
  };
  productData: {
    initialQuantity: number;
    finalQuantity: number;
    expectedQuantity: number;
    isCorrect: boolean;
    initialVersion?: number;
    finalVersion?: number;
  };
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'ERROR' | 'LOADING';
  message: string;
}

const initialResult: TestResult = {
  name: '',
  description: '',
  nfr: '',
  startTime: 0,
  endTime: 0,
  duration: 0,
  steps: [],
  metrics: {
    successful: 0,
    failed: 0,
    successRate: 0,
    totalRequests: 0,
  },
  productData: {
    initialQuantity: 0,
    finalQuantity: 0,
    expectedQuantity: 0,
    isCorrect: false,
  },
  status: 'LOADING',
  message: '',
};

export default function Tests() {
  const [raceConditionResult, setRaceConditionResult] = useState<TestResult | null>(null);
  const [concurrencyControlResult, setConcurrencyControlResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check if user exists in store or if there's a token in localStorage
    const token = localStorage.getItem('token');
    
    if (user || token) {
      setIsAuthenticated(true);
    } else {
      router.push('/login');
      setIsAuthenticated(false);
    }
  }, [user, router]);

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const runRaceConditionTest = async () => {
    setRaceConditionResult({ ...initialResult, status: 'LOADING' });
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tests/race-condition', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setRaceConditionResult(data);
    } catch (error: any) {
      console.error('Test error:', error);
      setRaceConditionResult({
        ...initialResult,
        status: 'ERROR',
        message: `Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const runConcurrencyControlTest = async () => {
    setConcurrencyControlResult({ ...initialResult, status: 'LOADING' });
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tests/concurrency-control', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setConcurrencyControlResult(data);
    } catch (error: any) {
      console.error('Test error:', error);
      setConcurrencyControlResult({
        ...initialResult,
        status: 'ERROR',
        message: `Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED':
        return 'bg-green-100 text-green-900 border-green-300';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'FAILED':
      case 'ERROR':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'LOADING':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-900 border-gray-300';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'running':
        return '⏳';
      case 'failed':
        return '❌';
      default:
        return '⏹️';
    }
  };

  const TestResultCard = ({ result }: { result: TestResult | null }) => {
    if (!result)
      return (
        <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300 text-center text-gray-600">
          Test not run yet
        </div>
      );

    // Safely access nested properties with defaults
    const steps = Array.isArray(result.steps) ? result.steps : [];
    const metrics = result.metrics || {};
    const productData = result.productData || {};

    return (
      <div className={`bg-white p-6 rounded-lg shadow-lg border-4 border-gray-200`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{result.name || 'Test'}</h3>
            <p className="text-gray-700 mb-1">{result.description || ''}</p>
            <p className="text-sm text-gray-600">{result.nfr || ''}</p>
          </div>
          <div
            className={`px-4 py-2 rounded-lg font-bold text-center border-2 ${getStatusColor(
              result.status || 'LOADING'
            )}`}
          >
            {result.status || 'LOADING'}
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-gray-900 font-semibold">{result.message || 'Running test...'}</p>
        </div>

        {/* Steps */}
        {steps.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Execution Steps:</h4>
            <div className="space-y-3">
              {steps.map((step: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <span className="text-2xl flex-shrink-0">
                    {getStepStatusIcon(step.status || 'pending')}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Step {step.step || idx + 1}</p>
                    <p className="text-gray-700">{step.description || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded border border-green-200">
            <p className="text-sm text-gray-600">Successful</p>
            <p className="text-2xl font-bold text-green-700">{metrics.successful || 0}</p>
          </div>
          <div className="bg-red-50 p-4 rounded border border-red-200">
            <p className="text-sm text-gray-600">Failed</p>
            <p className="text-2xl font-bold text-red-700">{metrics.failed || 0}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold text-blue-700">
              {typeof metrics.successRate === 'number' ? metrics.successRate.toFixed(1) : 0}%
            </p>
          </div>

          {metrics.avgTime !== undefined && (
            <>
              <div className="bg-purple-50 p-4 rounded border border-purple-200">
                <p className="text-sm text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold text-purple-700">
                  {(metrics.avgTime as number).toFixed(0)}ms
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded border border-indigo-200">
                <p className="text-sm text-gray-600">Min/Max Time</p>
                <p className="text-sm font-bold text-indigo-700">
                  {(metrics.minTime as number)?.toFixed(0)}ms / {(metrics.maxTime as number)?.toFixed(0)}ms
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded border border-orange-200">
                <p className="text-sm text-gray-600">Req/Sec</p>
                <p className="text-2xl font-bold text-orange-700">
                  {metrics.requestsPerSecond || 0}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Product Data */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <p className="text-sm text-gray-600">Initial Quantity</p>
            <p className="text-2xl font-bold text-yellow-700">
              {productData.initialQuantity || 0}
            </p>
          </div>
          <div className="bg-cyan-50 p-4 rounded border border-cyan-200">
            <p className="text-sm text-gray-600">Final Quantity</p>
            <p className="text-2xl font-bold text-cyan-700">
              {productData.finalQuantity || 0}
            </p>
          </div>
          <div className="bg-lime-50 p-4 rounded border border-lime-200">
            <p className="text-sm text-gray-600">Expected Quantity</p>
            <p className="text-2xl font-bold text-lime-700">
              {productData.expectedQuantity || 0}
            </p>
          </div>
          <div className="bg-pink-50 p-4 rounded border border-pink-200">
            <p className="text-sm text-gray-600">Data Integrity</p>
            <p className={`text-2xl font-bold ${
              productData.isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {productData.isCorrect ? '✅ Valid' : '❌ Invalid'}
            </p>
          </div>
        </div>

        {/* Version Info */}
        {productData.initialVersion !== undefined && (
          <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm text-gray-600">
              Version: {productData.initialVersion} → {productData.finalVersion}
            </p>
          </div>
        )}

        {/* Duration */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Test took {result.duration || 0}ms to complete
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            E-Commerce
          </Link>
          <div className="flex gap-4">
            <Link href="/products" className="text-indigo-600 hover:text-indigo-800">
              Products
            </Link>
            <Link href="/cart" className="text-indigo-600 hover:text-indigo-800">
              Cart
            </Link>
            <Link href="/tests" className="text-indigo-600 font-bold hover:text-indigo-800">
              Tests
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Performance & Reliability Tests</h1>
          <p className="text-xl text-gray-700">
            Test the system's ability to handle concurrent requests and protect data integrity.
          </p>
        </div>

        {/* Test Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Test 1: Race Condition */}
          <div>
            <div className="bg-white p-8 rounded-lg shadow-lg mb-6 border-2 border-indigo-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🏃 Race Condition Test</h2>
              <p className="text-gray-700 mb-6">
                Tests optimistic locking with 10 concurrent requests trying to reserve the same product. Verifies that the system protects data from race conditions and maintains data integrity.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🎯</span>
                  <div>
                    <p className="font-semibold text-gray-900">NFR #1: Concurrent Data Protection</p>
                    <p className="text-sm text-gray-600">Optimistic locking prevents race conditions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <p className="font-semibold text-gray-900">10 Concurrent Requests</p>
                    <p className="text-sm text-gray-600">Each trying to reserve 1 unit of stock</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">📊</span>
                  <div>
                    <p className="font-semibold text-gray-900">Data Integrity Verification</p>
                    <p className="text-sm text-gray-600">Ensures final quantity matches expected amount</p>
                  </div>
                </div>
              </div>
              <button
                onClick={runRaceConditionTest}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-bold transition-colors"
              >
                {loading ? '⏳ Running Test...' : '▶️ Run Race Condition Test'}
              </button>
            </div>

            {raceConditionResult && <TestResultCard result={raceConditionResult} />}
          </div>

          {/* Test 2: Concurrency Control */}
          <div>
            <div className="bg-white p-8 rounded-lg shadow-lg mb-6 border-2 border-green-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">⚙️ Concurrency Control Test</h2>
              <p className="text-gray-700 mb-6">
                Simulates 100 concurrent order requests to test resource management under high load. Measures performance metrics like requests per second and verifies system stability.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🎯</span>
                  <div>
                    <p className="font-semibold text-gray-900">NFR #2: Resource Management</p>
                    <p className="text-sm text-gray-600">Thread pool pattern limits concurrent operations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <p className="font-semibold text-gray-900">100 Concurrent Requests</p>
                    <p className="text-sm text-gray-600">Simultaneous order creation requests</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">📈</span>
                  <div>
                    <p className="font-semibold text-gray-900">Performance Analysis</p>
                    <p className="text-sm text-gray-600">Throughput, response times, and system stability</p>
                  </div>
                </div>
              </div>
              <button
                onClick={runConcurrencyControlTest}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold transition-colors"
              >
                {loading ? '⏳ Running Test...' : '▶️ Run Concurrency Control Test'}
              </button>
            </div>

            {concurrencyControlResult && <TestResultCard result={concurrencyControlResult} />}
          </div>
        </div>

        {/* Analysis Section */}
        <div className="mt-12 bg-white p-8 rounded-lg shadow-lg border-l-4 border-indigo-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Test Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Race Condition Test</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span><strong>What it tests:</strong> Optimistic locking mechanism</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span><strong>Why it matters:</strong> Prevents data corruption under concurrent access</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span><strong>Success criteria:</strong> 100% success rate with correct final quantity</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span><strong>Version tracking:</strong> Each transaction increments the version number</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Concurrency Control Test</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span><strong>What it tests:</strong> Resource management under load</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span><strong>Why it matters:</strong> Ensures system stability with many simultaneous operations</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span><strong>Success criteria:</strong> High throughput with no data loss</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span><strong>Performance metric:</strong> Requests per second indicates throughput</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
