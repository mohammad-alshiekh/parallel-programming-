/**
 * اختبار Race Condition و Optimistic Locking
 * NFR #1: Concurrent Data Protection
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
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testRaceCondition() {
  try {
    log('cyan', '\n🧪 اختبار Race Condition و Optimistic Locking\n');

    // 1. إنشاء منتج اختباري
    log('yellow', '📦 الخطوة 1: إنشاء منتج اختباري...');
    const productResponse = await client.post('/products', {
      name: `Test Product ${Date.now()}`,
      description: 'Product for race condition testing',
      price: 100,
      quantity: 10
    });

    const productId = productResponse.data.id;
    const initialVersion = productResponse.data.version;
    const initialQuantity = productResponse.data.quantity;

    log('green', `✅ تم إنشاء المنتج:`);
    log('blue', `   ID: ${productId}`);
    log('blue', `   الكمية الأولية: ${initialQuantity}`);
    log('blue', `   الإصدار الأول: ${initialVersion}`);

    // 2. محاكاة Race Condition
    log('yellow', '\n🏃 الخطوة 2: محاكاة Race Condition (10 طلبات متزامنة)...');

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

    // 3. تحليل النتائج
    log('yellow', '\n📊 الخطوة 3: تحليل النتائج...\n');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    log('green', `✅ الطلبات الناجحة: ${successful.length}`);
    log('red', `❌ الطلبات الفاشلة: ${failed.length}`);

    log('blue', '\n📝 تفاصيل الطلبات الناجحة:');
    successful.forEach(r => {
      log('green', `  ✅ Attempt ${r.index}: الكمية = ${r.newQuantity}, الإصدار = ${r.newVersion}`);
    });

    if (failed.length > 0) {
      log('blue', '\n📝 تفاصيل الطلبات الفاشلة:');
      failed.forEach(r => {
        log('red', `  ❌ Attempt ${r.index}: ${r.message}`);
      });
    }

    // 4. التحقق من الكمية النهائية
    log('yellow', '\n🔍 الخطوة 4: التحقق من الكمية النهائية...');

    const finalProduct = await client.get(`/products/${productId}`);
    const finalQuantity = finalProduct.data.quantity;
    const finalVersion = finalProduct.data.version;

    const expectedQuantity = initialQuantity - successful.length;

    log('blue', `   الكمية المتوقعة: ${expectedQuantity}`);
    log('blue', `   الكمية الفعلية: ${finalQuantity}`);
    log('blue', `   الإصدار النهائي: ${finalVersion}`);

    // 5. النتيجة النهائية
    log('yellow', '\n✨ النتيجة النهائية:\n');

    if (finalQuantity === expectedQuantity && finalQuantity >= 0) {
      log('green', '✅ ✅ ✅ النظام يحمي البيانات من التضارب بنجاح!');
      log('green', `   - لم تحدث خسارة في البيانات`);
      log('green', `   - الكمية صحيحة: ${finalQuantity} = ${initialQuantity} - ${successful.length}`);
      log('green', `   - الإصدار يزداد مع كل تحديث: ${initialVersion} → ${finalVersion}`);
      return true;
    } else {
      log('red', '❌ ❌ ❌ حدثت مشكلة في حماية البيانات!');
      log('red', `   - الكمية المتوقعة: ${expectedQuantity}`);
      log('red', `   - الكمية الفعلية: ${finalQuantity}`);
      return false;
    }

  } catch (error) {
    log('red', `\n❌ خطأ في الاختبار: ${error.message}`);
    return false;
  }
}

// تشغيل الاختبار
testRaceCondition().then(success => {
  process.exit(success ? 0 : 1);
});
