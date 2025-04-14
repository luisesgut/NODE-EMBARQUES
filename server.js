// server.js - Punto de entrada principal
const express = require('express');
const http = require('http');
const cors = require('cors');
const { initSocket } = require('./config/socket');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { connectMqtt } = require('./services/mqttService');
const { configureSwagger } = require('./config/swagger');

// Crear la aplicación Express
const app = express();
const server = http.createServer(app);

// Inicializar Socket.io
const io = initSocket(server);

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
server.listen(port, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${port}`);
  console.log(`📚 Documentación API disponible en http://localhost:${port}/api-docs`);
  
  // Conectar a MQTT después de iniciar el servidor
  connectMqtt(io);
});

module.exports = { app, server };