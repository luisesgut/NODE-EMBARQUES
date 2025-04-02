// middleware/auth.js
// Middleware de autenticación (opcional para futuras expansiones)
const auth = (req, res, next) => {
    // Verificar si hay un encabezado de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Se requiere autenticación' });
    }
    
    try {
      // Aquí puedes implementar tu lógica de autenticación
      // Por ejemplo, verificar un token JWT
      
      // Para este ejemplo, simplemente verificamos un token básico
      if (authHeader !== 'Bearer api-key-example') {
        return res.status(403).json({ error: 'Token inválido' });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Error de autenticación' });
    }
  };
  
  module.exports = auth;