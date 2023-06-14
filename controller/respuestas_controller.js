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
const db = require('../database/db');

//creacmos un objeto de controlador que contendra todas las funciones proximas
const controller = {}


controller.guardarRespuestaAsesor = (req, res) => {
  // Obtén las respuestas enviadas en el formulario
  const respuestas = req.body;
  console.log(respuestas);

  // Verifica si se enviaron respuestas
  if (!respuestas) {
    return res.status(400).send('No se han proporcionado respuestas');
  }

  // Realiza la inserción de las respuestas en la base de datos
  const query = 'INSERT INTO respuestas (UsuarioID, PreguntaID, ValorRespuesta) VALUES (?, ?, ?)';

  // Itera sobre cada respuesta para ejecutar la inserción
  respuestas.forEach((respuesta) => {
    const { preguntaId, valorRespuesta } = respuesta;
    const usuarioId = req.user.id; // Asigna el ID del usuario actual, suponiendo que se haya autenticado previamente

    db.query(query, [usuarioId, preguntaId, valorRespuesta], (err, result) => {
      if (err) {
        // Manejo del error
        console.log(err);
        return res.status(500).send('Error al guardar las respuestas');
      }
    });
  });

  // Redirige o envía una respuesta de éxito
  res.redirect('/preguntas'); // Puedes redirigir a otra página o enviar una respuesta de éxito, según tus necesidades
};


module.exports = controller