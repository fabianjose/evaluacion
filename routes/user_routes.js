const express = require('express')
const router = express.Router()

const userController = require('../controller/user_controller')






//9 - establecemos las rutas
	router.get('/login',userController.login)

	router.get('/register',userController.register)

//10 - Método para la REGISTRACIÓN
router.post('/register', userController.postregister)



//11 - Metodo para la autenticacion
router.post('/auth', userController.auth);




//función para limpiar la caché luego del logout
router.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

 //Logout
//Destruye la sesión.
router.get('/logout', userController.logout);

router.post('/forgot-password', userController.recuperarPassword);
router.get('/recuperacion', userController.recuperacion);



// Ruta para la página de restablecimiento de contraseña
router.get('/resetpassword', userController.resetPassword);
//router.get('/resetpassword', userController.resetPassword);

// Ruta para procesar el formulario de restablecimiento de contraseña
router.post('/reset-password', userController.updatePassword);

 
module.exports = router