// controllers/gpoController.js
const gpoService = require('../services/gpoService');

// Configurar GPOs específicos
exports.configureGpos = async (req, res, next) => {
  try {
    const { gpo1, gpo3 } = req.body;
    
    // Validar los estados
    if (gpo1 !== 'high' && gpo1 !== 'low' && gpo1 !== undefined) {
      return res.status(400).json({ error: 'Estado de GPO1 inválido. Use "high" o "low"' });
    }
    
    if (gpo3 !== 'high' && gpo3 !== 'low' && gpo3 !== undefined) {
      return res.status(400).json({ error: 'Estado de GPO3 inválido. Use "high" o "low"' });
    }
    
    // Configuración
    const gpoConfigurations = [];
    
    if (gpo1 !== undefined) {
      gpoConfigurations.push({ gpo: 1, state: gpo1 });
    }
    
    if (gpo3 !== undefined) {
      gpoConfigurations.push({ gpo: 3, state: gpo3 });
    }
    
    if (gpoConfigurations.length === 0) {
      return res.status(400).json({ error: 'Debe especificar al menos un GPO para configurar' });
    }
    
    await gpoService.configureGpos(gpoConfigurations);
    res.json({ success: true, message: 'GPOs configurados correctamente' });
  } catch (error) {
    next(error);
  }
};

// Activar GPOs 1 y 3
exports.activarGpos = async (req, res, next) => {
  try {
    // Opcionalmente puedes recibir la duración de activación
    const duracion = req.body.duracion || 3000; // Duración en ms, default 3 segundos
    
    await gpoService.activarGpos(duracion);
    res.json({ success: true, message: `GPOs 1 y 3 activados por ${duracion}ms` });
  } catch (error) {
    next(error);
  }
};

// Desactivar GPOs 1 y 3
exports.desactivarGpos = async (req, res, next) => {
  try {
    await gpoService.desactivarGpos();
    res.json({ success: true, message: 'GPOs 1 y 3 desactivados' });
  } catch (error) {
    next(error);
  }
};