// utils/httpClient.js
const axios = require('axios');
const https = require('https');
const { lectorConfig } = require('../config/lector');

// Crear instancia de Axios con configuración base
const httpClient = axios.create({
  auth: lectorConfig.auth,
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  timeout: 5000 // Timeout de 5 segundos
});

// Interceptor para manejar respuestas
httpClient.interceptors.response.use(
  response => response,
  error => {
    // Personalizar el objeto de error
    const customError = {
      status: error.response?.status || 500,
      message: error.message,
      details: error.response?.data || error.message
    };
    
    return Promise.reject(customError);
  }
);

module.exports = httpClient;