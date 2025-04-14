// controllers/logisticaController.js
const logisticaService = require('../services/logisticaService');

// Obtener todas las logísticas
exports.getLogisticas = async (req, res, next) => {
    try {
        // Si se especifica refresh=true, consultamos el API
        if (req.query.refresh === 'true') {
            const logisticas = await logisticaService.consultarLogisticas();
            return res.json(logisticas);
        }

        // Si no, devolvemos las logísticas en memoria
        const logisticas = logisticaService.getLogisticasActuales();
        res.json(logisticas);
    } catch (error) {
        next(error);
    }
};

// Iniciar el polling de logísticas
exports.iniciarPollingLogisticas = (req, res) => {
    const resultado = logisticaService.iniciarPollingLogisticas();
    res.json({
        success: resultado,
        message: 'Polling de logísticas iniciado'
    });
};

// Detener el polling de logísticas
exports.detenerPollingLogisticas = (req, res) => {
    const resultado = logisticaService.detenerPollingLogisticas();
    if (resultado) {
        res.json({ success: true, message: 'Polling de logísticas detenido' });
    } else {
        res.status(400).json({ error: 'No hay polling activo para detener' });
    }
};

// Asignar carril a una logística
exports.asignarCarril = async (req, res, next) => {
    try {
        const { logisticaId, carril } = req.body;

        // Validar parámetros
        if (!logisticaId || !carril) {
            return res.status(400).json({ error: 'Se requiere logisticaId y carril' });
        }

        // Convertir a números si vienen como strings
        const logisticaIdNum = parseInt(logisticaId, 10);
        const carrilNum = parseInt(carril, 10);

        if (isNaN(logisticaIdNum) || isNaN(carrilNum)) {
            return res.status(400).json({ error: 'logisticaId y carril deben ser números' });
        }

        if (carrilNum < 1 || carrilNum > 10) { // Asumiendo máximo 10 carriles
            return res.status(400).json({ error: 'Número de carril inválido (1-10)' });
        }

        // Asignar carril
        const resultado = await logisticaService.asignarCarril(logisticaIdNum, carrilNum);

        if (resultado) {
            res.json({
                success: true,
                message: `Carril ${carrilNum} asignado a logística ${logisticaIdNum}`
            });
        } else {
            res.status(404).json({
                error: `No se encontró la logística ${logisticaIdNum}`
            });
        }
    } catch (error) {
        next(error);
    }
};

// Verificar un EPC contra las logísticas actuales
exports.verificarEPC = (req, res, next) => {
    try {
        const { epc } = req.params;

        if (!epc) {
            return res.status(400).json({ error: 'Se requiere un EPC para verificar' });
        }

        const resultado = logisticaService.compararEPC(epc);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};