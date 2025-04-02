// services/mqttService.js
const mqtt = require('mqtt');
const { mqttConfig } = require('../config/mqtt');
const epcService = require('./epcService');
const gpoService = require('./gpoService');

// Variable para almacenar el cliente MQTT
let client = null;

// Conectar a MQTT
exports.connectMqtt = (io) => {
  // Si ya hay una conexión, cerrarla
  if (client) {
    client.end();
  }

  // Crear nueva conexión
  client = mqtt.connect(mqttConfig.brokerUrl, {
    username: mqttConfig.username,
    password: mqttConfig.password,
    clientId: mqttConfig.clientId,
    rejectUnauthorized: false
  });

  // Evento de conexión
  client.on('connect', () => {
    console.log('✅ Conectado a EMQX Cloud');
    
    // Obtener los IDs de los lectores disponibles
    const lectorIds = ['reader1', 'reader2']; // Define aquí tus IDs de lectores
    
    // Suscribirse a todos los topics de todos los lectores
    lectorIds.forEach(lectorId => {
      // Suscribirse a todos los topics de un lector específico
      const topic = mqttConfig.getTopic('all', lectorId);
      client.subscribe(topic, (err) => {
        if (err) console.error(`❌ Error al suscribirse a ${topic}:`, err);
        else console.log(`📡 Suscrito a topic: ${topic}`);
      });
      
      // Publicar mensaje de conexión del backend
      publishBackendStatus(lectorId, 'connected');
    });
    
    // IMPORTANTE: Suscribirse a topics adicionales que el lector Impinj pueda estar usando
    
    // Suscribirse a todos los topics disponibles para garantizar la recepción de tags
    
    // Tag inventory topics
    client.subscribe('tags/#', (err) => {
      if (err) console.error('❌ Error al suscribirse a tags/#:', err);
      else console.log('📡 Suscrito a topic: tags/#');
    });
    
    client.subscribe('inventory/#', (err) => {
      if (err) console.error('❌ Error al suscribirse a inventory/#:', err);
      else console.log('📡 Suscrito a topic: inventory/#');
    });
    
    client.subscribe('tag/#', (err) => {
      if (err) console.error('❌ Error al suscribirse a tag/#:', err);
      else console.log('📡 Suscrito a topic: tag/#');
    });
    
    client.subscribe('impinj/#', (err) => {
      if (err) console.error('❌ Error al suscribirse a impinj/#:', err);
      else console.log('📡 Suscrito a topic: impinj/#');
    });
    
    client.subscribe('reader/#', (err) => {
      if (err) console.error('❌ Error al suscribirse a reader/#:', err);
      else console.log('📡 Suscrito a topic: reader/#');
    });
    
    // Topics de Impinj específicos
    client.subscribe('impinj/status', (err) => {
      if (err) console.error('❌ Error al suscribirse a impinj/status:', err);
      else console.log('📡 Suscrito a topic: impinj/status');
    });
    
    client.subscribe('impinj/inventory', (err) => {
      if (err) console.error('❌ Error al suscribirse a impinj/inventory:', err);
      else console.log('📡 Suscrito a topic: impinj/inventory');
    });
    
    client.subscribe('impinj/tag', (err) => {
      if (err) console.error('❌ Error al suscribirse a impinj/tag:', err);
      else console.log('📡 Suscrito a topic: impinj/tag');
    });
    
    client.subscribe('impinj/reads', (err) => {
      if (err) console.error('❌ Error al suscribirse a impinj/reads:', err);
      else console.log('📡 Suscrito a topic: impinj/reads');
    });
    
    // Topic general para cualquier mensaje (para debugging)
    client.subscribe('#', (err) => {
      if (err) console.error('❌ Error al suscribirse a topic global (#):', err);
      else console.log('📡 Suscrito a topic global para debugging: #');
    });
    
    // Imprimir mensaje para verificar
    console.log('🔍 Sistema suscrito a múltiples topics para intentar capturar los EPCs');
  });

  // Evento de mensaje
  client.on('message', (topic, message) => {
    try {
      console.log(`📥 MENSAJE MQTT RECIBIDO en topic: ${topic}`);
      console.log(`📄 CONTENIDO COMPLETO: ${message.toString()}`);
      
      // Comprobar inmediatamente si el mensaje puede contener EPCs (en formato de texto)
      const messageStr = message.toString();
      if (messageStr.includes('epc') || messageStr.includes('EPC') || 
          messageStr.includes('tag') || messageStr.includes('Tag') ||
          messageStr.includes('rfid') || messageStr.includes('RFID')) {
        console.log('🚨 POSIBLE EPC DETECTADO en mensaje texto');
      }
      
      // Intentar parsear el mensaje como JSON
      let data;
      try {
        data = JSON.parse(messageStr);
        console.log('✅ Mensaje JSON válido');
        
        // EMITIR EL MENSAJE INMEDIATAMENTE PARA DEPURACIÓN
        io.emit('mqtt_raw', { 
          topic, 
          data,
          timestamp: new Date().toISOString() 
        });
        
        // Verificación rápida para ver si hay EPCs en el mensaje
        const jsonStr = JSON.stringify(data);
        if (jsonStr.includes('epc') || jsonStr.includes('EPC') || 
            jsonStr.includes('tag') || jsonStr.includes('Tag')) {
          console.log('🚨 POSIBLE EPC DETECTADO en JSON');
        }
        
      } catch (parseError) {
        console.log('⚠️ El mensaje no es JSON válido, usándolo como texto plano');
        data = { rawMessage: messageStr };
        
        // Aun así emitimos el mensaje para depuración
        io.emit('mqtt_raw_text', { 
          topic, 
          text: messageStr,
          timestamp: new Date().toISOString() 
        });
      }
      
      // PROCESAMIENTO DE TOPIC ESPECÍFICO DE IMPINJ R700
      
      // Procesamiento para topics principales
      if (topic === 'impinj/tag' || topic === 'impinj/inventory' || 
          topic === 'impinj/reads' || topic.includes('tag') || 
          topic.includes('inventory')) {
        console.log('🔍 TOPIC DE INVENTORY/TAG DETECTADO');
        
        // Intentar extraer EPCs del mensaje de cualquier forma posible
        // La función extractAndProcessEpcs debe implementarse
        try {
          // Se enviará todo el mensaje al cliente para mostrar los EPCs
          console.log('📤 Enviando datos de tags al cliente');
          io.emit('tag_data', {
            topic,
            data,
            timestamp: new Date().toISOString()
          });
          
          // Si es un objeto, buscar recursivamente
          if (typeof data === 'object' && data !== null) {
            searchForEpc(data, io);
          }
        } catch (err) {
          console.error('Error procesando EPCs:', err);
        }
      }
      
      // Procesamiento según tipo de topic (estructura original)
      else if (topic.includes('/inventory')) {
        processInventoryMessage(data, io);
      } 
      // Intento directo con estructura esperada (si el lector usa otro formato)
      else if (data.eventType === 'tagInventory' || data.tagInventoryEvent) {
        console.log('🔍 Detectada estructura de inventario en otro topic');
        processInventoryMessage(data, io);
      }
      // Si hay una propiedad epcHex en cualquier nivel (más flexible)
      else if (data.epcHex || (data.tagEvent && data.tagEvent.epcHex)) {
        console.log('🔍 Detectado EPC en formato alternativo');
        const epcHex = data.epcHex || data.tagEvent.epcHex;
        processInventoryMessage({eventType: 'tagInventory', tagInventoryEvent: {epcHex}}, io);
      }
      else if (topic.includes('/gpos/events')) {
        // Procesar eventos de GPOs si es necesario
      }
      else if (topic.includes('/operations')) {
        // Procesar comandos de operaciones si es necesario
      }
      else {
        // Para cualquier otro topic, revisar si hay un EPC en el mensaje
        console.log('🔎 Revisando mensaje para detectar posibles EPCs');
        
        // Si es un objeto, buscar propiedades que puedan contener un EPC
        if (typeof data === 'object' && data !== null) {
          // Buscar recursivamente propiedades que puedan contener un EPC
          searchForEpc(data, io);
        }
      }
    } catch (error) {
      console.error('⚠️ Error al procesar mensaje:', error);
      
      // Publicar el error
      const lectorId = extractLectorIdFromTopic(topic);
      if (lectorId) {
        publishError(lectorId, 'message_processing_error', error.message);
      }
    }
  });

  // Eventos de error
  client.on('error', (error) => {
    console.error('⚠️ Error MQTT:', error);
  });

  client.on('close', () => {
    console.log('❌ Conexión MQTT cerrada');
  });

  return client;
};

// Extraer el ID del lector del topic
function extractLectorIdFromTopic(topic) {
  // Formato esperado: readers/{reader_id}/...
  const parts = topic.split('/');
  if (parts.length >= 2 && parts[0] === 'readers') {
    return parts[1];
  }
  return null;
}

// Función para buscar recursivamente EPCs en un objeto
function searchForEpc(obj, io, depth = 0, maxDepth = 8) {
  if (depth > maxDepth) return; // Evitar recursión infinita
  
  // Si es un array, buscar en cada elemento
  if (Array.isArray(obj)) {
    obj.forEach(item => {
      if (item && typeof item === 'object') {
        searchForEpc(item, io, depth + 1, maxDepth);
      }
    });
    return;
  }
  
  // Buscar en propiedades del objeto
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      // Si el valor es una cadena con características de EPC (más flexible)
      if (typeof value === 'string' && 
          (value.length >= 8 && /^[0-9A-F]+$/i.test(value))) {
        console.log(`🔍 Posible EPC string encontrado: ${value} (key: ${key})`);
        
        // Mínimo 8 caracteres para evitar falsos positivos, pero procesamos
        // cualquier string que parezca un EPC (hexadecimal)
        processEpcHex(value, io);
      }
      
      // Si el nombre de la propiedad sugiere que es un EPC
      if (/epc|tag|rfid|tid/i.test(key) && typeof value === 'string') {
        console.log(`🔍 Posible EPC encontrado en propiedad '${key}': ${value}`);
        processEpcHex(value, io);
      }
      
      // Recursivamente buscar en objetos anidados
      if (value && typeof value === 'object') {
        searchForEpc(value, io, depth + 1, maxDepth);
      }
    }
  }
}

// Procesar mensajes de inventario
function processInventoryMessage(data, io) {
  // Manejar diferentes formatos: 1. Estructura Impinj estándar
  if (data.eventType === 'tagInventory' && data.tagInventoryEvent && data.tagInventoryEvent.epcHex) {
    const { epcHex } = data.tagInventoryEvent;
    processEpcHex(epcHex, io);
  } 
  // 2. Formato directo con epcHex en el objeto principal
  else if (data.epcHex && typeof data.epcHex === 'string') {
    processEpcHex(data.epcHex, io);
  }
  // 3. Formato con EPC en tagEvent
  else if (data.tagEvent && data.tagEvent.epcHex) {
    processEpcHex(data.tagEvent.epcHex, io);
  }
  // 4. Buscar cualquier propiedad que pueda contener un EPC
  else {
    console.log('🔍 Formato desconocido, buscando EPCs en el mensaje');
    searchForEpc(data, io);
  }
}

// Procesar un EPC específico
function processEpcHex(epcHex, io) {
  // Registrar cada EPC recibido en logs
  console.log(`📌 EPC recibido del lector: ${epcHex}`);
  
  try {
    // Procesar el EPC recibido (si epcService está disponible)
    let resultado;
    try {
      resultado = epcService.procesarEpc(epcHex);
    } catch (error) {
      console.error('Error al procesar EPC con epcService:', error);
      // Fallback: Si hay un error en el servicio, creamos un resultado manual
      resultado = {
        valido: true, // Consideramos todos válidos para pruebas
        info: {
          rfid: epcHex,
          timestamp: new Date().toISOString(),
          nombreProducto: `Producto ${epcHex.substring(0, 6)}`
        }
      };
    }

    // EMITIR EL EPC INDEPENDIENTEMENTE DEL RESULTADO
    // Esto es crucial para depuración - enviamos todos los EPCs detectados
    console.log(`🔄 Emitiendo EPC al frontend: ${epcHex}`);
    
    // Emitir como evento 'rfidTagDetected' (nuevo evento genérico)
    io.emit('rfidTagDetected', {
      epc: epcHex,
      valid: true,
      timestamp: new Date().toISOString()
    });
    
    // Emitir en formato readers/X/inventory para compatibilidad con frontend
    io.emit('readers/reader1/inventory', {
      type: 'epc_read',
      epc: epcHex,
      valid: true,
      timestamp: new Date().toISOString()
    });
    
    // Si el procesamiento determinó que es válido
    if (resultado && resultado.valido) {
      // EPC válido - emitir como epcDetectado con toda la info disponible
      console.log('🎯 Tarima válida detectada:', resultado.info);
      io.emit('epcDetectado', {
        rfid: epcHex, // Asegurar que siempre está presente
        ...resultado.info
      });
    } else {
      // EPC no válido
      console.log(`⛔ EPC no identificado: ${epcHex}`);
      io.emit('epcNoIdentificado', { 
        epc: epcHex,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error crítico procesando EPC:', error);
    
    // Aún así intentamos emitir el EPC para que el frontend lo muestre
    io.emit('epcDetectado', {
      rfid: epcHex,
      timestamp: new Date().toISOString(),
      nombreProducto: 'Producto sin procesar'
    });
  }
}

// Publicar estado del backend
function publishBackendStatus(lectorId, status) {
  if (!client) return;
  
  const topic = mqttConfig.getTopic('status', lectorId);
  const message = {
    type: 'backend_status',
    status: status,
    timestamp: new Date().toISOString(),
    backendId: mqttConfig.clientId
  };
  
  client.publish(topic, JSON.stringify(message));
  console.log(`📤 Estado del backend publicado en ${topic}`);
}

// Publicar error
function publishError(lectorId, errorType, errorMessage) {
  if (!client) return;
  
  const topic = mqttConfig.getTopic('errors', lectorId);
  const message = {
    type: errorType,
    message: errorMessage,
    timestamp: new Date().toISOString()
  };
  
  client.publish(topic, JSON.stringify(message));
  console.log(`📤 Error publicado en ${topic}`);
}

// Publicar evento de inventario
exports.publishInventoryEvent = (lectorId, epc, isValid, additionalInfo = {}) => {
  if (!client) return;
  
  const topic = mqttConfig.getTopic('inventory', lectorId);
  const message = {
    type: 'epc_read',
    epc: epc,
    valid: isValid,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  };
  
  client.publish(topic, JSON.stringify(message));
};

// Publicar evento de GPO
exports.publishGpoEvent = (lectorId, gpoNumber, state) => {
  if (!client) return;
  
  const topic = mqttConfig.getTopic('gpos', lectorId);
  const message = {
    type: 'gpo_state_change',
    gpo: gpoNumber,
    state: state,
    timestamp: new Date().toISOString()
  };
  
  client.publish(topic, JSON.stringify(message));
};

// Publicar estado del lector
exports.publishLectorStatus = (lectorId, status) => {
  if (!client) return;
  
  const topic = mqttConfig.getTopic('status', lectorId);
  const message = {
    type: 'reader_status',
    status: status,
    timestamp: new Date().toISOString()
  };
  
  client.publish(topic, JSON.stringify(message));
};

// Publicar una operación
exports.publishOperation = (lectorId, operation, details = {}) => {
  if (!client) return;
  
  const topic = mqttConfig.getTopic('operations', lectorId);
  const message = {
    type: operation,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  client.publish(topic, JSON.stringify(message));
};

// Desconectar MQTT
exports.disconnectMqtt = () => {
  if (client) {
    // Publicar estado de desconexión antes de cerrar
    publishBackendStatus('reader1', 'disconnected');
    publishBackendStatus('reader2', 'disconnected');
    
    // Dar tiempo a que se envíen los mensajes
    setTimeout(() => {
      client.end();
      client = null;
    }, 500);
    
    return true;
  }
  return false;
};

// Añadir al final del archivo
exports.sendTestEpc = (io) => {
  console.log('🧪 Enviando EPC de prueba al frontend');
  
  // Crear un EPC aleatorio para pruebas
  const randomEpc = Array(24).fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16).toUpperCase())
    .join('');
  
  // Emitir como un EPC detectado
  io.emit('epcDetectado', {
    rfid: randomEpc,
    timestamp: new Date().toISOString(),
    nombreProducto: 'Producto de Prueba',
    lectorId: 'reader1'
  });
  
  // Emitir también en formato inventory
  io.emit('readers/reader1/inventory', {
    type: 'epc_read',
    epc: randomEpc,
    valid: true,
    timestamp: new Date().toISOString()
  });
  
  return randomEpc;
};

// Exportar el cliente para uso en otros módulos
exports.getClient = () => client;