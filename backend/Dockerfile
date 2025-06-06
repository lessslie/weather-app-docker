# Etapa de construcción
FROM node:18-alpine AS builder

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para build)
RUN npm ci && npm cache clean --force

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias de producción SOLAMENTE
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar aplicación construida desde builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 8080

# Configurar variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=8080

# Comando para iniciar la aplicación - CORREGIDO
CMD ["npm", "run", "start:prod"]