exports.mqttConfig = {
    brokerUrl: 'mqtts://n4370ae9.ala.us-east-1.emqxsl.com:8883',
    username: 'root',
    password: 'root',
    clientId: 'express-backend-luis',
    // Nuevos topics estructurados
    topics: {
      status: 'readers/{reader_id}/status',
      inventory: 'readers/{reader_id}/inventory',
      gpos: 'readers/{reader_id}/gpos/events',
      operations: 'readers/{reader_id}/operations',
      errors: 'readers/{reader_id}/errors',
      all: 'readers/{reader_id}/#' // Para suscribirse a todos los temas de un lector
    },
    // Función helper para obtener el topic formateado con el ID del lector
    getTopic: function(topicType, readerId = 'reader1') {
      if (!this.topics[topicType]) {
        throw new Error(`Tipo de topic '${topicType}' no definido`);
      }
      return this.topics[topicType].replace('{reader_id}', readerId);
    }
  };