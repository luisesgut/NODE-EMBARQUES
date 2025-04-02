// routes/index.js
const express = require('express');
const lectorRoutes = require('./lectorRoutes');
const gpoRoutes = require('./gpoRoutes');

const router = express.Router();

// Rutas del lector RFID
router.use('/lector', lectorRoutes);

// Rutas de los GPOs
router.use('/lector/gpos', gpoRoutes);
// En cualquier ruta de tu API
router.get('/test-epc', (req, res) => {
    const epc = mqttService.sendTestEpc(io); // io debe estar disponible
    res.json({ success: true, message: 'EPC de prueba enviado', epc });
  });

module.exports = router;