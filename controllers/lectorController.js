// controllers/lectorController.js
const lectorService = require('../services/lectorService');
const statusPollingService = require('../services/statusPollingService');
const mqttService = require('../services/mqttService');
const { mqttConfig } = require('../config/mqtt');

// ID del lector por defecto (en un entorno real, esto podría venir dinámicamente)
const DEFAULT_LECTOR_ID = 'reader1';

// Obtener el estado del lector
exports.getLectorStatus = async (req, res, next) => {
  try {
    // Obtener ID del lector de los parámetros o usar el predeterminado
    const lectorId = req.query.lectorId || DEFAULT_LECTOR_ID;
    
    const status = await lectorService.getStatus(lectorId);
    
    // Publicar el estado en MQTT
    mqttService.publishLectorStatus(lectorId, status);
    
    res.json(status);
  } catch (error) {
    next(error);
  }
};



// Iniciar lectura con un perfil específico
exports.iniciarLectura = async (req, res, next) => {
  try {
    const lectorId = req.body.lectorId || DEFAULT_LECTOR_ID;
    const perfil = req.body.perfil || 'TEST';
    
    await lectorService.startReading(lectorId, perfil);
    
    // Publicar la operación en MQTT
    mqttService.publishOperation(lectorId, 'reading_started', { 
      perfil,
      startedBy: 'api_request',
      requestId: req.id // Si tienes un middleware que asigna IDs a las solicitudes
    });
    
    res.json({ success: true, message: `Lectura iniciada con perfil ${perfil} en lector ${lectorId}` });
  } catch (error) {
    next(error);
  }
};

// Detener lectura
exports.detenerLectura = async (req, res, next) => {
  try {
    const lectorId = req.body.lectorId || DEFAULT_LECTOR_ID;
    
    await lectorService.stopReading(lectorId);
    
    // Publicar la operación en MQTT
    mqttService.publishOperation(lectorId, 'reading_stopped', { 
      stoppedBy: 'api_request',
      requestId: req.id 
    });
    
    res.json({ success: true, message: `Lectura detenida en lector ${lectorId}` });
  } catch (error) {
    next(error);
  }
};

// Obtener configuración MQTT
exports.getMqttConfig = async (req, res, next) => {
  try {
    const lectorId = req.query.lectorId || DEFAULT_LECTOR_ID;
    
    const config = await lectorService.getMqttConfig(lectorId);
    res.json(config);
  } catch (error) {
    next(error);
  }
};

// Actualizar configuración MQTT
exports.updateMqttConfig = async (req, res, next) => {
  try {
    const lectorId = req.body.lectorId || DEFAULT_LECTOR_ID;
    
    // Eliminar lectorId del body para no enviarlo al lector
    const mqttConfig = { ...req.body };
    delete mqttConfig.lectorId;
    
    await lectorService.updateMqttConfig(lectorId, mqttConfig);
    
    // Publicar la operación en MQTT
    mqttService.publishOperation(lectorId, 'mqtt_config_updated', { 
      updatedBy: 'api_request'
    });
    
    res.json({ success: true, message: `Configuración MQTT actualizada en lector ${lectorId}` });
  } catch (error) {
    next(error);
  }
};

// Configurar MQTT específicamente para captura de tags (nueva función)
exports.configureMqttForTags = async (req, res, next) => {
  try {
    const lectorId = req.body.lectorId || DEFAULT_LECTOR_ID;
    
    // Usar la configuración del broker del sistema o la proporcionada
    const brokerUrl = req.body.brokerUrl || mqttConfig.brokerUrl;
    const username = req.body.username || mqttConfig.username;
    const password = req.body.password || mqttConfig.password;
    const clientId = "impinj"; // Mantener el ID del cliente original que usa el lector
    
    // Aplicar configuración optimizada para tags
    await lectorService.configureMqttForTags(
      lectorId, 
      brokerUrl, 
      clientId,
      username,
      password
    );
    
    // Publicar la operación en MQTT
    mqttService.publishOperation(lectorId, 'mqtt_tags_configured', {
      brokerUrl,
      clientId,
      updatedBy: 'api_request'
    });
    
    res.json({ 
      success: true, 
      message: `Configuración MQTT optimizada para tags aplicada al lector ${lectorId}`,
      config: {
        brokerUrl,
        topicRoot: `impinj/${lectorId}`,
        clientId
      }
    });
  } catch (error) {
    next(error);
  }
};

// Iniciar polling de status
exports.iniciarStatusPolling = (req, res) => {
  const lectorId = req.body.lectorId || DEFAULT_LECTOR_ID;
  
  statusPollingService.iniciarPolling(lectorId);
  
  // Publicar la operación en MQTT
  mqttService.publishOperation(lectorId, 'status_polling_started', { 
    interval: 3000 // Intervalo en ms
  });
  
  res.json({ success: true, message: `Polling de status iniciado para lector ${lectorId}` });
};

// Detener polling de status
exports.detenerStatusPolling = (req, res) => {
  const lectorId = req.body.lectorId || DEFAULT_LECTOR_ID;
  
  const detenido = statusPollingService.detenerPolling(lectorId);
  
  if (detenido) {
    // Publicar la operación en MQTT
    mqttService.publishOperation(lectorId, 'status_polling_stopped');
    
    res.json({ success: true, message: `Polling de status detenido para lector ${lectorId}` });
  } else {
    res.status(400).json({ error: `No hay polling activo para detener en lector ${lectorId}` });
  }
};