"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const bull_1 = require("@nestjs/bull");
const database_config_1 = require("./database.config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_service_1 = require("./auth/auth.service");
const auth_controller_1 = require("./auth/auth.controller");
const jwt_strategy_1 = require("./auth/jwt.strategy");
const user_entity_1 = require("./users/user.entity");
const product_entity_1 = require("./products/product.entity");
const order_entity_1 = require("./orders/order.entity");
const invoice_entity_1 = require("./invoices/invoice.entity");
const products_service_1 = require("./products/products.service");
const products_controller_1 = require("./products/products.controller");
const orders_service_1 = require("./orders/orders.service");
const orders_controller_1 = require("./orders/orders.controller");
const concurrency_control_service_1 = require("./common/concurrency-control.service");
const queue_service_1 = require("./common/queue.service");
const invoice_processor_1 = require("./invoices/invoice.processor");
const notification_processor_1 = require("./notifications/notification.processor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot(database_config_1.databaseConfig),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, product_entity_1.Product, order_entity_1.Order, invoice_entity_1.Invoice]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
                signOptions: { expiresIn: '24h' },
            }),
            passport_1.PassportModule,
            bull_1.BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                },
            }),
            bull_1.BullModule.registerQueue({ name: 'invoices' }, { name: 'notifications' }),
        ],
        controllers: [app_controller_1.AppController, auth_controller_1.AuthController, products_controller_1.ProductsController, orders_controller_1.OrdersController],
        providers: [
            app_service_1.AppService,
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            products_service_1.ProductsService,
            orders_service_1.OrdersService,
            concurrency_control_service_1.ConcurrencyControlService,
            queue_service_1.QueueService,
            invoice_processor_1.InvoiceProcessor,
            notification_processor_1.NotificationProcessor,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map