// Invocamos a los módulos necesarios
const logger = require('../log/logger');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const connection = require('../database/db');
const session = require('express-session');
const nodemailer = require('nodemailer');
const enviarCorreo = require('../template/nueva-notificacion');

// Creamos un objeto controlador que contendrá todas las funciones
const controller = {};

// Controlador que redirecciona al formulario de inicio de sesión
controller.login = (req, res) => {
    logger.info(new Date().toLocaleString() + ' :  ' + 'Visitante accedió al formulario de inicio de sesión');
    res.render('login');
};

// Controlador que redirecciona al formulario de registro
controller.register = (req, res) => {
    logger.info(new Date().toLocaleString() + ' :  ' + 'Visitante accedió al formulario de registro');
    res.render('register');
};

// Controlador que maneja el registro de usuarios
controller.postregister = async (req, res) => {
    const email = req.body.email;
    const nombre = req.body.nombre;
    const rol = req.body.rol;
    const password = req.body.password;
    let passwordHash = await bcrypt.hash(password, 8);

    connection.query('INSERT INTO users SET ?', { email: email, password: passwordHash, nombre: nombre, rol: rol }, async (error, results) => {
        if (error) {
            console.log(error);
            console.log('Usuario existente');
            logger.info(new Date().toLocaleString() + ' :  ' + 'El visitante no pudo registrarse porque el usuario ya existe');
            res.render('register', {
                alert: true,
                alertTitle: 'Usuario Existente',
                alertMessage: '¡Fallo de registro!',
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 3500,
                ruta: 'register'
            });
        } else {
            logger.info(new Date().toLocaleString() + ' :  ' + 'El visitante se registró con éxito para el usuario: ' + email);
            res.render('register', {
                alert: true,
                alertTitle: 'Registration',
                alertMessage: '¡Successful Registration!',
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: ''
            });
        }
    });
};

// Controlador que maneja la autenticación de usuarios
controller.auth = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    let passwordHash = await bcrypt.hash(password, 8);

    if (email && password) {
        connection.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (results.length == 0 || !(await bcrypt.compare(password, results[0].password))) {
                logger.info(new Date().toLocaleString() + ' :  ' + 'El visitante intentó iniciar sesión con el usuario ' + email + ' pero falló');
                res.render('login', {
                    alert: true,
                    alertTitle: 'Error',
                    alertMessage: 'USUARIO y/o PASSWORD incorrectas',
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            } else {
                logger.info(new Date().toLocaleString() + ' :  ' + 'El visitante inició sesión con éxito con el usuario ' + email);
                req.session.loggedin = true;
                req.session.identificador = results[0].id;
                req.session.email = results[0].email;
                req.session.enviado = results[0].enviado;


                res.render('login', {
                    alert: true,
                    alertTitle: 'Conexión exitosa',
                    alertMessage: '¡LOGIN CORRECTO!',
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: ''
                });
            }
            res.end();
        });
    } else {
        res.send('Please enter user and Password!');
        res.end();
    }
};

// Controlador que maneja el cierre de sesión
controller.logout = function (req, res) {
    logger.info(new Date().toLocaleString() + ' :  ' + 'El usuario se ha desconectado ' + req.session.email);
    req.session.destroy(() => {
        res.redirect('/');
    });
};

// Controlador que maneja el formulario de recuperación de contraseña
controller.recuperacion = (req, res) => {
    logger.info(new Date().toLocaleString() + ' :  ' + 'El visitante accedió al formulario de recuperación de contraseña');
    res.render('recuperacion');
};

// Controlador que maneja el formulario de restablecimiento de contraseña
controller.resetPassword = (req, res) => {
    logger.info(new Date().toLocaleString() + ' :  ' + 'El usuario accedió al formulario de cambio de contraseña');
    const token = req.query.token;
    console.log(token);
    res.render('resetpassword', { token });
};

// Controlador que maneja el proceso de recuperación de contraseña
controller.recuperarPassword = (req, res) => {
    const email = req.body.email;

    connection.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
            logger.info(new Date().toLocaleString() + ' :  ' + 'El visitante accedió al formulario de recuperación y al hacer clic en recuperar con el correo: ' + email + ' dio Error en la base de datos');
            return res.status(500).json({ message: 'Error en la base de datos' });
        }

        if (results.length === 0) {
            logger.info(new Date().toLocaleString() + ' :  ' + 'El visitante accedió al formulario de recuperación y el correo: ' + email + ' no fue encontrado');
            return res.status(404).json({ message: 'Correo electrónico no encontrado' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        console.log(token);
        logger.info(new Date().toLocaleString() + ' :  ' + 'El visitante accedió al formulario de recuperación y al hacer clic en recuperar con el correo y se generó un token para: ' + email);

        const userId = results[0].id;
        console.log(userId);
        connection.query('UPDATE users SET reset_token = ? WHERE id = ?', [token, userId], (error) => {
            if (error) {
                console.log('1');
                console.log(error);
                logger.info(new Date().toLocaleString() + ' :  ' + 'Manejar el error de la actualización en la base de datos al tratar de enviar el token a ' + email);
                console.log('2');
                logger.info(new Date().toLocaleString() + ' :  ' + 'Manejar el error en la base de datos al tratar de enviar el token a ' + email);
                return res.status(500).json({ message: 'Error en la base de datos' });
            }
            console.log('3');
            logger.info(new Date().toLocaleString() + ' :  ' + 'Enviar el correo electrónico de recuperación de contraseña con el enlace que contiene el token a ' + email);
            enviarCorreo(token, email, res);
        });
    });
};

// Controlador que maneja el formulario de restablecimiento de contraseña
controller.updatePassword = async (req, res) => {
    const token = req.body.token;
    const password = req.body.password;

    connection.query('SELECT * FROM users WHERE reset_token = ? ', [token], async (error, results) => {
        if (error) {
            console.log(error);
            logger.info(new Date().toLocaleString() + ' :  ' + 'El error de la consulta a la base de datos al token a ' + email);
            return res.status(500).json({ message: 'Error en la base de datos' });
        }

        if (results.length === 0) {
            logger.info(new Date().toLocaleString() + ' :  ' + 'El token no es válido o ha expirado a ' + email);
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        const passwordHash = await bcrypt.hash(password, 8);
        const userId = results[0].id;
        const email = results[0].email;
        logger.info(new Date().toLocaleString() + ' :  ' + 'Actualizar la contraseña en la base de datos para ' + email);
        connection.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [passwordHash, userId], (error) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Error en la base de datos' });
            }
            res.redirect('/login');
        });
    });
};

// Exportar el controlador
module.exports = controller;
