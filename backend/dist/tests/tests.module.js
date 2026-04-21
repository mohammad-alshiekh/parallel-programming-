"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tests_controller_1 = require("./tests.controller");
const tests_service_1 = require("./tests.service");
const product_entity_1 = require("../products/product.entity");
const user_entity_1 = require("../users/user.entity");
const order_entity_1 = require("../orders/order.entity");
let TestsModule = class TestsModule {
};
exports.TestsModule = TestsModule;
exports.TestsModule = TestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([product_entity_1.Product, user_entity_1.User, order_entity_1.Order]),
        ],
        controllers: [tests_controller_1.TestsController],
        providers: [tests_service_1.TestsService],
    })
], TestsModule);
//# sourceMappingURL=tests.module.js.map