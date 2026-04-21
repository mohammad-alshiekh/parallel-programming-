
const axios = require('axios');

const API_URL = 'http://localhost:3001';
const client = axios.create({ baseURL: API_URL });


const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testConcurrencyControl() {
  try {
    
    const productResponse = await client.post('/products', {
      name: `Concurrency Test Product ${Date.now()}`,
      description: 'Product for concurrency testing',
      price: 50,
      quantity: 1000
    });

    const productId = productResponse.data.id;

    const token = localStorage.getItem('token');
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const startTime = Date.now();
    const concurrentRequests = Array(100).fill(null).map((_, index) =>
      client.post('/orders', {
        items: [{ productId, quantity: 1 }]
      }).then(response => ({
        success: true,
        index: index + 1,
        orderId: response.data.id,
        time: Date.now() - startTime,
        status: 200
      })).catch(error => ({
        success: false,
        index: index + 1,
        time: Date.now() - startTime,
        message: error.response?.data?.message || error.message,
        status: error.response?.status || 0
      }))
    );

    const results = await Promise.all(concurrentRequests);
    const totalTime = Date.now() - startTime;

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    
    const times = successful.map(r => r.time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

  
    const requestsPerSecond = (successful.length / (totalTime / 1000)).toFixed(2);

    const finalProduct = await client.get(`/products/${productId}`);
    const finalQuantity = finalProduct.data.quantity;
    const expectedQuantity = 1000 - successful.length;

    const successRate = (successful.length / 100) * 100;
    const isStable = successful.length === 100 && finalQuantity === expectedQuantity;

    if (isStable && successRate === 100) {
      return true;
    } else if (successRate >= 95) {
      return false;
    } else {
      return false;
    }

  } catch (error) {
    return false;
  }
}

testConcurrencyControl().then(success => {
  process.exit(success ? 0 : 1);
});
