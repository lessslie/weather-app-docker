import * as http from 'http';

interface HealthCheckOptions {
  host: string;
  port: number | string;
  path: string;
  timeout: number;
}

const options: HealthCheckOptions = {
  host: 'localhost',
  port: process.env.PORT || 3002, // Usando el puerto 3002 que es el del backend según la memoria
  path: '/api/v1/health',
  timeout: 2000,
};

const request = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err: Error) => {
  console.log('Health check failed:', err.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.log('Health check timed out');
  request.destroy();
  process.exit(1);
});

request.end();
