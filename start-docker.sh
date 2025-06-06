#!/bin/bash
echo "Iniciando Weather App con Docker..."
docker-compose up -d
echo ""
echo "Servicios iniciados:"
echo "- Frontend: http://localhost"
echo "- Backend API: http://localhost:8080/api/v1"
echo "- Swagger Docs: http://localhost:8080/api/docs"
echo ""
echo "Para detener los servicios, ejecuta: docker-compose down"
