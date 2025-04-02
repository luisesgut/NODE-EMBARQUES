// middleware/errorHandler.js
const logger = require('../utils/logger');

// Middleware para manejar errores
const errorHandler = (err, req, res, next) => {
  // Obtener detalles del error
  const statusCode = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  const details = err.details || err.stack;
  
  // Registrar el error
  logger.error(`${statusCode} - ${message}: ${JSON.stringify(details)}`);
  
  // Enviar respuesta al cliente
  res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === 'production' ? undefined : details
  });
};

module.exports = errorHandler;