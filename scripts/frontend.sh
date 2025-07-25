#!/bin/bash

# Script para gestionar el frontend de CapitalCoa
# Uso: ./scripts/frontend.sh [comando]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
check_directory() {
    if [ ! -f "package.json" ] || [ ! -d "frontend" ]; then
        print_error "Este script debe ejecutarse desde el directorio raíz del proyecto CapitalCoa"
        exit 1
    fi
}

# Verificar Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js 18+ es requerido. Versión actual: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) detectado"
}

# Verificar npm
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi
    
    print_success "npm $(npm -v) detectado"
}

# Instalar dependencias del frontend
install_dependencies() {
    print_status "Instalando dependencias del frontend..."
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dependencias instaladas"
    else
        print_warning "Dependencias ya instaladas. Ejecutando npm install para actualizar..."
        npm install
        print_success "Dependencias actualizadas"
    fi
    
    cd ..
}

# Configurar variables de entorno
setup_env() {
    print_status "Configurando variables de entorno..."
    cd frontend
    
    if [ ! -f ".env.local" ]; then
        cp env.example .env.local
        print_success "Archivo .env.local creado"
    else
        print_warning "Archivo .env.local ya existe"
    fi
    
    cd ..
}

# Iniciar servidor de desarrollo
start_dev() {
    print_status "Iniciando servidor de desarrollo del frontend..."
    cd frontend
    
    # Verificar que el backend esté ejecutándose
    if ! curl -s http://localhost:3000 > /dev/null; then
        print_warning "El backend no parece estar ejecutándose en http://localhost:3000"
        print_warning "Asegúrate de que el backend esté iniciado antes de usar el frontend"
    fi
    
    print_success "Frontend iniciado en http://localhost:5173"
    print_status "Credenciales de prueba:"
    echo "   Usuario: admin@capitalcoa.com"
    echo "   Contraseña: sumian01150202"
    echo ""
    print_status "Presiona Ctrl+C para detener el servidor"
    
    npm run dev
}

# Construir para producción
build() {
    print_status "Construyendo frontend para producción..."
    cd frontend
    npm run build
    cd ..
    print_success "Build completado en frontend/dist/"
}

# Ejecutar linting
lint() {
    print_status "Ejecutando linting..."
    cd frontend
    npm run lint
    cd ..
    print_success "Linting completado"
}

# Formatear código
format() {
    print_status "Formateando código..."
    cd frontend
    npm run format
    cd ..
    print_success "Formateo completado"
}

# Verificar tipos TypeScript
type_check() {
    print_status "Verificando tipos TypeScript..."
    cd frontend
    npm run type-check
    cd ..
    print_success "Verificación de tipos completada"
}

# Limpiar archivos generados
clean() {
    print_status "Limpiando archivos generados..."
    cd frontend
    
    if [ -d "dist" ]; then
        rm -rf dist
        print_success "Directorio dist eliminado"
    fi
    
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        print_success "Dependencias eliminadas"
    fi
    
    cd ..
}

# Mostrar ayuda
show_help() {
    echo "CapitalCoa Frontend Manager"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  install     - Instalar dependencias del frontend"
    echo "  setup       - Configurar variables de entorno"
    echo "  dev         - Iniciar servidor de desarrollo"
    echo "  build       - Construir para producción"
    echo "  lint        - Ejecutar linting"
    echo "  format      - Formatear código"
    echo "  type-check  - Verificar tipos TypeScript"
    echo "  clean       - Limpiar archivos generados"
    echo "  help        - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 install    # Instalar dependencias"
    echo "  $0 dev        # Iniciar desarrollo"
    echo "  $0 build      # Construir para producción"
}

# Función principal
main() {
    check_directory
    check_node
    check_npm
    
    case "${1:-help}" in
        "install")
            install_dependencies
            ;;
        "setup")
            setup_env
            ;;
        "dev")
            start_dev
            ;;
        "build")
            build
            ;;
        "lint")
            lint
            ;;
        "format")
            format
            ;;
        "type-check")
            type_check
            ;;
        "clean")
            clean
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Comando desconocido: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@" 