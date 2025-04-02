// services/lectorService.js
const httpClient = require('../utils/httpClient');
const { lectorConfig } = require('../config/lector');

// Mapa para configuraciones de múltiples lectores
const lectoresConfig = new Map([
  ['reader1', { host: 'https://172.16.100.196', auth: { username: 'root', password: 'impinj' } }],
  ['reader2', { host: 'https://172.16.100.197', auth: { username: 'root', password: 'impinj' } }] // Ajusta esta IP a tu segundo lector
]);

// Obtener configuración para un lector específico
function getLectorConfig(lectorId) {
  if (lectoresConfig.has(lectorId)) {
    return lectoresConfig.get(lectorId);
  }
  
  // Si no se encuentra, usar la configuración por defecto
  console.warn(`Configuración no encontrada para lector ${lectorId}, usando configuración por defecto`);
  return lectorConfig;
}

// Obtener estado del lector
exports.getStatus = async (lectorId = 'reader1') => {
  try {
    const config = getLectorConfig(lectorId);
    const response = await httpClient.get(`${config.host}/api/v1/status`, {
      auth: config.auth
    });
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: `Error al obtener estado del lector ${lectorId}`,
      details: error.response?.data || error.message
    };
  }
};

// Iniciar lectura con un perfil
exports.startReading = async (lectorId = 'reader1', perfil = 'TEST') => {
  try {
    const config = getLectorConfig(lectorId);
    await httpClient.post(
      `${config.host}/api/v1/profiles/inventory/presets/${perfil}/start`,
      {},
      { auth: config.auth }
    );
    return true;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: `Error al iniciar lectura en lector ${lectorId}`,
      details: error.response?.data || error.message
    };
  }
};

// Detener lectura
exports.stopReading = async (lectorId = 'reader1') => {
  try {
    const config = getLectorConfig(lectorId);
    await httpClient.post(
      `${config.host}/api/v1/profiles/stop`,
      {},
      { auth: config.auth }
    );
    return true;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: `Error al detener lectura en lector ${lectorId}`,
      details: error.response?.data || error.message
    };
  }
};

// Obtener configuración MQTT
exports.getMqttConfig = async (lectorId = 'reader1') => {
  try {
    const config = getLectorConfig(lectorId);
    const response = await httpClient.get(
      `${config.host}/api/v1/mqtt`,
      { auth: config.auth }
    );
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: `Error al obtener configuración MQTT del lector ${lectorId}`,
      details: error.response?.data || error.message
    };
  }
};

// Actualizar configuración MQTT
exports.updateMqttConfig = async (lectorId = 'reader1', mqttConfig) => {
  try {
    const config = getLectorConfig(lectorId);
    await httpClient.put(
      `${config.host}/api/v1/mqtt`,
      mqttConfig,
      { auth: config.auth }
    );
    return true;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: `Error al actualizar configuración MQTT del lector ${lectorId}`,
      details: error.response?.data || error.message
    };
  }
};

// Configurar MQTT en el lector para que publique tags
exports.configureMqttForTags = async (lectorId = 'reader1', brokerUrl, clientId = 'impinj-reader', username = 'root', password = 'root') => {
  try {
    const config = getLectorConfig(lectorId);
    
    // Configuración optimizada para captura de tags RFID
    const mqttConfig = {
      enabled: true,
      brokerUrl: brokerUrl,
      clientId: "impinj", // Mantener el ID original del lector
      username: username,
      password: password,
      topicRoot: "impinj", // Topic root simple para coincidir con la suscripción
      retainMessages: false,
      qualityOfService: 1, // At least once
      tags: {
        enabled: true,
        format: "json",
        includeAllRssi: true, 
        includeAntennaPort: true,
        includePeakRssi: true,
        includePhase: true,
        includeSeenCount: true,
        includeDopplerFrequency: true,
        includeChannel: true,
        reportFilter: {
          tagAgeIntervalSeconds: 0.2, // Reportar tags más frecuentemente
          minSeenCount: 1
        }
      },
      connection: {
        keepAliveSeconds: 30,
        reconnectDelaySeconds: 5,
        timeoutSeconds: 60
      }
    };
    
    await httpClient.put(
      `${config.host}/api/v1/mqtt`,
      mqttConfig,
      { auth: config.auth }
    );
    
    console.log(`✅ Configuración MQTT optimizada para tags aplicada al lector ${lectorId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al configurar MQTT para tags: ${error.message}`);
    throw {
      status: error.response?.status || 500,
      message: `Error al configurar MQTT para tags en el lector ${lectorId}`,
      details: error.response?.data || error.message
    };
  }
};

// Reiniciar el lector
exports.reiniciarLector = async (lectorId = 'reader1') => {
  try {
    const config = getLectorConfig(lectorId);
    await httpClient.post(
      `${config.host}/api/v1/device/restart`,
      {},
      { auth: config.auth }
    );
    return true;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: `Error al reiniciar el lector ${lectorId}`,
      details: error.response?.data || error.message
    };
  }
};

// Configurar GPOs del lector
exports.configureGpos = async (lectorId = 'reader1', gpoConfigurations) => {
  try {
    const config = getLectorConfig(lectorId);
    await httpClient.put(
      `${config.host}/api/v1/device/gpos`,
      { gpoConfigurations },
      { auth: config.auth }
    );
    return true;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: `Error al configurar GPOs del lector ${lectorId}`,
      details: error.response?.data || error.message
    };
  }
};