const express = require('express')
const router = express.Router()

const preguntasController = require('../controller/preguntas_controller')

const authMiddleware = require('../middleware/authMiddleware')



router.get('/preguntas',authMiddleware,preguntasController.mostrarPreguntas)



 
module.exports = router