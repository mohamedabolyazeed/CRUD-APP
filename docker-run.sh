#!/bin/bash

# Docker run script for CRUD App

echo "🐳 CRUD App Docker Runner"
echo "=========================="

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  dev     - Run development environment (backend + frontend dev server)"
    echo "  prod    - Run production environment (backend + nginx frontend)"
    echo "  build   - Build all Docker images"
    echo "  stop    - Stop all containers"
    echo "  clean   - Stop and remove all containers and volumes"
    echo "  logs    - Show logs from all containers"
    echo "  status  - Show status of all containers"
    echo ""
}

# Function to build images
build_images() {
    echo "🔨 Building Docker images..."
    docker-compose build
}

# Function to run development environment
run_dev() {
    echo "🚀 Starting development environment..."
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:5000"
    echo "🗄️  MongoDB: localhost:27017"
    echo ""
    
    # Build the React app first
    echo "📦 Building React app..."
    cd client && npm run build && cd ..
    
    docker-compose up -d mongodb backend
    docker-compose up frontend
}

# Function to run production environment
run_prod() {
    echo "🚀 Starting production environment..."
    echo "🌐 Frontend: http://localhost"
    echo "🔧 Backend API: http://localhost:5000"
    echo "🗄️  MongoDB: localhost:27017"
    echo ""
    
    # Build the React app first
    echo "📦 Building React app..."
    cd client && npm run build && cd ..
    
    docker-compose --profile production up -d
}

# Function to stop containers
stop_containers() {
    echo "🛑 Stopping all containers..."
    docker-compose down
}

# Function to clean everything
clean_all() {
    echo "🧹 Cleaning all containers, images, and volumes..."
    docker-compose down -v --rmi all
    docker system prune -f
}

# Function to show logs
show_logs() {
    echo "📋 Showing logs from all containers..."
    docker-compose logs -f
}

# Function to show status
show_status() {
    echo "📊 Container status:"
    docker-compose ps
}

# Main script logic
case "$1" in
    "dev")
        run_dev
        ;;
    "prod")
        run_prod
        ;;
    "build")
        build_images
        ;;
    "stop")
        stop_containers
        ;;
    "clean")
        clean_all
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    *)
        show_usage
        exit 1
        ;;
esac 