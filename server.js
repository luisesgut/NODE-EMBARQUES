// server.js - Punto de entrada principal
const express = require('express');
const http = require('http');
const cors = require('cors');
const { initSocket } = require('./config/socket');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const mqttService = require('./services/mqttService');
const { configureSwagger } = require('./config/swagger');
const logisticaService = require('./services/logisticaService');

// Crear la aplicación Express
const app = express();
const server = http.createServer(app);

// Inicializar Socket.io
const io = initSocket(server);

// Hacer io disponible para las rutas
app.locals.io = io;

// Middleware
app.use(express.json());
app.use(cors());

// Configurar Swagger
configureSwagger(app);

// Rutas
app.use('/api', routes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('🎯 Backend corriendo y escuchando EPCs | Visita <a href="/api-docs">Documentación API</a>');
});

// Middleware de manejo de errores
app.use(errorHandler);

// Puerto
const port = process.env.PORT || 3000;

// Iniciar servidor
server.listen(port, async () => {
  console.log(`🚀 Backend corriendo en http://localhost:${port}`);
  console.log(`📚 Documentación API disponible en http://localhost:${port}/api-docs`);

  // Verificar si la función connectMqtt existe antes de llamarla
  if (typeof mqttService.connectMqtt === 'function') {
    // Conectar a MQTT después de iniciar el servidor
    mqttService.connectMqtt(io);
  } else {
    console.warn('⚠️ La función connectMqtt no está disponible en mqttService');
  }

  // Iniciar consulta de logísticas
  try {
    console.log('🔄 Iniciando primera consulta de logísticas...');
    await logisticaService.consultarLogisticas();
    console.log('✅ Consulta inicial de logísticas completada');

    // Iniciar polling automático
    logisticaService.iniciarPollingLogisticas();
    console.log('🔄 Polling de logísticas iniciado');
  } catch (error) {
    console.error('❌ Error al iniciar consulta de logísticas:', error.message);
  }
});

// Manejar señales de terminación para limpiar recursos
process.on('SIGINT', async () => {
  console.log('🛑 Cerrando aplicación...');

  // Detener el polling de logísticas
  logisticaService.detenerPollingLogisticas();

  // Desconectar MQTT si la función existe
  if (typeof mqttService.disconnectMqtt === 'function') {
    mqttService.disconnectMqtt();
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cerrar aplicación:', error);
    process.exit(1);
  }
});

module.exports = { app, server };