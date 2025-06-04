FROM nginx:alpine

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar configuración personalizada
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# Crear directorios necesarios
RUN mkdir -p /var/log/nginx /etc/nginx/ssl

# Configurar permisos
RUN chown -R nginx:nginx /var/log/nginx
RUN chown -R nginx:nginx /etc/nginx/conf.d

# Exponer puertos
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]