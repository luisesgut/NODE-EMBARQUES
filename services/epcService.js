// services/epcService.js
const { epcModel } = require('../models/epc');
const logger = require('../utils/logger');

// Procesar un EPC recibido
exports.procesarEpc = (epcHex) => {
  // Registrar el EPC recibido
  logger.info(`EPC recibido para procesar: ${epcHex}`);
  
  // Verificar si el EPC existe en nuestro mapa
  if (epcModel.mapaEPC.has(epcHex)) {
    const info = epcModel.mapaEPC.get(epcHex);
    logger.info(`EPC válido encontrado: ${epcHex}`);
    return {
      valido: true,
      info,
      epc: epcHex
    };
  } else {
    // Si está en modo permisivo, reportar cualquier EPC como válido
    if (epcModel.modoPermisivo) {
      logger.info(`EPC no encontrado pero modo permisivo activo: ${epcHex}`);
      // Crear una copia del objeto genérico para no modificar el original
      const infoGenerica = { ...epcModel.datosGenericos };
      // Añadir el EPC actual
      infoGenerica.rfidOriginal = epcHex;
      infoGenerica.rfid = epcHex;
      infoGenerica.claveProducto = 'AUTO-' + epcHex.substring(0, 6);
      
      return {
        valido: true,
        info: infoGenerica,
        epc: epcHex,
        generado: true
      };
    }
    
    logger.warn(`EPC no válido: ${epcHex}`);
    return {
      valido: false,
      epc: epcHex
    };
  }
};

// Intenta normalizar un EPC para aumentar la posibilidad de coincidencia
exports.normalizarEpc = (epcHex) => {
  // Eliminar cualquier espacio o caracter no alfanumérico
  let normalizado = epcHex.replace(/[^a-zA-Z0-9]/g, '');
  
  // Convertir a mayúsculas (para códigos hexadecimales)
  normalizado = normalizado.toUpperCase();
  
  return normalizado;
};

// Obtener todos los EPCs válidos
exports.obtenerEpcs = () => {
  return epcModel.detalleEPCs;
};

// Agregar un nuevo EPC válido
exports.agregarEpc = (epc) => {
  // Validar que el EPC tenga los campos requeridos
  if (!epc.rfid || !epc.claveProducto || !epc.nombreProducto) {
    throw new Error('El EPC debe tener rfid, claveProducto y nombreProducto');
  }
  
  // Verificar que el EPC no exista ya
  if (epcModel.mapaEPC.has(epc.rfid)) {
    throw new Error(`El EPC ${epc.rfid} ya existe`);
  }
  
  // Agregar el EPC al modelo
  epcModel.detalleEPCs.push(epc);
  
  // Agregar múltiples formatos al mapa para este nuevo EPC
  mapaEPC.set(epc.rfid, epc);
  
  // Sin ceros al inicio
  const sinCeros = epc.rfid.replace(/^0+/, '');
  mapaEPC.set(sinCeros, epc);
  
  // Formato con/sin prefijo '00'
  if (epc.rfid.startsWith('00')) {
    mapaEPC.set(epc.rfid.substring(2), epc);
  } else {
    mapaEPC.set('00' + epc.rfid, epc);
  }
  
  // Formato en mayúsculas
  mapaEPC.set(epc.rfid.toUpperCase(), epc);
  
  return epc;
};

// Eliminar un EPC
exports.eliminarEpc = (rfid) => {
  // Verificar que el EPC exista
  if (!epcModel.mapaEPC.has(rfid)) {
    throw new Error(`El EPC ${rfid} no existe`);
  }
  
  // Eliminar del mapa - todas las posibles variantes
  epcModel.mapaEPC.delete(rfid);
  epcModel.mapaEPC.delete(rfid.replace(/^0+/, '')); // Sin ceros
  epcModel.mapaEPC.delete(rfid.toUpperCase()); // Mayúsculas
  
  // Variantes con/sin '00'
  if (rfid.startsWith('00')) {
    epcModel.mapaEPC.delete(rfid.substring(2));
  } else {
    epcModel.mapaEPC.delete('00' + rfid);
  }
  
  // Eliminar del array
  const index = epcModel.detalleEPCs.findIndex(epc => epc.rfid === rfid);
  epcModel.detalleEPCs.splice(index, 1);
  
  return true;
};