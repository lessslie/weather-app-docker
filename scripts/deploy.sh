#!/bin/bash

# Weather App - Deploy Script
# Despliega la aplicación en desarrollo o producción

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo "Uso: $0 [dev|prod] [opciones]"
    echo ""
    echo "Opciones:"
    echo "  dev     - Desplegar en modo desarrollo"
    echo "  prod    - Desplegar en modo producción"
    echo "  --build - Forzar rebuild de imágenes"
    echo "  --clean - Limpiar volúmenes antes del deploy"
    echo ""
    exit 1
fi

ENVIRONMENT=$1
BUILD_FLAG=""
CLEAN_FLAG=""

# Procesar argumentos adicionales
shift
while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD_FLAG="--build"
            shift
            ;;
        --clean)
            CLEAN_FLAG="true"
            shift
            ;;
        *)
            warn "Opción desconocida: $1"
            shift
            ;;
    esac
done

log "🚀 Iniciando deploy de Weather App en modo: $ENVIRONMENT"

# Verificar que Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    error "Docker no está corriendo. Por favor inicialo primero."
fi

# Verificar archivos necesarios
if [ "$ENVIRONMENT" = "prod" ] && [ ! -f ".env" ]; then
    error "Archivo .env no encontrado. Copia .env.example y configúralo."
fi

# Función para deploy de desarrollo
deploy_dev() {
    log "📦 Configurando entorno de desarrollo..."
    
    if [ "$CLEAN_FLAG" = "true" ]; then
        log "🧹 Limpiando volúmenes de desarrollo..."
        docker-compose -f docker-compose.dev.yml down -v
    fi
    
    log "🔧 Construyendo e iniciando servicios de desarrollo..."
    docker-compose -f docker-compose.dev.yml up -d $BUILD_FLAG
    
    log "⏳ Esperando que los servicios estén listos..."
    sleep 10
    
    # Verificar que los servicios están healthy
    check_health_dev
    
    log "✅ Deploy de desarrollo completado!"
    log "🌐 Frontend: http://localhost:5173"
    log "🔧 Backend: http://localhost:3000"
    log "📚 API Docs: http://localhost:3000/api/docs"
    log "🗄️ PostgreSQL: localhost:5432"
    log "🗃️ Redis: localhost:6379"
}

# Función para deploy de producción
deploy_prod() {
    log "📦 Configurando entorno de producción..."
    
    if [ "$CLEAN_FLAG" = "true" ]; then
        log "🧹 Limpiando volúmenes de producción..."
        docker-compose -f docker-compose.prod.yml down -v
    fi
    
    log "🔧 Construyendo e iniciando servicios de producción..."
    docker-compose -f docker-compose.prod.yml up -d $BUILD_FLAG
    
    log "⏳ Esperando que los servicios estén listos..."
    sleep 20
    
    # Verificar que los servicios están healthy
    check_health_prod
    
    log "✅ Deploy de producción completado!"
    log "🌐 Aplicación: http://localhost"
    log "📊 Logs: docker-compose -f docker-compose.prod.yml logs -f"
}

# Verificar salud de servicios de desarrollo
check_health_dev() {
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "🔍 Verificando servicios... (intento $attempt/$max_attempts)"
        
        # Verificar backend
        if curl -s -f http://localhost:3000/api/v1/health > /dev/null 2>&1; then
            log "✅ Backend está funcionando"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "❌ Los servicios no están respondiendo después de $max_attempts intentos"
        fi
        
        sleep 5
        ((attempt++))
    done
}

# Verificar salud de servicios de producción
check_health_prod() {
    local max_