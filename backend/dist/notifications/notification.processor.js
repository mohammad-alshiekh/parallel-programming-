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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationProcessor = void 0;
const bull_1 = require("@nestjs/bull");
let NotificationProcessor = class NotificationProcessor {
    async sendNotification(job) {
        const { userId, message, type } = job.data;
        try {
            console.log(`[NOTIFICATION] Sending ${type} to user ${userId}: ${message}`);
            return { success: true, userId, type };
        }
        catch (error) {
            console.error('Notification sending failed:', error);
            throw error;
        }
    }
};
exports.NotificationProcessor = NotificationProcessor;
__decorate([
    (0, bull_1.Process)('send-notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationProcessor.prototype, "sendNotification", null);
exports.NotificationProcessor = NotificationProcessor = __decorate([
    (0, bull_1.Processor)('notifications')
], NotificationProcessor);
//# sourceMappingURL=notification.processor.js.map