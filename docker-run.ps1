# Docker run script for CRUD App (PowerShell)

param(
    [Parameter(Position=0)]
    [string]$Command
)

Write-Host "🐳 CRUD App Docker Runner" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Function to show usage
function Show-Usage {
    Write-Host "Usage: .\docker-run.ps1 [COMMAND]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  dev     - Run development environment (backend + frontend dev server)" -ForegroundColor White
    Write-Host "  prod    - Run production environment (backend + nginx frontend)" -ForegroundColor White
    Write-Host "  build   - Build all Docker images" -ForegroundColor White
    Write-Host "  stop    - Stop all containers" -ForegroundColor White
    Write-Host "  clean   - Stop and remove all containers and volumes" -ForegroundColor White
    Write-Host "  logs    - Show logs from all containers" -ForegroundColor White
    Write-Host "  status  - Show status of all containers" -ForegroundColor White
    Write-Host ""
}

# Function to build images
function Build-Images {
    Write-Host "🔨 Building Docker images..." -ForegroundColor Green
    docker-compose build
}

# Function to run development environment
function Start-Dev {
    Write-Host "🚀 Starting development environment..." -ForegroundColor Green
    Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "🔧 Backend API: http://localhost:5000" -ForegroundColor Cyan
    Write-Host "🗄️  MongoDB: localhost:27017" -ForegroundColor Cyan
    Write-Host ""
    
    # Build the React app first
    Write-Host "📦 Building React app..." -ForegroundColor Yellow
    Set-Location client
    npm run build
    Set-Location ..
    
    docker-compose up -d mongodb backend
    docker-compose up frontend
}

# Function to run production environment
function Start-Prod {
    Write-Host "🚀 Starting production environment..." -ForegroundColor Green
    Write-Host "🌐 Frontend: http://localhost" -ForegroundColor Cyan
    Write-Host "🔧 Backend API: http://localhost:5000" -ForegroundColor Cyan
    Write-Host "🗄️  MongoDB: localhost:27017" -ForegroundColor Cyan
    Write-Host ""
    
    # Build the React app first
    Write-Host "📦 Building React app..." -ForegroundColor Yellow
    Set-Location client
    npm run build
    Set-Location ..
    
    docker-compose --profile production up -d
}

# Function to stop containers
function Stop-Containers {
    Write-Host "🛑 Stopping all containers..." -ForegroundColor Yellow
    docker-compose down
}

# Function to clean everything
function Clean-All {
    Write-Host "🧹 Cleaning all containers, images, and volumes..." -ForegroundColor Yellow
    docker-compose down -v --rmi all
    docker system prune -f
}

# Function to show logs
function Show-Logs {
    Write-Host "📋 Showing logs from all containers..." -ForegroundColor Green
    docker-compose logs -f
}

# Function to show status
function Show-Status {
    Write-Host "📊 Container status:" -ForegroundColor Green
    docker-compose ps
}

# Main script logic
switch ($Command) {
    "dev" {
        Start-Dev
    }
    "prod" {
        Start-Prod
    }
    "build" {
        Build-Images
    }
    "stop" {
        Stop-Containers
    }
    "clean" {
        Clean-All
    }
    "logs" {
        Show-Logs
    }
    "status" {
        Show-Status
    }
    default {
        Show-Usage
        exit 1
    }
} 