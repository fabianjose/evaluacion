// Invocamos a logger
const logger = require ('../log/logger')

//-Invocamos a bcrypt
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './.env'});
//Invocamos a la conexion de la DB
const session = require('express-session');
const nodemailer = require('nodemailer');
const enviarCorreo = require('../template/nueva-notificacion');

//creacmos un objeto de controlador que contendra todas las funciones proximas
const controller = {}

// Importa los modelos y las bibliotecas necesarias

const db = require('../database/db'); // Importa la conexión a la base de datos

// Controlador para obtener las preguntas y renderizar la vista
controller.mostrarPreguntas = (req, res) => {

  const enviado = req.session.enviado
  // Realiza la consulta a la base de datos para obtener las preguntas
  const query = 'SELECT * FROM preguntas';

  db.query(query, (err, result) => {
    if (err) {
      // Manejo del error
      console.log(err);
      return res.status(500).send('Error en la consulta de preguntas');
    }


    // Obtén las preguntas del resultado de la consulta
    const questions = result;
    console.log(questions);
    // Renderiza la vista de preguntas y pasa las preguntas como datos
    res.render('preguntas/preguntascolaborador', { questions,enviado });
  });
};
module.exports = controller