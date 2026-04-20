#!/bin/bash

echo "🚀 E-Commerce System Setup Script"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Start Docker containers
echo "📦 Starting Docker containers..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Install backend dependencies
echo "📚 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📚 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Terminal 1 - Start backend:  cd backend && npm run start:dev"
echo "2. Terminal 2 - Start frontend: cd frontend && npm run dev"
echo "3. Terminal 3 - View logs:      docker-compose logs -f"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "🛑 To stop services: docker-compose down"
