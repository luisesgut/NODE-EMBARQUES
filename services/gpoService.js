// services/gpoService.js
const httpClient = require('../utils/httpClient');
const { lectorConfig } = require('../config/lector');
const mqttService = require('./mqttService');

// Variable para almacenar el timeout de desactivación
let gpoTimeout = null;

// ID del lector (en un entorno real, esto podría venir de la configuración)
const LECTOR_ID = 'reader1';

// Configurar GPOs específicos
exports.configureGpos = async (gpoConfigurations) => {
  try {
    await httpClient.put(
      `${lectorConfig.host}/api/v1/device/gpos`,
      { gpoConfigurations }
    );
    
    // Publicar eventos MQTT para cada GPO configurado
    gpoConfigurations.forEach(config => {
      mqttService.publishGpoEvent(LECTOR_ID, config.gpo, config.state);
    });
    
    return true;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: 'Error al configurar GPOs',
      details: error.response?.data || error.message
    };
  }
};

// Activar GPOs 1 y 3 por una duración específica
exports.activarGpos = async (duracion = 3000) => {
  try {
    // Cancelar cualquier desactivación pendiente
    if (gpoTimeout) {
      clearTimeout(gpoTimeout);
    }

    // Activar GPOs
    await this.configureGpos([
      { gpo: 1, state: 'high' },
      { gpo: 3, state: 'high' }
    ]);

    console.log('⚡ GPOs ACTIVADOS (1 y 3)');

    // Desactivar después de la duración especificada
    gpoTimeout = setTimeout(async () => {
      await this.desactivarGpos();
      gpoTimeout = null;
    }, duracion);

    return true;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: 'Error al activar GPOs',
      details: error.response?.data || error.message
    };
  }
};

// Desactivar GPOs 1 y 3
exports.desactivarGpos = async () => {
  try {
    await this.configureGpos([
      { gpo: 1, state: 'low' },
      { gpo: 3, state: 'low' }
    ]);
    
    console.log('🔌 GPOs DESACTIVADOS (1 y 3)');
    return true;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: 'Error al desactivar GPOs',
      details: error.response?.data || error.message
    };
  }
};