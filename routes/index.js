// routes/index.js
const express = require('express');
const lectorRoutes = require('./lectorRoutes');
const gpoRoutes = require('./gpoRoutes');
const logisticaRoutes = require('./logisticaRoutes');
const mqttService = require('../services/mqttService');

const router = express.Router();

// Rutas del lector RFID
router.use('/lector', lectorRoutes);

// Rutas de los GPOs
router.use('/lector/gpos', gpoRoutes);

// Rutas de logística
router.use('/logistica', logisticaRoutes);

// Ruta para enviar EPC de prueba
router.get('/test-epc', (req, res) => {
    const io = req.app.locals.io; // Asumiendo que io está disponible como app.locals.io
    const epc = mqttService.sendTestEpc(io);
    res.json({ success: true, message: 'EPC de prueba enviado', epc });
});

module.exports = router;