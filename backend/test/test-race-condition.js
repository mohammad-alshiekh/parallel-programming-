const axios = require('axios');

const API_URL = 'http://localhost:3001';
const client = axios.create({ baseURL: API_URL });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testRaceCondition() {
  try {
    console.log('==================== request 1 ====================');

    const productResponse = await client.post('/products', {
      name: `Test Product ${Date.now()}`,
      description: 'Product for race condition testing',
      price: 100,
      quantity: 10
    });

    const productId = productResponse.data.id;
    const initialVersion = productResponse.data.version;
    const initialQuantity = productResponse.data.quantity;

     console.log('==================== request 2 ====================');
    const concurrentRequests = Array(10).fill(null).map((_, index) =>
      client.post(`/products/${productId}/reserve`, {
        quantity: 1
      }).then(response => ({
        success: true,
        index: index + 1,
        newQuantity: response.data.quantity,
        newVersion: response.data.version,
        message: 'تم الشراء بنجاح'
      })).catch(error => ({
        success: false,
        index: index + 1,
        message: error.response?.data?.message || error.message,
        status: error.response?.status
      }))
    );

    const results = await Promise.all(concurrentRequests);


    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    successful.forEach(r => {
     console.log('green', ` ========= success  Attempt ${r.index}: ${r.message} - الكمية المتبقية: ${r.newQuantity}, الإصدار الجديد: ${r.newVersion}`);
    });

    if (failed.length > 0) {
      failed.forEach(r => {
        console.log('red', ` ===== error Attempt ${r.index}: ${r.message}`);
      });
    }

 
    const finalProduct = await client.get(`/products/${productId}`);
    const finalQuantity = finalProduct.data.quantity;
    const finalVersion = finalProduct.data.version;

    const expectedQuantity = initialQuantity - successful.length;

    if (finalQuantity === expectedQuantity && finalQuantity >= 0) {
      return true;
    } else {
      return false;
    }

  } catch (error) {
    return false;
  }
}

testRaceCondition().then(success => {
  process.exit(success ? 0 : 1);
});
