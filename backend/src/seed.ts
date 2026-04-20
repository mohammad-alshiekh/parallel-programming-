import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './products/product.entity';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const productRepository = app.get<Repository<Product>>('ProductRepository');

  const products = [
    {
      name: 'Laptop Pro',
      description: 'High-performance laptop for professionals',
      price: 1299.99,
      quantity: 50,
    },
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with long battery life',
      price: 29.99,
      quantity: 200,
    },
    {
      name: 'USB-C Cable',
      description: 'Fast charging USB-C cable',
      price: 9.99,
      quantity: 500,
    },
    {
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with custom switches',
      price: 149.99,
      quantity: 75,
    },
    {
      name: '4K Monitor',
      description: '27-inch 4K IPS monitor',
      price: 399.99,
      quantity: 30,
    },
  ];

  console.log('🌱 Seeding database...');

  for (const product of products) {
    const existing = await productRepository.findOne({ where: { name: product.name } });
    if (!existing) {
      await productRepository.save(productRepository.create(product));
      console.log(`✅ Created product: ${product.name}`);
    }
  }

  console.log('✨ Database seeding completed!');
  await app.close();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
