import { ProductsService } from './products.service';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    findAll(): Promise<import("./product.entity").Product[]>;
    findById(id: string): Promise<import("./product.entity").Product | null>;
    create(body: {
        name: string;
        description: string;
        price: number;
        quantity: number;
    }): Promise<import("./product.entity").Product>;
    reserve(id: string, body: {
        quantity: number;
    }): Promise<import("./product.entity").Product | null>;
}
