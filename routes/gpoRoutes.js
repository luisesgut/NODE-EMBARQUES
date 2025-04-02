// routes/gpoRoutes.js
const express = require('express');
const gpoController = require('../controllers/gpoController');

const router = express.Router();

/**
 * @swagger
 * /api/lector/gpos:
 *   post:
 *     summary: Configura los estados de los GPOs 1 y 3
 *     tags: [GPOs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GPOConfig'
 *     responses:
 *       200:
 *         description: GPOs configurados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error al configurar GPOs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', gpoController.configureGpos);

/**
 * @swagger
 * /api/lector/gpos/activar:
 *   post:
 *     summary: Activa los GPOs 1 y 3 por un tiempo determinado
 *     tags: [GPOs]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duracion:
 *                 type: number
 *                 description: Duración en milisegundos para mantener activos los GPOs
 *                 example: 3000
 *     responses:
 *       200:
 *         description: GPOs activados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       500:
 *         description: Error al activar GPOs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/activar', gpoController.activarGpos);

/**
 * @swagger
 * /api/lector/gpos/desactivar:
 *   post:
 *     summary: Desactiva los GPOs 1 y 3
 *     tags: [GPOs]
 *     responses:
 *       200:
 *         description: GPOs desactivados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       500:
 *         description: Error al desactivar GPOs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/desactivar', gpoController.desactivarGpos);

module.exports = router;