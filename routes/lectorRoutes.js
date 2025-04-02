// routes/lectorRoutes.js
const express = require('express');
const lectorController = require('../controllers/lectorController');

const router = express.Router();

/**
 * @swagger
 * /api/lector/status:
 *   get:
 *     summary: Obtiene el estado actual del lector RFID
 *     tags: [Lector]
 *     responses:
 *       200:
 *         description: Estado del lector obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deviceStatus:
 *                   type: string
 *                   example: "CONNECTED"
 *                 profileStatus:
 *                   type: string
 *                   example: "IDLE"
 *       500:
 *         description: Error al obtener el estado del lector
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/status', lectorController.getLectorStatus);

/**
 * @swagger
 * /api/lector/iniciar:
 *   post:
 *     summary: Inicia la lectura de RFID con un perfil específico
 *     tags: [Lector]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               perfil:
 *                 type: string
 *                 description: Nombre del perfil a utilizar (por defecto es "TEST")
 *                 example: "TEST"
 *     responses:
 *       200:
 *         description: Lectura iniciada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       500:
 *         description: Error al iniciar la lectura
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/iniciar', lectorController.iniciarLectura);

/**
 * @swagger
 * /api/lector/detener:
 *   post:
 *     summary: Detiene la lectura de RFID
 *     tags: [Lector]
 *     responses:
 *       200:
 *         description: Lectura detenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       500:
 *         description: Error al detener la lectura
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/detener', lectorController.detenerLectura);

/**
 * @swagger
 * /api/lector/mqtt:
 *   get:
 *     summary: Obtiene la configuración MQTT actual del lector
 *     tags: [MQTT]
 *     responses:
 *       200:
 *         description: Configuración MQTT obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Error al obtener la configuración MQTT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/mqtt', lectorController.getMqttConfig);

/**
 * @swagger
 * /api/lector/mqtt:
 *   put:
 *     summary: Actualiza la configuración MQTT del lector
 *     tags: [MQTT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brokerAddress:
 *                 type: string
 *                 example: "mqtts://broker.example.com:8883"
 *               clientId:
 *                 type: string
 *                 example: "rfid-reader-1"
 *               username:
 *                 type: string
 *                 example: "user"
 *               password:
 *                 type: string
 *                 example: "password"
 *     responses:
 *       200:
 *         description: Configuración MQTT actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       500:
 *         description: Error al actualizar la configuración MQTT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/mqtt', lectorController.updateMqttConfig);

/**
 * @swagger
 * /api/lector/iniciarPolling:
 *   post:
 *     summary: Inicia el polling de status del lector
 *     tags: [Polling]
 *     description: Inicia un proceso que consulta el estado del lector cada 3 segundos y lo emite por WebSocket
 *     responses:
 *       200:
 *         description: Polling iniciado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post('/iniciarPolling', lectorController.iniciarStatusPolling);

/**
 * @swagger
 * /api/lector/detenerPolling:
 *   post:
 *     summary: Detiene el polling de status del lector
 *     tags: [Polling]
 *     responses:
 *       200:
 *         description: Polling detenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: No hay polling activo para detener
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/detenerPolling', lectorController.detenerStatusPolling);

/**
 * @swagger
 * /api/lector/configurarMqttTags:
 *   post:
 *     summary: Configura MQTT en el lector específicamente para la captura óptima de tags
 *     tags: [MQTT, RFID]
 *     description: Aplica una configuración MQTT optimizada para la captura de tags RFID con QoS 1 (al menos una entrega)
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lectorId:
 *                 type: string
 *                 description: ID del lector a configurar
 *                 example: "reader1"
 *               brokerUrl:
 *                 type: string
 *                 description: URL del broker MQTT (incluyendo protocolo y puerto)
 *                 example: "mqtts://broker.example.com:8883"
 *               clientId:
 *                 type: string
 *                 description: ID de cliente para el lector
 *                 example: "impinj-reader1"
 *               username:
 *                 type: string
 *                 description: Nombre de usuario para autenticación MQTT
 *                 example: "root"
 *               password:
 *                 type: string
 *                 description: Contraseña para autenticación MQTT
 *                 example: "password"
 *     responses:
 *       200:
 *         description: Configuración MQTT optimizada aplicada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Configuración MQTT optimizada para tags aplicada al lector reader1"
 *                 config:
 *                   type: object
 *                   properties:
 *                     brokerUrl:
 *                       type: string
 *                       example: "mqtts://broker.example.com:8883"
 *                     topicRoot:
 *                       type: string
 *                       example: "impinj/reader1"
 *                     clientId:
 *                       type: string
 *                       example: "impinj-reader1"
 *       500:
 *         description: Error al aplicar la configuración
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/configurarMqttTags', lectorController.configureMqttForTags);

module.exports = router;