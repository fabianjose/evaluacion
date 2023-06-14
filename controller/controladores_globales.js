const controller = {}


controller.home = (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			email: req.session.email
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',			
		});				
	}
	res.end();
}

module.exports = controller