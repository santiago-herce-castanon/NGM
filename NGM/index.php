<?php
session_start();

 /**
  * Login page for the subject where a subject ID is typed in.
  *
  * Once a subject ID is provided, this is saved as a SESSION variable. 
  */
?>
<!DOCTYPE html>

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> 
	<title>IIMAS: Enigma</title>
	<link type="text/css" rel="stylesheet" href="./css/bootstrap.min.css" />
	<link href="./css/style.css" type="text/css" rel="stylesheet" />
</head>


<body>
<div class="panel panel-primary narrow-panel">
	<div class="panel-heading" >
		<button id="switch-lang" style="background-color: darkblue;">
			<span lang="en">Cambiar a Español</span>
			<span lang="es">Switch to English</span>
		</button>
		<span>- 					-</span>
		<span lang="en">IIMAS: Enigma Box</span>
		<span lang="es">IIMAS: La Caja Enigma</span>
		<span>-						-</span>
	</div>

<div class="panel-body">
	<!-- login panel for the subject-->
	<p lang="en">Please click to login, use your unique participant code. If you do not already have one, create one name that identifies you:</p>
	<p lang="es">Ingresa tu código de participación único y haz click en ingresar. En caso de no tener un código todavía, inserta un nombre que te identifique para crearlo:</p>
	<div id="login-box" class="text-center">

		<form id="login-info" name="login-info" method="post" action="./php/login.php">
			<!--passes both the username and current local time for the subject -->
			<input type="text" id="loginID" name="loginID"> 
			<input type="hidden" id="localsec" name="localsec">
			<button type="button" id="loginButton" class="btn btn-primary" style="background-color: darkblue;"><span lang=en>Login</span><span lang=es>Ingresar</span></button>
		</form>
	</div>

<!--check that the browser supports the HTML5 canvas -->
<canvas width="1" height="1">
<p><strong>NOTE:</strong> If you see this message, your browser does not support the HTML5 canvas element. 
Please update your browser to the latest version so that you can participate in this study!</p>
<p>Common Browsers:
<ul>
<li><a href="https://www.google.com/intl/en/chrome/browser/">Google Chrome</a></li>
<li><a href="http://www.mozilla.org/en-US/firefox/update/">Mozilla Firefox</a></li>
</ul>
</p>
</canvas>
</div>

</div>
</body>

<!-- SCRIPTS -->
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
<script type="text/javascript" src="./js/login.js"></script>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<script>
	$('[lang="en"]').hide();
	$('#switch-lang').click(function() {
  	$('[lang="es"]').toggle();
  	$('[lang="en"]').toggle();
  	}); 
</script>
</html>