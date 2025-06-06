// Configuración de la API para diferentes entornos
const config = {
  // En desarrollo local
  development: {
    apiBaseUrl: 'http://localhost:8080/api/v1',
  },
  // En Docker
  docker: {
    apiBaseUrl: '/api/v1', // URL relativa para que Nginx haga proxy
  },
  // En producción (Vercel + Railway)
  production: {
    apiBaseUrl: import.meta.env.VITE_API_URL || 'https://weather-app-docker.onrender.com/api/v1',
  }
};

// Determinar el entorno actual
const getEnvironment = () => {
  // Si estamos en Docker (detectar por variable de entorno o URL)
  if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('vercel.app')) {
    return 'docker';
  }
  
  // Si estamos en producción (Vercel)
  if (import.meta.env.PROD || window.location.hostname.includes('vercel.app')) {
    return 'production';
  }
  
  // Por defecto, desarrollo
  return 'development';
};

// Exportar la configuración para el entorno actual
const currentEnv = getEnvironment();
export const apiBaseUrl = config[currentEnv].apiBaseUrl;

console.log(`Entorno detectado: ${currentEnv}`);
console.log(`API Base URL: ${apiBaseUrl}`);
