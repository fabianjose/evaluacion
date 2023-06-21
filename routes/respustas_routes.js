const express = require('express')
const router = express.Router()

const respuestas_controller = require('../controller/respuestas_controller')




router.get('/mostrarrespuestas',respuestas_controller.mostrarRespuestas)


 
module.exports = router