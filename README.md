# Weather App con Docker

Esta aplicación está configurada para ser ejecutada fácilmente en cualquier máquina utilizando Docker.

## Estructura del Proyecto

- **backend**: API REST desarrollada con NestJS
- **frontend**: Aplicación web desarrollada con React
- **docker-compose.yml**: Configuración para orquestar todos los servicios

## Requisitos

- Docker
- Docker Compose

## Servicios Incluidos

- **Frontend**: Aplicación web React servida por Nginx
- **Backend**: API REST NestJS
- **PostgreSQL**: Base de datos
- **Redis**: Caché

## Cómo Iniciar la Aplicación

### En Windows

```bash
.\start-docker.bat
```

### En Linux/Mac

```bash
chmod +x ./start-docker.sh
./start-docker.sh
```

## Acceso a los Servicios

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api/v1
- **Swagger Docs**: http://localhost:8080/api/docs

## Detener la Aplicación

```bash
docker-compose down
```

## Variables de Entorno

Las variables de entorno están configuradas en el archivo `docker-compose.yml` para producción. Para desarrollo local, se utilizan los archivos `.env` en cada directorio.

## Desarrollo Local

Para desarrollo local sin Docker, consulta los archivos README.md en los directorios `backend` y `frontend`.
