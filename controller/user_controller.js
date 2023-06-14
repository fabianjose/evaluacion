// Invocamos a logger
const logger = require ('../log/logger')

//-Invocamos a bcrypt
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const enviar = require('../template/nueva-notificacion')
// Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './.env'});
//Invocamos a la conexion de la DB
const connection = require('../database/db');
const session = require('express-session');
const nodemailer = require('nodemailer');
const enviarCorreo = require('../template/nueva-notificacion');

//creacmos un objeto de controlador que contendra todas las funciones proximas
const controller = {}

// controlador que redirecciona al login de la ruta /login
controller.login = (req, res)=>{
		logger.info( new Date().toLocaleString() +' :  ' +' :  '  + 'visitante accedio al login')
		res.render('login');
	
}
// controlador que redirecciona al login de la ruta /register

controller.register = (req, res)=>{   
	logger.info( new Date().toLocaleString() +' :  ' + 'visitante accedio al registro')
	
	res.render('register');
}
// controlador que controla el registro de usuarios
controller.postregister = async (req, res)=>{
	const email = req.body.email;
	const nombre = req.body.nombre;
    const rol = req.body.rol;
	const password = req.body.password;
	let passwordHash = await bcrypt.hash(password, 8);

console.log(req.body);







	connection.query('INSERT INTO users SET ?',{email:email,  password:passwordHash, nombre:nombre, rol:rol}, async (error, results)=>{
        if(error){
			console.log(error);
              		
			console.log('user existente');
			logger.info( new Date().toLocaleString() +' :  ' + 'visitante no pudo resgistrarse ya que el usuario agregado ya existe ')
			res.render('register',{
				alert: true,
				alertTitle: "Usuario Existente",
				alertMessage: "¡Falla de registro!",
				alertIcon:'error',
				showConfirmButton: false,
				timer: 3500,
				ruta: 'register'
			})
		
		


        }else{          
			logger.info( new Date().toLocaleString() +' :  ' + 'visitante se registro de manera exitosa para el usuario : '+ email)
  
			res.render('register', {
				alert: true,
				alertTitle: "Registration",
				alertMessage: "¡Successful Registration!",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: ''
			});
            //res.redirect('/');         
        }
	});




	// ...
	

	
	
}// llave de cierre de funcion postregister



// controlador que controla el acceso / login de usuarios

controller.auth = async (req, res)=> {
	const email = req.body.email;
	const password = req.body.password;    
    let passwordHash = await bcrypt.hash(password, 8);
	if (email && password) {
		connection.query('SELECT * FROM users WHERE email = ?', [email], async (error, results, fields)=> {
			if( results.length == 0 || !(await bcrypt.compare(password, results[0].password)) ) {    

				
 


				logger.info( new Date().toLocaleString() +' :  ' + 'visitante trato de logearse con el usuario  ' + email + ' pero ha fallado ')

				res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSWORD incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    });
				
				//Mensaje simple y poco vistoso
                //res.send('Incorrect Username and/or Password!');				
			} else {         
				     

				logger.info( new Date().toLocaleString() +' :  ' + 'visitante logro de logearse con el usuario  ' + email + ' ')
				//creamos una var de session y le asignamos true si INICIO SESSION  
				req.session.loggedin = true;                
				req.session.email = results[0].email;
			

				res.render('login', {
					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡LOGIN CORRECTO!",
					alertIcon:'success',
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
}

// controlador que genera el logout
controller.logout = function (req, res) {

	

	logger.info( new Date().toLocaleString() +' :  ' + 'el usuario se ha deslogeado  ' + req.session.email + ' ')

	req.session.destroy(() => {
	  res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
	})
}


// ...



controller.recuperacion = (req, res)=>{   
	logger.info( new Date().toLocaleString() +' :  ' + 'visitante accedio al recuperacion')
	
	res.render('recuperacion');
}


controller.resetPassword = (req, res)=>{   //Este controlador tiene lo que llega del formulario de cambio de clave
	logger.info( new Date().toLocaleString() +' :  ' + 'el usuario entro a formulario de cambio de clave')
	const token = req.query.token;
	console.log("object");

	console.log(token);
	res.render('resetpassword',{token});
}


controller.recuperarPassword = (req, res) => { //Este controlador verifica si existe o no la persona en la base de datos para enviar el correo de recuperacion
	const email = req.body.email;
  
	// Verificar si el correo electrónico existe en la base de datos
	connection.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
	  if (error) {
		console.log(error);
		// Manejar el error de la consulta a la base de datos
		logger.info( new Date().toLocaleString() + ' :  ' + 'visitante accedio al recuperacion y al dar click a recuperar con el correo : '+email+' dio Error en la base de datos')

		return res.status(500).json({ message: 'Error en la base de datos' });
	  }
  
	  if (results.length === 0) {
		// El correo electrónico no existe en la base de datos
		logger.info( new Date().toLocaleString() + ' :  ' + 'visitante accedio al recuperacion y el Correo : ' +email + ' no fue encontrado')

		return res.status(404).json({ message: 'Correo electrónico no encontrado' });

	  }
  
	  // Generar un token único
	  const token = crypto.randomBytes(20).toString('hex');
	  console.log(token);
	  logger.info( new Date().toLocaleString() + ' :  ' + 'visitante accedio al recuperacion y al dar click a recuperar con el correo  y se le genero un token a : '+email+' ')
  
	  // Almacenar el token en la base de datos asociado al usuario correspondiente
	  const userId = results[0].id;
	  console.log(userId);
	  connection.query('UPDATE users SET reset_token = ? WHERE id = ?', [token, userId], (error) => {
		if (error) {
			console.log('1');
		  console.log(error);
		  logger.info( new Date().toLocaleString() + ' :  ' + 'Manejar el error de la actualización en la base de datos al tratar de enviar el token a '+email+'')

		  // Manejar el error de la actualización en la base de datos
		  console.log('2');
		  logger.info( new Date().toLocaleString() + ' :  ' + 'Manejar el error  en la base de datos al tratar de enviar el token a '+email+'')

		  return res.status(500).json({ message: 'Error en la base de datos' });
		  
		}
		console.log('3');
		logger.info( new Date().toLocaleString() + ' :  ' + 'Enviar el correo electrónico de recuperación de contraseña con el enlace que contiene el token a '+email+'')

		// Enviar el correo electrónico de recuperación de contraseña con el enlace que contiene el token
		//correo.enviarCorreo(token,email)
			
			enviarCorreo(token,email,res)
		
		
		
		
	  });
	});
  };


  
  // Controlador para procesar el formulario de restablecimiento de contraseña
  controller.updatePassword = async (req, res) => {
	const token = req.body.token;
	const password = req.body.password;
  
	// Verificar si el token es válido y aún no ha expirado
	connection.query('SELECT * FROM users WHERE reset_token = ? ', [token], async (error, results) => {
	  if (error) {
		console.log(error);
		// Manejar el error de la consulta a la base de datos
		logger.info( new Date().toLocaleString() + ' :  ' + 'el error de la consulta a la base de datos a  el token a '+email+'')

		return res.status(500).json({ message: 'Error en la base de datos' });
	  }
  
	  if (results.length === 0) {
		
		// El token no es válido o ha expirado
		logger.info( new Date().toLocaleString() + ' :  ' + ' El token no es válido o ha expirado a '+email+'')

		return res.status(400).json({ message: 'Token inválido o expirado' });
	  }
  
	  // Generar el hash de la nueva contraseña
	  const passwordHash = await bcrypt.hash(password, 8);
	  const userId = results[0].id;
	  const email = results[0].email;  
	  // Actualizar la contraseña en la base de datos
	  logger.info( new Date().toLocaleString() + ' :  ' + ' Actualizar la contraseña en la base de datos para '+email+'')

	  connection.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [passwordHash, userId], (error) => {
		if (error) {
		  console.log(error);
		  // Manejar el error de la actualización en la base de datos
		  return res.status(500).json({ message: 'Error en la base de datos' });
		}
  
		// Redireccionar al usuario a la página de inicio de sesión o mostrar un mensaje de éxito
		res.redirect('/login');
	  });
	});
  };


// aca exportamos el modulo
module.exports = controller