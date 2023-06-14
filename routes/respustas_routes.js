const express = require('express')
const router = express.Router()

const preguntasController = require('../controller/respuestas_controller')




router.post('/guardarRespuestaAsesor',preguntasController.guardarRespuestaAsesor)



 
module.exports = router