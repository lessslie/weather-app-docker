# FROM node:20-alpine AS builder

# WORKDIR /app

# # Copiar archivos de dependencias
# COPY package*.json ./

# # Instalar dependencias
# RUN npm ci

# # Copiar el resto del código
# COPY . .

# # Construir la aplicación
# RUN npm run build

# # Etapa de producción con Nginx
# FROM nginx:alpine AS production

# # Copiar la configuración de Nginx
# COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# # Copiar los archivos compilados desde la etapa de construcción
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Exponer el puerto
# EXPOSE 80

# # Comando para iniciar Nginx
# CMD ["nginx", "-g", "daemon off;"]
# Build stage
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]