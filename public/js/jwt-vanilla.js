// make the request to the login endpoint



function getToken() {
  var loginUrl = "/index"
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

function getSecret() {

  var url = "/index"
  var xhr = new XMLHttpRequest();
  
  var mytoken = localStorage.getItem('token');
  var tag = "getSecret: ";
  
  xhr.open('GET', url, true);
  
  xhr.setRequestHeader("Authorization", mytoken);
  
  xhr.addEventListener('load', function() {
    //var responseObject = JSON.parse(this.response);
	var responseObject = this.response;
	// console.log(responseObject);
	if(responseObject == 'Unauthorized')
	{
		//alert("Unauthorized!");
		window.location.assign("/login");
	}
	else
	{
		// handle if user still not log out
		console.log(tag + "login pass");
		window.location.assign("/home");
	}
    
    
  });

  xhr.send(null);
}

function getUserInform() {

  var url = "/index"
  var xhr = new XMLHttpRequest();
  var mytoken = localStorage.getItem('token');
  var tag = "getUserInform: ";
  var jsonResponse;
  //var unameElement = document.getElementById('uname');
 
  xhr.open('GET', url, true);
  
  xhr.setRequestHeader("Authorization", mytoken);
  
  xhr.addEventListener('load', function() {
    var responseObject = this.response;
	 console.log("db0x36");
	
	if(responseObject == 'Unauthorized')
	{
		alert("Unauthorized!");
		window.location.assign("/login");
		
	}
	else
	{
		jsonResponse = JSON.parse(this.response);
		
		
		
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