export async function GET(request: Request, { params }: { params: Promise<{ test: string }> }) {
  const { test } = await params;
  const token = request.headers.get('authorization');

  if (!token) {
    console.log('[Tests API] No authorization token provided');
    return new Response(
      JSON.stringify({
        status: 'ERROR',
        message: 'Unauthorized - No token provided',
        error: 'Missing authorization header',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const testEndpoint = test === 'race-condition' ? 'race-condition' : 'concurrency-control';
    const url = `${backendUrl}/tests/${testEndpoint}`;
    
    console.log(`[Tests API] Calling backend: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[Tests API] Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.log(`[Tests API] Backend error: ${errorData}`);
      throw new Error(`Backend returned ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    console.log(`[Tests API] Test completed with status: ${data.status}`);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('[Tests API] Error:', error);
    return new Response(
      JSON.stringify({
        status: 'ERROR',
        message: `Failed to run test: ${error.message}`,
        name: 'Test',
        description: '',
        nfr: '',
        startTime: Date.now(),
        endTime: Date.now(),
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
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
