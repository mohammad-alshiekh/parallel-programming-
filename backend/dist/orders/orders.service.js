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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const order_entity_1 = require("./order.entity");
const product_entity_1 = require("../products/product.entity");
const concurrency_control_service_1 = require("../common/concurrency-control.service");
const queue_service_1 = require("../common/queue.service");
let OrdersService = class OrdersService {
    ordersRepository;
    productsRepository;
    concurrencyControl;
    queueService;
    constructor(ordersRepository, productsRepository, concurrencyControl, queueService) {
        this.ordersRepository = ordersRepository;
        this.productsRepository = productsRepository;
        this.concurrencyControl = concurrencyControl;
        this.queueService = queueService;
    }
    async createOrder(userId, items) {
        return this.concurrencyControl.execute(async () => {
            let totalAmount = 0;
            const orderItems = [];
            for (const item of items) {
                const product = await this.productsRepository.findOne({
                    where: { id: item.productId },
                });
                if (!product) {
                    throw new common_1.BadRequestException(`Product ${item.productId} not found`);
                }
                if (product.quantity < item.quantity) {
                    throw new common_1.BadRequestException(`Insufficient quantity for product ${product.name}. Available: ${product.quantity}`);
                }
                totalAmount += product.price * item.quantity;
                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price,
                });
            }
            const order = this.ordersRepository.create({
                userId,
                items: orderItems,
                totalAmount,
                status: 'pending',
            });
            const savedOrder = await this.ordersRepository.save(order);
            for (const item of items) {
                const product = await this.productsRepository.findOne({
                    where: { id: item.productId },
                });
                if (product) {
                    await this.productsRepository.update(item.productId, {
                        quantity: product.quantity - item.quantity,
                    });
                }
            }
            await this.queueService.addInvoiceGenerationTask(savedOrder.id, userId);
            await this.queueService.addNotificationTask(userId, `Your order ${savedOrder.id} has been created`, 'order_created');
            return savedOrder;
        });
    }
    async findById(id) {
        return this.ordersRepository.findOne({ where: { id } });
    }
    async findByUserId(userId) {
        return this.ordersRepository.find({ where: { userId } });
    }
    async updateStatus(id, status) {
        await this.ordersRepository.update(id, { status });
        return this.ordersRepository.findOne({ where: { id } });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_2.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        concurrency_control_service_1.ConcurrencyControlService,
        queue_service_1.QueueService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map