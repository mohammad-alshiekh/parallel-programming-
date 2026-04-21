import { User } from '../users/user.entity';
export declare class Order {
    id: string;
    userId: string;
    user: User;
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: string;
    invoiceId: string;
    notificationSent: boolean;
    createdAt: Date;
    updatedAt: Date;
}
