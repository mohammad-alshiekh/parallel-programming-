import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bull';
import { databaseConfig } from './database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtStrategy } from './auth/jwt.strategy';
import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { Order } from './orders/order.entity';
import { Invoice } from './invoices/invoice.entity';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { OrdersService } from './orders/orders.service';
import { OrdersController } from './orders/orders.controller';
import { ConcurrencyControlService } from './common/concurrency-control.service';
import { QueueService } from './common/queue.service';
import { InvoiceProcessor } from './invoices/invoice.processor';
import { NotificationProcessor } from './notifications/notification.processor';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([User, Product, Order, Invoice]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      signOptions: { expiresIn: '24h' },
    }),
    PassportModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue(
      { name: 'invoices' },
      { name: 'notifications' },
    ),
  ],
  controllers: [AppController, AuthController, ProductsController, OrdersController],
  providers: [
    AppService,
    AuthService,
    JwtStrategy,
    ProductsService,
    OrdersService,
    ConcurrencyControlService,
    QueueService,
    InvoiceProcessor,
    NotificationProcessor,
  ],
})
export class AppModule {}
