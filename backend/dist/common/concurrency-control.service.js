"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcurrencyControlService = void 0;
const common_1 = require("@nestjs/common");
let ConcurrencyControlService = class ConcurrencyControlService {
    activeOperations = 0;
    maxConcurrency = 50;
    waitQueue = [];
    async acquire() {
        if (this.activeOperations < this.maxConcurrency) {
            this.activeOperations++;
            return;
        }
        return new Promise((resolve) => {
            this.waitQueue.push(() => {
                this.activeOperations++;
                resolve();
            });
        });
    }
    release() {
        this.activeOperations--;
        const next = this.waitQueue.shift();
        if (next) {
            next();
        }
    }
    async execute(fn) {
        await this.acquire();
        try {
            return await fn();
        }
        finally {
            this.release();
        }
    }
    getStats() {
        return {
            activeOperations: this.activeOperations,
            maxConcurrency: this.maxConcurrency,
            queueLength: this.waitQueue.length,
        };
    }
};
exports.ConcurrencyControlService = ConcurrencyControlService;
exports.ConcurrencyControlService = ConcurrencyControlService = __decorate([
    (0, common_1.Injectable)()
], ConcurrencyControlService);
//# sourceMappingURL=concurrency-control.service.js.map