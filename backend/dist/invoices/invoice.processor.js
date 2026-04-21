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
exports.InvoiceProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const invoice_entity_1 = require("./invoice.entity");
const order_entity_1 = require("../orders/order.entity");
let InvoiceProcessor = class InvoiceProcessor {
    invoiceRepository;
    orderRepository;
    constructor(invoiceRepository, orderRepository) {
        this.invoiceRepository = invoiceRepository;
        this.orderRepository = orderRepository;
    }
    async generateInvoice(job) {
        const { orderId, userId } = job.data;
        try {
            const order = await this.orderRepository.findOne({ where: { id: orderId } });
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }
            const invoiceContent = `
        INVOICE
        -------
        Order ID: ${orderId}
        User ID: ${userId}
        Total Amount: $${order.totalAmount}
        Items: ${JSON.stringify(order.items)}
        Generated at: ${new Date().toISOString()}
      `;
            const invoice = this.invoiceRepository.create({
                orderId,
                userId,
                content: invoiceContent,
                status: 'generated',
            });
            await this.invoiceRepository.save(invoice);
            await this.orderRepository.update(orderId, { invoiceId: invoice.id });
            return { success: true, invoiceId: invoice.id };
        }
        catch (error) {
            console.error('Invoice generation failed:', error);
            throw error;
        }
    }
};
exports.InvoiceProcessor = InvoiceProcessor;
__decorate([
    (0, bull_1.Process)('generate-invoice'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoiceProcessor.prototype, "generateInvoice", null);
exports.InvoiceProcessor = InvoiceProcessor = __decorate([
    (0, bull_1.Processor)('invoices'),
    __param(0, (0, typeorm_2.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_2.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository])
], InvoiceProcessor);
//# sourceMappingURL=invoice.processor.js.map