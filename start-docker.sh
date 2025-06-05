#!/bin/bash

# Mostrar mensaje de inicio
echo "🚀 Iniciando Weather App con Docker..."

# Construir y levantar los contenedores en modo detached
docker-compose up -d --build

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 5

# Mostrar información de los contenedores
echo "📊 Estado de los contenedores:"
docker-compose ps

# Mostrar URLs de acceso
echo ""
echo "✅ Weather App está lista!"
echo "📱 Frontend: http://localhost"
echo "🔌 Backend API: http://localhost/api/v1"
echo ""
echo "Para detener la aplicación, ejecuta: docker-compose down"
