# High-Performance E-Commerce System

A full-stack e-commerce application built with **NestJS** (backend) and **Next.js** (frontend), demonstrating advanced non-functional requirements including concurrent data protection, resource management, and asynchronous task processing.

## Project Structure

```
ecommerce-project/
├── backend/          # NestJS backend application
│   ├── src/
│   │   ├── auth/                    # Authentication module
│   │   ├── users/                   # User entity
│   │   ├── products/                # Products module with optimistic locking
│   │   ├── orders/                  # Orders module
│   │   ├── invoices/                # Invoice generation (async)
│   │   ├── notifications/           # Notifications (async)
│   │   ├── common/                  # Concurrency control & queue services
│   │   └── app.module.ts            # Main module
│   └── .env                         # Environment configuration
│
└── frontend/         # Next.js frontend application
    ├── app/
    │   ├── page.tsx                 # Home page
    │   ├── login/                   # Login page
    │   ├── register/                # Registration page
    │   ├── products/                # Products listing
    │   ├── cart/                    # Shopping cart
    │   └── orders/                  # Order history
    ├── lib/
    │   ├── api.ts                   # API client
    │   └── store.ts                 # Zustand state management
    └── .env.local                   # Frontend environment
```

## Key Features

### 1. **Concurrent Data Protection (NFR #1)**
- **Optimistic Locking**: Uses version column in database to detect concurrent modifications
- **Race Condition Handling**: Prevents inventory overselling when multiple users purchase simultaneously
- **Implementation**: `ProductsService.updateQuantity()` with version checking

```typescript
// Example: Prevents race condition
await this.productsRepository.update(
  { id: productId, version: currentVersion },
  { quantity: product.quantity - quantityToReduce }
);
```

### 2. **Resource Management (NFR #2)**
- **Concurrency Control**: Thread pool pattern limits simultaneous operations
- **Queue Management**: Prevents system overload with configurable max concurrency (50 operations)
- **Implementation**: `ConcurrencyControlService` with acquire/release pattern

```typescript
// Example: Limits concurrent operations
async execute<T>(fn: () => Promise<T>): Promise<T> {
  await this.acquire();
  try {
    return await fn();
  } finally {
    this.release();
  }
}
```

### 3. **Asynchronous Processing (NFR #3)**
- **Bull Queue**: Background task processing with Redis
- **Invoice Generation**: Async invoice creation after order placement
- **Notifications**: Async notification sending without blocking requests
- **Implementation**: `InvoiceProcessor` and `NotificationProcessor` with retry logic

```typescript
// Example: Queue async tasks
await this.queueService.addInvoiceGenerationTask(orderId, userId);
await this.queueService.addNotificationTask(userId, message, type);
```

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- Redis 6.0+
- npm or yarn

## Installation & Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup

Create MySQL database:
```sql
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Environment Configuration

**Backend** (backend/.env):
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=ecommerce_db

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=3600

REDIS_HOST=localhost
REDIS_PORT=6379

NODE_ENV=development
PORT=3001
```

**Frontend** (frontend/.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Start Services

**Terminal 1 - Backend**:
```bash
cd backend
npm run start:dev
# Backend running on http://localhost:3001
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# Frontend running on http://localhost:3000
```

**Terminal 3 - Redis** (if not running as service):
```bash
redis-server
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `POST /products` - Create product (admin)
- `POST /products/:id/reserve` - Reserve product quantity

### Orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details
- `GET /orders/user/:userId` - Get user orders

## Testing Concurrent Data Protection

1. Register two users
2. Create a product with limited quantity (e.g., 5 units)
3. Have both users simultaneously try to purchase more than available
4. System will prevent overselling using optimistic locking

## Monitoring

### Queue Status
Access queue statistics via:
```bash
curl http://localhost:3001/queue/stats
```

### Concurrency Stats
Monitor active operations:
```bash
curl http://localhost:3001/concurrency/stats
```

## Architecture Highlights

### Database Schema
- **Users**: User authentication and profile
- **Products**: Product catalog with version column for optimistic locking
- **Orders**: Customer orders with JSON items array
- **Invoices**: Generated invoices for orders

### Technology Stack
- **Backend**: NestJS, TypeORM, JWT, Passport, Bull, Redis
- **Frontend**: Next.js, React, Zustand, Axios, Tailwind CSS
- **Database**: MySQL
- **Message Queue**: Bull (Redis-backed)

## Performance Considerations

1. **Optimistic Locking**: Reduces database locks, improves concurrency
2. **Thread Pool**: Prevents resource exhaustion under high load
3. **Async Queues**: Decouples long-running tasks from request cycle
4. **Connection Pooling**: Efficient database connection management

## Troubleshooting

### Redis Connection Error
```bash
# Ensure Redis is running
redis-cli ping
# Should return: PONG
```

### Database Connection Error
```bash
# Verify MySQL is running and credentials are correct
mysql -u root -p -e "SELECT 1;"
```

### Port Already in Use
```bash
# Change PORT in .env files
# Backend: PORT=3002
# Frontend: PORT=3001
```

## License

MIT
