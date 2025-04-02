const express = require('express');
const mqtt = require('mqtt');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const https = require('https');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Puedes restringir a tu dominio
    methods: ["GET", "POST"]
  }
});

const port = 3000;

// Auth del lector
const lectorHost = 'https://172.16.100.196';
const auth = {
  username: 'root',
  password: 'impinj'
};

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Función para activar los GPOs 1 y 3
async function activarGPOs() {
  try {
    await axios.put(
      `${lectorHost}/api/v1/device/gpos`,
      {
        gpoConfigurations: [
          { gpo: 1, state: 'high' },
          { gpo: 3, state: 'high' }
        ]
      },
      { auth, httpsAgent }
    );
    console.log('⚡ GPOs ACTIVADOS (1 y 3)');

    // Desactivarlos después de 3 segundos
    setTimeout(desactivarGPOs, 3000);
  } catch (err) {
    console.error('❌ Error al activar GPOs:', err.response?.data || err.message);
  }
}

async function desactivarGPOs() {
  try {
    await axios.put(
      `${lectorHost}/api/v1/device/gpos`,
      {
        gpoConfigurations: [
          { gpo: 1, state: 'low' },
          { gpo: 3, state: 'low' }
        ]
      },
      { auth, httpsAgent }
    );
    console.log('🔌 GPOs DESACTIVADOS (1 y 3)');
  } catch (err) {
    console.error('❌ Error al desactivar GPOs:', err.response?.data || err.message);
  }
}

// EPCs válidos
const detalleEPCs = [
  {
    claveProducto: 'PT00161',
    nombreProducto: 'VASO PLASTICO OK PASTELERÍA 12EU',
    pesoBruto: 0,
    pesoNeto: 0,
    piezas: 20,
    orden: '23221',
    claveUnidad: 'XBX',
    trazabilidad: '2601014737010',
    rfid: '0002601014737010'
  },
  {
    claveProducto: 'PT00161',
    nombreProducto: 'VASO PLASTICO OK PASTELERÍA 12EU',
    pesoBruto: 0,
    pesoNeto: 0,
    piezas: 20,
    orden: '23221',
    claveUnidad: 'XBX',
    trazabilidad: '2601014737009',
    rfid: '0002601014737009'
  },
  {
    claveProducto: 'PT00161',
    nombreProducto: 'VASO PLASTICO OK PASTELERÍA 12EU',
    pesoBruto: 0,
    pesoNeto: 0,
    piezas: 20,
    orden: '23221',
    claveUnidad: 'XBX',
    trazabilidad: '24010000140030',
    rfid: '00024010000140030'
  }
];

// Crear mapa para búsqueda rápida
const mapaEPC = new Map();
detalleEPCs.forEach(epc => mapaEPC.set(epc.rfid, epc));

// Conexión MQTT a EMQX Cloud
const client = mqtt.connect('mqtts://n4370ae9.ala.us-east-1.emqxsl.com:8883', {
  username: 'root',
  password: 'root',
  clientId: 'express-backend-luis',
  rejectUnauthorized: false
});

client.on('connect', () => {
  console.log('✅ Conectado a EMQX Cloud');
  client.subscribe('reader/events', (err) => {
    if (err) console.error('❌ Error al suscribirse:', err);
    else console.log('📡 Suscrito a topic: reader/events');
  });
});

client.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    if (data.eventType === 'tagInventory') {
      const { epcHex } = data.tagInventoryEvent;

      if (mapaEPC.has(epcHex)) {
        const info = mapaEPC.get(epcHex);
        console.log('🎯 Tarima válida detectada:', info);
        io.emit('epcDetectado', info);
      } else {
        console.log(`⛔ EPC no identificado: ${epcHex}`);
        io.emit('epcNoIdentificado', { epc: epcHex });
        activarGPOs();
      }
    }

  } catch (error) {
    console.error('⚠️ Error al procesar mensaje:', error);
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('🎯 Backend corriendo y escuchando EPCs');
});

// Iniciar servidor
server.listen(port, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${port}`);
});
