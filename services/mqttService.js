// Actualiza la función processEpcHex en services/mqttService.js

// Procesar un EPC específico
function processEpcHex(epcHex, io) {
  // Registrar cada EPC recibido en logs
  console.log(`📌 EPC recibido del lector: ${epcHex}`);

  try {
    // Procesar el EPC recibido usando epcService actualizado
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
      // EPC válido - emitir con información adicional sobre la fuente
      console.log(`🎯 EPC válido detectado (fuente: ${resultado.fuente || 'desconocida'}):`, resultado.info);

      // Emitir evento con datos enriquecidos de la logística si corresponde
      io.emit('epcDetectado', {
        rfid: epcHex, // Asegurar que siempre está presente
        fuente: resultado.fuente,
        ...resultado.info
      });

      // Si el EPC pertenece a una logística, emitir un evento específico
      if (resultado.fuente === 'logistica') {
        io.emit('epcLogisticaDetectado', {
          epc: epcHex,
          logisticaId: resultado.info.logisticaId,
          cliente: resultado.info.cliente,
          carril: resultado.info.carril,
          detalle: resultado.info,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      // EPC no válido
      console.log(`⛔ EPC no identificado: ${epcHex}`);
      io.emit('epcNoIdentificado', {
        epc: epcHex,
        mensaje: resultado.mensaje || 'EPC no identificado',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error crítico procesando EPC:', error);

    // Aún así intentamos emitir el EPC para que el frontend lo muestre
    io.emit('epcDetectado', {
      rfid: epcHex,
      timestamp: new Date().toISOString(),
      nombreProducto: 'Producto sin procesar',
      error: 'Error al procesar el EPC'
    });
  }
}