'use strict'
const logger = require ('../log/logger')

const dotenv = require('dotenv');
dotenv.config({ path: './.env'});
const nodemailer = require('nodemailer')
require ('dotenv').config()

 function enviarCorreo(token, email, res) {
  try {
    const resetLink = `localhost:3000/resetpassword?token=${token}`;
    const mailOptions = {
      from: 'fabian@remotepcsolutions.com',
      to: email,
      subject: 'Recuperación de contraseña',
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink} `
    };
    let transporter = nodemailer.createTransport({
      pool: true,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true', // convertir a booleano
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);

        // Manejar el error de envío de correo electrónico
        logger.info(new Date().toLocaleString() + ' :  ' + 'Error al enviar el correo electrónico que contiene el token a ' + email + '');

        return res.status(500).json({ message: 'Error al enviar el correo electrónico' });
      }

      // Correo electrónico de recuperación de contraseña enviado con éxito
      logger.info(new Date().toLocaleString() + ' :  ' + 'Correo electrónico de recuperación de contraseña enviado con éxito contiene el token a ' + email + '');

      return res.status(200).json({ message: 'Correo electrónico enviado con éxito' });
    });
  } catch (error) {
    console.log(error);
    logger.info(new Date().toLocaleString() + ' :  ' + 'Error al enviar el correo electrónico a ' + email + ': ' + error);

    return res.status(500).json({ message: 'Error al enviar el correo electrónico. Intente de nuevo.' });
  }
} 

  
module.exports = enviarCorreo;
