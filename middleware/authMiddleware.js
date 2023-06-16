// authMiddleware.js

// Middleware para verificar si el usuario ha iniciado sesión
const requireLogin = (req, res, next) => {
    if (req.session.loggedin) {
      // El usuario ha iniciado sesión, permitir el acceso a la siguiente ruta
      next();
    } else {
      // El usuario no ha iniciado sesión, redirigir a la página de inicio de sesión
      res.redirect('/login');
    }
  };
  
  module.exports = requireLogin;
  