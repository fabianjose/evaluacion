const express = require('express')
const router = express.Router()

const preguntasController = require('../controller/preguntas_controller')




router.get('/preguntas',preguntasController.mostrarPreguntas)



 
module.exports = router