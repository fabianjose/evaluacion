// Invocamos a logger
const logger = require('../log/logger')

//-Invocamos a bcrypt
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({
  path: './.env'
});
//Invocamos a la conexion de la DB
const session = require('express-session');
const nodemailer = require('nodemailer');
const enviarCorreo = require('../template/nueva-notificacion');
const db = require('../database/db');

const controller = {};

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
  Object.entries(respuestas).forEach(([preguntaId, valorRespuesta]) => {
    const usuarioId = req.session.identificador; // Asigna el ID del usuario actual, suponiendo que se haya autenticado previamente
    console.log(usuarioId + '  id de usuario');
    db.query(query, [usuarioId, preguntaId, valorRespuesta], (err, result) => {
      if (err) {
        // Manejo del error
        console.log(err);
        return res.status(500).send('Error al guardar las respuestas');
      }

      const enviado = 1

     

      
        
        const query2 = `UPDATE users SET enviado = ${enviado} WHERE ID = ${usuarioId}`;
        
        db.query(query2, function(error, results, fields) {
          if (error) {
            console.log("Error al modificar el valor de enviado:", error);
          } else {
            console.log("Valor de enviado modificado correctamente");
        
            // Cierra la conexión a la base de datos después de ejecutar la consulta
          
          }
        });
        
    });

  });









  // Redirige o envía una respuesta de éxito
  res.render('login', {
    alert: true,
    alertTitle: 'Envio exitoso',
    alertMessage: '¡Guardado CORRECTO!',
    alertIcon: 'success',
    showConfirmButton: false,
    timer: 1500,
    ruta: ''
  }) // Puedes redirigir a otra página o enviar una respuesta de éxito, según tus necesidades
};
controller.mostrarRespuestas = (req, res) => {
  const enviado = req.session.enviado;
  
  // Realiza la consulta a la base de datos para obtener las respuestas con la información relacionada
  const query = `SELECT
    u.nombre AS Usuario,
    p.Pregunta,
    r.ValorRespuesta AS Respuesta,
    c.Categoria,
    ca.Campana
  FROM
    users u
  LEFT JOIN
    respuestas r ON u.id = r.UsuarioID
  LEFT JOIN
    preguntas p ON r.PreguntaID = p.ID
  LEFT JOIN
    categorias c ON p.CategoriaID = c.ID
  LEFT JOIN
    campana ca ON u.CampanaID = ca.ID`;
  
  db.query(query, (err, result) => {
    if (err) {
      // Manejo del error
      console.log(err);
      return res.status(500).send('Error en la consulta de respuestas');
    }
    console.log(
      result
    );
    // Obtén las respuestas del resultado de la consulta
    const respuestas = JSON.parse(JSON.stringify(result));
    // Renderiza la vista de respuestas y pasa las respuestas como datos
    res.render('respuestas/respuestas', { respuestas });
  });
};
module.exports = controller;
