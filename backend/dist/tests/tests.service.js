"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../products/product.entity");
const user_entity_1 = require("../users/user.entity");
const order_entity_1 = require("../orders/order.entity");
const products_service_1 = require("../products/products.service");
const orders_service_1 = require("../orders/orders.service");
let TestsService = class TestsService {
    productRepository;
    userRepository;
    orderRepository;
    productsService;
    ordersService;
    constructor(productRepository, userRepository, orderRepository, productsService, ordersService) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.productsService = productsService;
        this.ordersService = ordersService;
    }
    async testRaceCondition() {
        const startTime = Date.now();
        const results = {
            name: 'Race Condition & Optimistic Locking Test',
            description: 'Tests concurrent data protection with optimistic locking',
            nfr: 'NFR #1: Concurrent Data Protection',
            startTime,
            endTime: 0,
            duration: 0,
            steps: [],
            metrics: {
                successful: 0,
                failed: 0,
                successRate: 0,
                totalRequests: 10,
            },
            productData: {
                initialQuantity: 0,
                finalQuantity: 0,
                expectedQuantity: 0,
                isCorrect: false,
                initialVersion: 0,
                finalVersion: 0,
            },
            status: 'PASSED',
            message: '',
        };
        try {
            results.steps.push({
                step: 1,
                description: '📦 Creating test product...',
                status: 'running',
            });
            const product = await this.productsService.create(`Race Condition Test ${Date.now()}`, 'Product for race condition testing', 100, 10);
            results.steps[0].status = 'completed';
            results.productData.initialQuantity = product.quantity;
            results.productData.initialVersion = product.version;
            results.steps.push({
                step: 2,
                description: '🏃 Simulating 10 concurrent reserve requests...',
                status: 'running',
            });
            const concurrentRequests = Array(10)
                .fill(null)
                .map(() => this.productsService.updateQuantity(product.id, 1, product.version)
                .then(() => ({ error: false }))
                .catch(() => ({ error: true })));
            const reserveResults = await Promise.all(concurrentRequests);
            const successful = reserveResults.filter((r) => !r.error);
            const failed = reserveResults.filter((r) => r.error);
            results.steps[1].status = 'completed';
            results.metrics.successful = successful.length;
            results.metrics.failed = failed.length;
            results.metrics.successRate = (successful.length / 10) * 100;
            results.steps.push({
                step: 3,
                description: '🔍 Verifying final quantity...',
                status: 'running',
            });
            const finalProduct = await this.productRepository.findOne({
                where: { id: product.id },
            });
            results.steps[2].status = 'completed';
            if (finalProduct) {
                results.productData.finalQuantity = finalProduct.quantity;
                results.productData.expectedQuantity = 10 - successful.length;
                results.productData.isCorrect =
                    finalProduct.quantity === results.productData.expectedQuantity &&
                        finalProduct.quantity >= 0;
                results.productData.finalVersion = finalProduct.version;
            }
            else {
                throw new Error('Product not found after test');
            }
            if (results.productData.isCorrect &&
                results.metrics.successRate === 100) {
                results.status = 'PASSED';
                results.message =
                    '✅ System protects data from race conditions successfully!';
            }
            else if (results.metrics.successRate >= 95) {
                results.status = 'WARNING';
                results.message =
                    '⚠️ System works but may have minor issues with data consistency';
            }
            else {
                results.status = 'FAILED';
                results.message =
                    '❌ Data protection failed! Race condition detected.';
            }
        }
        catch (error) {
            results.status = 'ERROR';
            results.message = `Error during test: ${error?.message || 'Unknown error'}`;
            results.steps.push({
                step: -1,
                description: '❌ Test Error',
                status: 'failed',
            });
        }
        results.endTime = Date.now();
        results.duration = results.endTime - results.startTime;
        return results;
    }
    async testConcurrencyControl() {
        const startTime = Date.now();
        const results = {
            name: 'Concurrency Control & Resource Management Test',
            description: 'Tests resource management under high concurrent load',
            nfr: 'NFR #2: Resource Management',
            startTime,
            endTime: 0,
            duration: 0,
            steps: [],
            metrics: {
                successful: 0,
                failed: 0,
                successRate: 0,
                totalRequests: 100,
                minTime: 0,
                maxTime: 0,
                avgTime: 0,
                requestsPerSecond: 0,
            },
            productData: {
                initialQuantity: 0,
                finalQuantity: 0,
                expectedQuantity: 0,
                isCorrect: false,
            },
            status: 'PASSED',
            message: '',
        };
        try {
            results.steps.push({
                step: 1,
                description: '📦 Creating test product with 1000 units...',
                status: 'running',
            });
            const product = await this.productsService.create(`Concurrency Test ${Date.now()}`, 'Product for concurrency testing', 50, 1000);
            results.productData.initialQuantity = product.quantity;
            results.steps[0].status = 'completed';
            results.steps.push({
                step: 2,
                description: '👤 Creating test user...',
                status: 'running',
            });
            const user = await this.userRepository.save({
                email: `test${Date.now()}@example.com`,
                password: 'hashed_password',
                firstName: 'Test',
                lastName: 'User',
            });
            results.steps[1].status = 'completed';
            results.steps.push({
                step: 3,
                description: '⚡ Simulating 100 concurrent order requests...',
                status: 'running',
            });
            const requestStartTime = Date.now();
            const concurrentOrders = Array(100)
                .fill(null)
                .map(() => this.ordersService
                .createOrder(user.id, [{ productId: product.id, quantity: 1 }])
                .then(() => ({
                success: true,
                time: Date.now() - requestStartTime,
            }))
                .catch(() => ({
                success: false,
                time: Date.now() - requestStartTime,
            })));
            const orderResults = await Promise.all(concurrentOrders);
            const successful = orderResults.filter((r) => r.success);
            const failed = orderResults.filter((r) => !r.success);
            const totalTime = Date.now() - requestStartTime;
            results.steps[2].status = 'completed';
            results.metrics.successful = successful.length;
            results.metrics.failed = failed.length;
            results.metrics.successRate = (successful.length / 100) * 100;
            const times = successful.map((r) => r.time);
            if (times.length > 0) {
                results.metrics.minTime = Math.min(...times);
                results.metrics.maxTime = Math.max(...times);
                results.metrics.avgTime = times.reduce((a, b) => a + b, 0) / times.length;
                results.metrics.requestsPerSecond = +((successful.length / (totalTime / 1000))).toFixed(2);
            }
            results.steps.push({
                step: 4,
                description: '🔍 Verifying final product quantity...',
                status: 'running',
            });
            const finalProduct = await this.productRepository.findOne({
                where: { id: product.id },
            });
            if (finalProduct) {
                results.productData.finalQuantity = finalProduct.quantity;
                results.productData.expectedQuantity =
                    product.quantity - successful.length;
                results.productData.isCorrect =
                    finalProduct.quantity === results.productData.expectedQuantity;
            }
            else {
                throw new Error('Product not found after test');
            }
            results.steps[3].status = 'completed';
            if (results.productData.isCorrect &&
                results.metrics.successRate === 100) {
                results.status = 'PASSED';
                results.message =
                    '✅ System manages resources successfully under concurrent load!';
            }
            else if (results.metrics.successRate >= 95) {
                results.status = 'WARNING';
                results.message =
                    '⚠️ System works but some requests failed under load';
            }
            else {
                results.status = 'FAILED';
                results.message =
                    '❌ Resource management failed under concurrent load!';
            }
        }
        catch (error) {
            results.status = 'ERROR';
            results.message = `Error during test: ${error?.message || 'Unknown error'}`;
            results.steps.push({
                step: -1,
                description: '❌ Test Error',
                status: 'failed',
            });
        }
        results.endTime = Date.now();
        results.duration = results.endTime - results.startTime;
        return results;
    }
};
exports.TestsService = TestsService;
exports.TestsService = TestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        products_service_1.ProductsService,
        orders_service_1.OrdersService])
], TestsService);
//# sourceMappingURL=tests.service.js.map