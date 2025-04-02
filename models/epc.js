// models/epc.js

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
  
  // Crear mapa para búsqueda rápida con diferentes formatos de EPC
  const mapaEPC = new Map();
  
  // Agregar cada EPC en múltiples formatos al mapa
  detalleEPCs.forEach(epc => {
    // Formato original
    mapaEPC.set(epc.rfid, epc);
    
    // Sin ceros al inicio
    const sinCeros = epc.rfid.replace(/^0+/, '');
    mapaEPC.set(sinCeros, epc);
    
    // Formato con/sin prefijo '00'
    if (epc.rfid.startsWith('00')) {
      mapaEPC.set(epc.rfid.substring(2), epc);
    } else {
      mapaEPC.set('00' + epc.rfid, epc);
    }
    
    // Formato en mayúsculas (para códigos hexadecimales)
    mapaEPC.set(epc.rfid.toUpperCase(), epc);
    
    // Formato con prefijo 'E2'
    mapaEPC.set('E2' + epc.rfid, epc);
  });

  // Modo permisivo - siempre devuelve datos de ejemplo para cualquier código
  const modoPermisivo = true;
  const datosGenericos = detalleEPCs[0];
  
  // Exportar el modelo
  exports.epcModel = {
    detalleEPCs,
    mapaEPC,
    modoPermisivo,
    datosGenericos
  };