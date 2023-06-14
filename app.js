// 1 - Invocamos a Express
const express = require('express');
const app = express();
const userViews = require('./views/user_views')
const userRoutes = require('./routes/user_routes')
const globalRoutes = require('./routes/global_routes')
const preguntasRoutes = require('./routes/preguntas_routes')
const respuestasRoutes =require('./routes/respustas_routes')
//definimos un puerto
const port = 3000
// Gestion de log
const winston = require ('winston')
const logger = require ('./log/logger')



//2 - Para poder capturar los datos del formulario (sin urlencoded nos devuelve "undefined")
app.use(express.urlencoded({extended:false}));
app.use(express.json());//además le decimos a express que vamos a usar json



//4 -seteamos el directorio de assets
app.use('/resources',express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//5 - Establecemos el motor de plantillas
app.set('view engine','ejs');

// aca usamos las constantes que conrtienen las rutas
app.use(globalRoutes)
app.use(userRoutes)
app.use(preguntasRoutes)
app.use(respuestasRoutes)




// funcion que permite que se ejecute escuchando en el puerto designado arriba en este caso 3000
// y a su vez permite conectarse en produccion automaticamente al puerto disponible

app.listen(port, () => {
    logger.info( new Date().toLocaleString() +' :  ' +`Servidor escuchando en el puerto:  ${port}`)
  })