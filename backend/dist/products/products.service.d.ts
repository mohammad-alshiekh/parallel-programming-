import { Repository } from 'typeorm';
import { Product } from './product.entity';
export declare class ProductsService {
    private productsRepository;
    constructor(productsRepository: Repository<Product>);
    findAll(): Promise<Product[]>;
    findById(id: string): Promise<Product | null>;
    create(name: string, description: string, price: number, quantity: number): Promise<Product>;
    updateQuantity(productId: string, quantityToReduce: number, currentVersion: number): Promise<Product | null>;
    reserveQuantity(productId: string, quantity: number): Promise<Product | null>;
}
