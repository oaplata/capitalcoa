#!/bin/bash

# CapitalCoa Setup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js version: $(node -v)"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npm run prisma:generate
    
    print_success "Backend setup completed!"
    cd ..
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Start Docker services
    print_status "Starting Docker services..."
    ./scripts/docker.sh start
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Run migrations
    print_status "Running database migrations..."
    cd backend
    npm run prisma:migrate
    cd ..
    
    print_success "Database setup completed!"
}

# Main setup function
main() {
    print_status "Starting CapitalCoa setup..."
    
    # Check prerequisites
    check_docker
    check_node
    
    # Setup backend
    setup_backend
    
    # Setup database
    setup_database
    
    print_success "CapitalCoa setup completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "  1. Start the backend: cd backend && npm run start:dev"
    echo "  2. Access the API: http://localhost:3000"
    echo "  3. View API docs: http://localhost:3000/api/docs"
    echo "  4. Access pgAdmin: http://localhost:5050 (admin@capitalcoa.com / admin123)"
    echo ""
    print_status "Happy coding! 🚀"
}

# Run main function
main 