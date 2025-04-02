const lectorService = require('./lectorService');
const mqttService = require('./mqttService');
const socketConfig = require('../config/socket');

// Mapa para almacenar los intervalos de polling por lector
const pollingIntervals = new Map();

// Iniciar polling de status para un lector específico
exports.iniciarPolling = (lectorId = 'reader1') => {
  // Si ya hay un polling activo para este lector, detenerlo
  if (pollingIntervals.has(lectorId)) {
    clearInterval(pollingIntervals.get(lectorId));
  }
  
  // Realizar una consulta inmediata
  this.consultarStatus(lectorId);
  
  // Iniciar nuevo polling cada 3 segundos
  const intervalId = setInterval(() => {
    this.consultarStatus(lectorId);
  }, 3000);
  
  // Guardar el ID del intervalo
  pollingIntervals.set(lectorId, intervalId);
  return true;
};

// Detener polling de status para un lector específico
exports.detenerPolling = (lectorId = 'reader1') => {
  if (pollingIntervals.has(lectorId)) {
    clearInterval(pollingIntervals.get(lectorId));
    pollingIntervals.delete(lectorId);
    return true;
  }
  return false;
};

// Consultar status y emitirlo por socket.io y MQTT
exports.consultarStatus = async (lectorId = 'reader1') => {
  try {
    const status = await lectorService.getStatus(lectorId);
    
    // Obtener la instancia de io
    const io = socketConfig.io();
    
    // Emitir por Socket.io
    io.emit(`lector/${lectorId}/status`, status);
    
    // Publicar en MQTT
    mqttService.publishLectorStatus(lectorId, status);
    
    return status;
  } catch (error) {
    console.error(`Error en polling de status para lector ${lectorId}:`, error.message);
    
    try {
      // Obtener la instancia de io
      const io = socketConfig.io();
      
      // Emitir error por socket.io
      io.emit(`lector/${lectorId}/statusError`, {
        error: 'Error al obtener status',
        details: error.message
      });
    } catch (socketError) {
      console.error('Error al emitir con Socket.io:', socketError.message);
    }
    
    // Publicar error en MQTT
    mqttService.publishError(lectorId, 'status_polling_error', error.message);
    
    return null;
  }
};

// Detener todos los pollings
exports.detenerTodosPollings = () => {
  for (const [lectorId, intervalId] of pollingIntervals.entries()) {
    clearInterval(intervalId);
    console.log(`Polling detenido para lector ${lectorId}`);
  }
  // Limpiar el mapa
  pollingIntervals.clear();
};