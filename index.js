// mysql.js
var mysql = require('mysql');
// express
const express = require("express");
const app = express();
// body parser
const bodyParser = require('body-parser');
// jwt
const jwt = require("jwt-simple");
// decode jwt
const ExtractJwt = require("passport-jwt").ExtractJwt;
// Strategy
const JwtStrategy = require("passport-jwt").Strategy;
// secret key
const SECRET = "bndxgey34u9034jop"; // Secret key
// Option for jwt Strategy
const jwtOptions = {
   jwtFromRequest: ExtractJwt.fromHeader("authorization"),
   secretOrKey: SECRET,
}

const bcrypt = require('bcrypt');

const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
	console.log("sub: " + payload.sub);
	
	// Implement Multiple Local User Authentication Strategies in Passport.js
	/*
	Use payload.sub as username to look at databases
	# SELECT username FROM UserInformations WHERE username=payload.sub;
	*/
	
	var username = "\'" + payload.sub + "\'";
	var sql = "SELECT username FROM UserInformations WHERE username= " + username;
	
	console.log(sql);
	con.query(sql, function(err, result, fields){
		var resultArray;
		
		if(err)
		{
			throw err;
		}
		console.log(result);
		
		if((result && result.length > 0))
		{
			try{
				resultArray = Object.values(JSON.parse(JSON.stringify(result)));
			}
			catch(e)
			{
				console.log("unknow error ocurred!");
			}
			if(payload.sub === resultArray[0].username)
			{
				console.log("Authentication success!");
				done(null, true);
			}
			else
		   {
			   
			   done(null, false);
		   }
		}
		else
		{
			done(null, false);
		}
	
	});
});
// passport middle ware auth
const passport = require("passport");
// Enable json body-parser
app.use(bodyParser.json());
// add jwtAuth to passport
passport.use(jwtAuth);
// set public directory
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

const requireJWTAuth = passport.authenticate("jwt",{session:false});
// port for running server
const PORT = process.env.PORT || 80;

// login
const loginMiddleware = (req, res, next) => {
	
	console.log(req.body);
	
	// Use req.body.username and req.body.password to look at databases	
	var username = req.body.username;
	var tmpUser = "\'" + username.replace("\'", "") + "\'";
	var sql = "SELECT password FROM UserInformations WHERE username= " + tmpUser;
	
	console.log(sql);
	
	con.query(sql, function(err, result, fields){
		var checkPassword;
		var resultArray;
		
		if(err)
		{
			throw err;
		}
		
		console.log(result);
		
		
		if((result && result.length > 0))
		{	
			try{
				resultArray = Object.values(JSON.parse(JSON.stringify(result)));
				checkPassword = resultArray[0].password;
				console.log("checkPassword= " + checkPassword);
			}
			catch(e)
			{
				console.log("unknow error ocurred!");
			}
			
			// bcrypt 4 round
			// https://www.devglan.com/online-tools/bcrypt-hash-generator
			// Sample hash source code
			/*
			bcrypt.hash('myPassword', 10, function(err, hash) {
				// Store hash in database
			});
			*/
			
			bcrypt.compare(req.body.password, checkPassword, function(err, pass) {
				if(pass) 
				{
					// Passwords match
					console.log("login pass");
					next();
				} 
				else {
					// Passwords don't match
					res.json({
						type: false,
						message: 'login_failed',
						token: ""
					});
					console.log("login failed");
				} 
			});
		}
		else
		{
			console.log("user not found!");
			res.json({
				type: false,
				message: 'user_not_found',
				token: ""
			});
		}	
	});
}

// mysql server informations
var con = mysql.createConnection({
	host: "54.254.186.136",
	user: "admin",
	password: "0x00ff0000",
	database: "chplab"
});

// handle login form
// basic flow -> index.html->login.html->homepage.html
app.post("/index", loginMiddleware, (req, res) => {
   const payload = {
      sub: req.body.username,
      iat: new Date().getTime() // iat --> issue at date
   };
   const mytoken = jwt.encode(payload, SECRET);
   //res.send(jwt.encode(payload, SECRET));
   
   
   res.json({
                    type: true,
					message: 'Authentication successful!',
                    token: mytoken
	});
	
});

// user required information
app.get("/index", requireJWTAuth, (req, res) => {
	console.log("/index passed");
	
	// For support jwt in next release
    // res.send("Authorized");
	// Check token in http header
   
   
     res.json({
                    type: true,
					message: 'authorized',
					username: 'super',
					mqtt: {
						username:"wzvravkf",
						password:"v1OZdLXaX06l",
						url:"m10.cloudmqtt.com",
						port:37606
					},
					
	});
	
});

app.get('/', function(req, res){
  res.sendFile(__dirname + "/" + "index.html");
});

app.get('/login', function(req, res){
  console.log('req login recv');
  res.sendFile(__dirname + "/" + "login.html");
  
});

app.get('/home', function(req, res){
  
  res.sendFile(__dirname + "/" + "homepage.html");
});

app.get('/user', function(req, res){
  
  res.sendFile(__dirname + "/user/" + "user.html");
});

app.use(function (req, res, next) {
  res.status(404).send("(404) Page not found!")
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('(500) Server error!!')
});

con.connect(function(err) {
	if(err)
	{
		throw err;
	}
	console.log("Connected");
	/*
	var username = "\'admin\'";
	var sql = "SELECT password FROM UserInformations WHERE username= " + username;
	console.log(sql);
	con.query(sql, function(err, result, fields){
		if(err)
		{
			throw err;
		}
		console.log(result);
	
	});
	*/
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));