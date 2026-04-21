/**
 * اختبار إدارة الموارد و Concurrency Control
 * NFR #2: Resource Management
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001';
const client = axios.create({ baseURL: API_URL });

// ألوان للطباعة
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
    log('cyan', '\n🧪 اختبار إدارة الموارد و Concurrency Control\n');

    // 1. إنشاء منتج اختباري
    log('yellow', '📦 الخطوة 1: إنشاء منتج اختباري...');
    const productResponse = await client.post('/products', {
      name: `Concurrency Test Product ${Date.now()}`,
      description: 'Product for concurrency testing',
      price: 50,
      quantity: 1000
    });

    const productId = productResponse.data.id;
    log('green', `✅ تم إنشاء المنتج: ${productId}`);

    // 2. إنشاء مستخدم اختباري
    log('yellow', '\n👤 الخطوة 2: إنشاء مستخدم اختباري...');
    const userResponse = await client.post('/auth/register', {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });

    log('green', `✅ تم إنشاء المستخدم`);

    // 3. تسجيل الدخول
    log('yellow', '\n🔐 الخطوة 3: تسجيل الدخول...');
    const loginResponse = await client.post('/auth/login', {
      email: userResponse.data.email,
      password: 'password123'
    });

    const token = loginResponse.data.access_token;
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    log('green', `✅ تم تسجيل الدخول`);

    // 4. محاكاة ضغط عالي
    log('yellow', '\n⚡ الخطوة 4: محاكاة 100 طلب متزامن...');

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

    // 5. تحليل النتائج
    log('yellow', '\n📊 الخطوة 5: تحليل النتائج...\n');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    log('green', `✅ الطلبات الناجحة: ${successful.length}/100`);
    log('red', `❌ الطلبات الفاشلة: ${failed.length}/100`);

    // إحصائيات الوقت
    const times = successful.map(r => r.time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

    log('blue', `\n⏱️ إحصائيات الوقت:`);
    log('blue', `   - الوقت الأقل: ${minTime}ms`);
    log('blue', `   - الوقت الأكثر: ${maxTime}ms`);
    log('blue', `   - المتوسط: ${avgTime.toFixed(2)}ms`);
    log('blue', `   - الوقت الإجمالي: ${totalTime}ms`);

    // معدل الطلبات
    const requestsPerSecond = (successful.length / (totalTime / 1000)).toFixed(2);
    log('magenta', `\n📈 معدل الطلبات: ${requestsPerSecond} طلب/ثانية`);

    // 6. التحقق من الاستقرار
    log('yellow', '\n🔍 الخطوة 6: التحقق من استقرار النظام...');

    const finalProduct = await client.get(`/products/${productId}`);
    const finalQuantity = finalProduct.data.quantity;
    const expectedQuantity = 1000 - successful.length;

    log('blue', `   الكمية المتبقية: ${finalQuantity}`);
    log('blue', `   الكمية المتوقعة: ${expectedQuantity}`);

    // 7. النتيجة النهائية
    log('yellow', '\n✨ النتيجة النهائية:\n');

    const successRate = (successful.length / 100) * 100;
    const isStable = successful.length === 100 && finalQuantity === expectedQuantity;

    if (isStable && successRate === 100) {
      log('green', '✅ ✅ ✅ النظام يدير الموارد بنجاح!');
      log('green', `   - معدل النجاح: 100%`);
      log('green', `   - لا توجد أخطاء`);
      log('green', `   - الكمية صحيحة`);
      log('green', `   - النظام مستقر تحت الضغط`);
      log('green', `   - معدل الطلبات: ${requestsPerSecond} طلب/ثانية`);
      return true;
    } else if (successRate >= 95) {
      log('yellow', '⚠️ النظام يعمل لكن قد يكون هناك مشاكل طفيفة');
      log('yellow', `   - معدل النجاح: ${successRate.toFixed(1)}%`);
      log('yellow', `   - الطلبات الفاشلة: ${failed.length}`);
      return false;
    } else {
      log('red', '❌ ❌ ❌ حدثت مشكلة في إدارة الموارد!');
      log('red', `   - معدل النجاح: ${successRate.toFixed(1)}%`);
      log('red', `   - الطلبات الفاشلة: ${failed.length}`);
      return false;
    }

  } catch (error) {
    log('red', `\n❌ خطأ في الاختبار: ${error.message}`);
    if (error.response) {
      log('red', `   Status: ${error.response.status}`);
      log('red', `   Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// تشغيل الاختبار
testConcurrencyControl().then(success => {
  process.exit(success ? 0 : 1);
});
