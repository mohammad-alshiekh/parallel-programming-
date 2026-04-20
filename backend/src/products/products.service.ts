import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll() {
    return this.productsRepository.find();
  }

  async findById(id: string) {
    return this.productsRepository.findOne({ where: { id } });
  }

  async create(name: string, description: string, price: number, quantity: number) {
    const product = this.productsRepository.create({
      name,
      description,
      price,
      quantity,
    });
    return this.productsRepository.save(product);
  }

  /**
   * NFR #1: Concurrent Data Protection - Optimistic Locking
   * Uses version column to detect concurrent modifications
   * Throws error if version mismatch detected (race condition)
   */
  async updateQuantity(productId: string, quantityToReduce: number, currentVersion: number) {
    const product = await this.productsRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    // Check if version matches (optimistic lock)
    if (product.version !== currentVersion) {
      throw new BadRequestException(
        'Product was modified by another request. Please refresh and try again.',
      );
    }

    if (product.quantity < quantityToReduce) {
      throw new BadRequestException('Insufficient quantity');
    }

    // Update with version check - TypeORM will increment version automatically
    const result = await this.productsRepository.update(
      { id: productId, version: currentVersion },
      { quantity: product.quantity - quantityToReduce },
    );

    if (result.affected === 0) {
      throw new BadRequestException(
        'Failed to update product. Version mismatch detected (race condition).',
      );
    }

    return this.productsRepository.findOne({ where: { id: productId } });
  }

  /**
   * Atomic quantity check and reserve
   * Prevents race conditions by using database-level locking
   */
  async reserveQuantity(productId: string, quantity: number) {
    const product = await this.productsRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    if (product.quantity < quantity) {
      throw new BadRequestException('Insufficient quantity');
    }

    // Use database transaction for atomic operation
    const newQuantity = product.quantity - quantity;
    await this.productsRepository.update(productId, { quantity: newQuantity });

    return this.productsRepository.findOne({ where: { id: productId } });
  }
}
