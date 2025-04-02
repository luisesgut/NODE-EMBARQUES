// utils/logger.js
const winston = require('winston');
const path = require('path');

// Configurar los niveles de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Función para determinar el nivel según el entorno
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Configurar colores para cada nivel
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Formato de consola
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Formato de archivo
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json(),
);

// Transportes
const transports = [
  // Consola
  new winston.transports.Console({
    format: consoleFormat,
  }),
  // Archivo de errores
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: fileFormat,
  }),
  // Archivo de todos los logs
  new winston.transports.File({
    filename: path.join('logs', 'all.log'),
    format: fileFormat,
  }),
];

// Crear logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

module.exports = logger;