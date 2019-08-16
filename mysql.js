var mysql = require('mysql');

var db_config = {
	connectionLimit : 100,
	host: "192.168.1.12",
	user: "admin",
	password: "0x00ff0000",
	database: "chplab"
};

// var con = mysql.createConnection(db_config);

var mysql_pool  = mysql.createPool(db_config);

mysql_testConnect();
 
function mysql_testConnect() {
	 try
	 {
		mysql_pool.getConnection(function(err, connection) {
			if (err) 
			{
				console.log(' Error getting mysql_pool connection: ' + err);
			}
			else
			{
				console.log("mysql connected");
			}
		});
	 }catch(mysqlErr)
	 {
		console.log("Error connect to mysql server");
	 }
	
 }