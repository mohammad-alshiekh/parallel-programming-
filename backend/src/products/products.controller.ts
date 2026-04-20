import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: { name: string; description: string; price: number; quantity: number }) {
    return this.productsService.create(body.name, body.description, body.price, body.quantity);
  }

  @Post(':id/reserve')
  @UseGuards(JwtAuthGuard)
  async reserve(@Param('id') id: string, @Body() body: { quantity: number }) {
    return this.productsService.reserveQuantity(id, body.quantity);
  }
}
