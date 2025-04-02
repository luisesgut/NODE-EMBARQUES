// config/swagger.js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Opciones de configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Control de Lector RFID',
      version: '1.0.0',
      description: 'API para controlar un lector RFID R700 Rain Reader',
      contact: {
        name: 'Tu Nombre',
        email: 'tu@email.com'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Servidor de desarrollo'
        }
      ]
    },
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            details: {
              type: 'string',
              description: 'Detalles adicionales del error'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si la operación fue exitosa',
              example: true
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo',
              example: 'Operación realizada con éxito'
            }
          }
        },
        EPC: {
          type: 'object',
          properties: {
            claveProducto: {
              type: 'string',
              example: 'PT00161'
            },
            nombreProducto: {
              type: 'string',
              example: 'VASO PLASTICO OK PASTELERÍA 12EU'
            },
            pesoBruto: {
              type: 'number',
              example: 0
            },
            pesoNeto: {
              type: 'number',
              example: 0
            },
            piezas: {
              type: 'number',
              example: 20
            },
            orden: {
              type: 'string',
              example: '23221'
            },
            claveUnidad: {
              type: 'string',
              example: 'XBX'
            },
            trazabilidad: {
              type: 'string',
              example: '2601014737010'
            },
            rfid: {
              type: 'string',
              example: '0002601014737010'
            }
          }
        },
        GPOConfig: {
          type: 'object',
          properties: {
            gpo1: {
              type: 'string',
              enum: ['high', 'low'],
              description: 'Estado del GPO 1'
            },
            gpo3: {
              type: 'string',
              enum: ['high', 'low'],
              description: 'Estado del GPO 3'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'] // Archivos donde buscar las anotaciones
};

// Generar especificación a partir de la configuración
const swaggerSpec = swaggerJsDoc(swaggerOptions);

// Middleware para configurar Swagger UI
const configureSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }'
  }));
  
  // Endpoint para obtener la especificación en formato JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('📚 Documentación Swagger disponible en /api-docs');
};

module.exports = { configureSwagger };