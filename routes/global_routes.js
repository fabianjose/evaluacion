const express = require('express')
const router = express.Router()
const controllerGlobal = require ('../controller/controladores_globales')


//7- variables de session
const session = require('express-session');
router.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));


//12 - Método para controlar que está auth en todas las páginas
router.get('/', controllerGlobal.home);



module.exports = router