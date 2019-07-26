// client library
function getToken() 
{
  var loginUrl = "/index";
  var xhr = new XMLHttpRequest();
  var userElement = document.getElementById('username');
  var passwordElement = document.getElementById('password');
  var username = userElement.value;
  var password = passwordElement.value;
  var resultElement = document.getElementById('result');
  var tag = "getToken: ";
  
  xhr.open('POST', loginUrl, true);
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  xhr.addEventListener('load', function() {
	//console.log(this.response);
	
    var responseObject = JSON.parse(this.response);
	
    if (responseObject.type) {
	  // Store token
	  console.log("login complete");
	  localStorage.setItem('token', responseObject.token);
	  getSecret();
	  /*
		return from server result should be JSON then etract element in here
	  */
	  
    } 
	else 
	{
		console.log(tag + "wrong username or password!");
		resultElement.innerHTML = 'Wrong Username or Password !';
		passwordElement.value = '';
    }
  });

  var sendObject = JSON.stringify({username: username, password: password});

  xhr.send(sendObject);
  
}

function getSecret() 
{
  var url = "/index";
  var xhr = new XMLHttpRequest();
  
  var mytoken = localStorage.getItem('token');
  var tag = "getSecret: ";
  var jsonResponse;
  
  xhr.open('GET', url, true);
  
  xhr.setRequestHeader("Authorization", mytoken);
  
  xhr.addEventListener('load', function() {
	
	try
	{
		jsonResponse = JSON.parse(this.response);
		console.log(jsonResponse);
		if(!jsonResponse.type)
		{
			window.location.assign("/login");
		}
		else
		{
			window.location.assign("/home");
		}
	}
	catch(err)
	{
		console.log("not json object!");
		window.location.assign("/login");	
	}
	
  });

  xhr.send(null);
}

function getUserInform()
{
  var url = "/index";
  var xhr = new XMLHttpRequest();
  var mytoken = localStorage.getItem('token');
  var tag = "getUserInform: ";
  var jsonResponse;
  //var unameElement = document.getElementById('uname');
 
  xhr.open('GET', url, true);
  
  xhr.setRequestHeader("Authorization", mytoken);
  
  xhr.addEventListener('load', function() {
    var responseObject = this.response;
	console.log("getUserInform");
    console.log(responseObject);
	
	try
	{
		jsonResponse = JSON.parse(this.response);
		console.log(jsonResponse);
		if(!jsonResponse.type)
		{
			window.location.assign("/login");
		}
	}
	catch(err)
	{
		console.log("not json object!");
		window.location.assign("/login");	
	}
  });

  xhr.send(null);
}

function logout()
{
    if(confirm('Log out ?'))
    {
	localStorage.removeItem('token');
	window.location.assign("/login");
    }
}