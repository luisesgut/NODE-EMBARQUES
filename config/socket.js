// config/socket.js
const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io = null;

exports.initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Puedes restringir a tu dominio
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Cliente conectado: ${socket.id}`);

    // Eventos que el cliente puede emitir al servidor

    // El cliente puede solicitar asignar un carril a una logística
    socket.on('asignarCarril', async (data) => {
      try {
        // Importar el servicio de logística
        const logisticaService = require('../services/logisticaService');

        if (!data || !data.logisticaId || !data.carril) {
          socket.emit('error', {
            mensaje: 'Se requiere logisticaId y carril para asignar un carril',
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Convertir a números si vienen como strings
        const logisticaId = parseInt(data.logisticaId, 10);
        const carril = parseInt(data.carril, 10);

        if (isNaN(logisticaId) || isNaN(carril)) {
          socket.emit('error', {
            mensaje: 'logisticaId y carril deben ser números',
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Asignar carril
        const resultado = await logisticaService.asignarCarril(logisticaId, carril);

        if (resultado) {
          // La notificación a todos los clientes ya la hace el servicio

          // Responder solo al cliente que hizo la solicitud
          socket.emit('asignarCarrilRespuesta', {
            success: true,
            logisticaId,
            carril,
            mensaje: `Carril ${carril} asignado a logística ${logisticaId}`,
            timestamp: new Date().toISOString()
          });
        } else {
          socket.emit('error', {
            mensaje: `No se encontró la logística ${logisticaId}`,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        logger.error(`Error al asignar carril desde socket: ${error.message}`);
        socket.emit('error', {
          mensaje: `Error al procesar la solicitud: ${error.message}`,
          timestamp: new Date().toISOString()
        });
      }
    });

    // El cliente solicita refrescar los datos de logística
    socket.on('refrescarLogisticas', async () => {
      try {
        // Importar el servicio de logística
        const logisticaService = require('../services/logisticaService');

        // Consultar nuevamente las logísticas
        await logisticaService.consultarLogisticas();

        // Responder al cliente
        socket.emit('logisticasRefrescadas', {
          success: true,
          mensaje: 'Datos de logística actualizados',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error(`Error al refrescar logísticas desde socket: ${error.message}`);
        socket.emit('error', {
          mensaje: `Error al refrescar logísticas: ${error.message}`,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Evento de desconexión
    socket.on('disconnect', () => {
      logger.info(`Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

exports.io = () => io;