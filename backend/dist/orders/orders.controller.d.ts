import { OrdersService } from './orders.service';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    create(req: any, body: {
        items: Array<{
            productId: string;
            quantity: number;
        }>;
    }): Promise<import("./order.entity").Order>;
    findById(id: string): Promise<import("./order.entity").Order | null>;
    findByUserId(userId: string): Promise<import("./order.entity").Order[]>;
}
