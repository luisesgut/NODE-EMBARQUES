// config/index.js
const { lectorConfig } = require('./lector');
const { mqttConfig } = require('./mqtt');
const socket = require('./socket');

module.exports = {
  lectorConfig,
  mqttConfig,
  socket
};