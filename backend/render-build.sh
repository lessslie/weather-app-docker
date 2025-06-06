#!/usr/bin/env bash
# Script para construir la aplicación en Render

# Salir en caso de error
set -e

# Instalar dependencias
npm ci

# Construir la aplicación
npm run build

# Copiar archivo .env.production a .env si existe
if [ -f ".env.production" ]; then
  echo "Copiando .env.production a .env para producción"
  cp .env.production .env
fi

echo "Construcción completada con éxito"
