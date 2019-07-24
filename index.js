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

// influxdb-web server-client comunication
const Influx = require('influx');
const http = require('http');
const os = require('os');
// Decode jwt
var jwtDecode = require('jwt-decode');

const influx = new Influx.InfluxDB({
  host: '54.254.186.136:8086',
  username: 'chp-lab',
  password:'atop3352',
  database: 'envdb',
  
  schema: [
    {
      measurement: 'env',
      fields: {
        temp: Influx.FieldType.FLOAT 
      },
      tags: [
        'topic'
      ]
    }
  ]
});


app.use((req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`Request to ${req.path} took ${duration}ms`);
  });
  return next()
});



const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
	console.log("sub: " + payload.sub);
	
	// Implement Multiple Local User Authentication Strategies in Passport.js
	/*
	Use payload.sub as username to look at databases
	# SELECT username FROM UserInformations WHERE username=payload.sub;
	*/
	
	var username = "\'" + payload.sub + "\'";
	var sql = "SELECT username FROM UserInformations WHERE username= " + username;
	var tag = 'jwtAuth: ';
	
	console.log(sql);
	
	mysql_pool.getConnection(function(err, connection) {
		if (err) {
			connection.release();
			console.log(' Error getting mysql_pool connection: ' + err);
			throw err;
		}
	
	
		connection.query(sql, function(err2, result, fields){
			var resultArray;
			if(err2)
			{
				console.log(' mysql_pool.release()');
				connection.release();
				
				done(null, false);
			}
			console.log(result);
			
			if((result && result.length > 0))
			{
				try{
					resultArray = Object.values(JSON.parse(JSON.stringify(result)));
				}
				catch(e)
				{
					console.log(tag + "unknow error ocurred!");
				}
				if(payload.sub === resultArray[0].username)
				{
					console.log(tag + "Authentication success!");
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
		connection.release();
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
	
	mysql_pool.getConnection(function(err, connection) {
		if (err) {
			connection.release();
			console.log(' Error getting mysql_pool connection: ' + err);
			throw err;
		}
	
		connection.query(sql, function(err2, result, fields){
			var checkPassword;
			var resultArray;
			
			if(err2)
			{
				console.log(' mysql_pool.release()');
				connection.release();
				
				res.json({
					type: false,
					message: 'server_err',
					token: ""
				});
				// throw err;
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
		connection.release();
	});
}

// mysql server informations

var db_config = {
	connectionLimit : 100,
	host: "54.254.186.136",
	user: "admin",
	password: "0x00ff0000",
	database: "chplab"
};

// var con = mysql.createConnection(db_config);

var mysql_pool  = mysql.createPool(db_config);

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

app.get('/test', function(req, res){
  
  res.sendFile(__dirname + "/test.html");
});

// Data req, don't forget to add auth
app.get('/monit', requireJWTAuth, function (req, res) {
	
	// console.log(req.headers.authorization);
	var decoded = jwtDecode(req.headers.authorization);
	var tmpUsername = `'${decoded.sub}'`;
	var tag = 'monit: ';
	// Get table name of user A
	var sql = "SELECT * FROM Machines WHERE username= " + tmpUsername;
	var jsonMysqlRes;
	
	console.log(tag + sql);
	
	// mysql part
	mysql_pool.getConnection(function(err, connection) {
		if (err) {
			connection.release();
			console.log(' Error getting mysql_pool connection: ' + err);
			throw err;
		}
		
		connection.query(sql, function(err2, result, fields){
			if(err2)
			{
				console.log(' mysql_pool.release()');
				connection.release();
				
				res.json({
					type: false,
					message: 'server_error',
					token: ""
				});
			}
		
			// Keep user information from mysql
			jsonMysqlRes = JSON.parse(JSON.stringify(result));
			
			myInflux();
				
			function myInflux()
			{
				var i = 0;
				var __all_results = {};
				var d = new Date();
				var tmp_timeStamp = d.getFullYear().toString() + "-" + ( "0" + (d.getMonth() + 1).toString()).slice(-2) +  "-" + ( "0" + d.getDate().toString()).slice(-2) + 'T00:00:00Z';
				
				jsonMysqlRes.forEach(function(element){
					// console.log(element);
						
					var query_obj = {tableName: `"${element.machineID}"`, timeStamp:tmp_timeStamp, limit: 0};
					// Get today data
					var query_cmd = `SELECT *::field FROM ${query_obj.tableName} WHERE time > '${query_obj.timeStamp}' limit ${query_obj.limit}`;
					
					
					console.log(query_cmd);
						
					// Non blocking function
					influx.query(query_cmd).then(result => {
						__all_results[element.machineID] = JSON.parse(JSON.stringify(result));
						i = i + 1;
						console.log("Query complete " + i + " time(s)");
						if(i >= jsonMysqlRes.length)
						{
							var resultObj = {username:jsonMysqlRes[0].username, machineName:jsonMysqlRes[0].machineName, department:jsonMysqlRes[0].department, results:__all_results};
							res.json(resultObj);
						}
					}).catch(err => {
						res.status(500).send(err.stack)
					})
					
				});			
			}
		});
		connection.release();
	});
});

app.use(function (req, res, next) {
  res.status(404).send("(404) Page not found!")
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('(500) Server error!!')
});

/*
con.on('error', function(err) {
    console.log('db error', err);
	// throw err;                            
	mysql_handleDisconnect();
	// server variable configures this
 });
 */
 
 mysql_handleDisconnect();
 // handle mysql connection lost
 function mysql_handleDisconnect() {

	/*
	con.destroy();
	con = mysql.createConnection(db_config);
	con.connect(function(err) {
		if(err != null)
		{
			if(err.code == 'PROTOCOL_ENQUEUE_HANDSHAKE_TWICE')
			{
				console.log("mysql server already connect");
			}
			else
			{
				console.log(err.code);
				setTimeout(mysql_handleDisconnect, 1000);
			}
		}
		else
		{
			console.log("connected to mysql server");
		}
	});
	*/
	// test connection
	mysql_pool.getConnection(function(err, connection) {
		if (err) {
			connection.release();
			console.log(' Error getting mysql_pool connection: ' + err);
			throw err;
		}
		else
		{
			console.log("mysql connected");
		}
		connection.release();
	});
	
 }

/**
 * Now, we'll make sure the database exists and boot the app.
 */
influx.getDatabaseNames()
  .then(names => {
    if (!names.includes('envdb')) {
		console.log("database not found");
      //return influx.createDatabase('envdb')
	  return false;
    }
  }).then(() => {
    app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
  }).catch(err => {
    console.error('failed connect to database')
  });

