#!/bin/bash

# CapitalCoa Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to start services
start() {
    print_status "Starting CapitalCoa services..."
    check_docker
    
    docker-compose up -d
    
    print_success "Services started successfully!"
    print_status "PostgreSQL: localhost:5432"
    print_status "Redis: localhost:6379"
    print_status "pgAdmin: http://localhost:5050 (admin@capitalcoa.com / admin123)"
}

# Function to stop services
stop() {
    print_status "Stopping CapitalCoa services..."
    docker-compose down
    print_success "Services stopped successfully!"
}

# Function to restart services
restart() {
    print_status "Restarting CapitalCoa services..."
    docker-compose down
    docker-compose up -d
    print_success "Services restarted successfully!"
}

# Function to show logs
logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Function to show status
status() {
    print_status "CapitalCoa services status:"
    docker-compose ps
}

# Function to clean up (remove containers and volumes)
cleanup() {
    print_warning "This will remove all containers and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up CapitalCoa services..."
        docker-compose down -v
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show help
show_help() {
    echo "CapitalCoa Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start all services"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      Show logs (all services or specific service)"
    echo "  status    Show status of all services"
    echo "  cleanup   Remove all containers and volumes"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs postgres"
    echo "  $0 status"
}

# Main script logic
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs "$2"
        ;;
    status)
        status
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 