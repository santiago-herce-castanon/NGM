<?php
session_start();

$loggedIn = false;
if (isset($_SESSION["sid"])) {
	$loggedIn = true;
}
?>

<!DOCTYPE html>

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>Enigma Task</title>
	<link type="text/css" rel="stylesheet" href="./css/bootstrap.min.css" />
	<link type="text/css" rel="stylesheet" href="./css/style.css" />
</head>

<body>
	<div class="container">
		<!--content for instructions -->
		<div id="instructions" class="jumbotron">
			<?php if (!$loggedIn) { ?>
				<p>Please <a href="./index.php">login first</a> before starting.</p>
			<?php } else { ?>
				<h2>Enigma Task</h2>
			  	<p>You will see images within squares in a grid on the screen.</p>
			  	<p>Press the buttons (circles on the left or right of the screen) to collect points for every image.</p>
			  	<p>You need to learn the values of combinations of images and buttons.</p>
			  	<p>Correct choices help you fill up the success bar. A full bar earns you a coin.</p>
				<p>You lose your coins for incorrect choices.</p>
			  	<p>Collect 4 coins to move onto the next level.</p>
			  	<p>Try to get to the highest level you can!</p>
			  	<p></p>
			  	<p>Start whenever you want</p>
			  	<p><button id="start-button" class="btn btn-primary btn-lg">Start</button></p>
			<?php } ?>	  
		</div>



		<!-- play area -->
		<div id="task">
			<!--content for prompt -->
			<div id="prompt">
				<div id="probe-content">
					<p>Where did you see this symbol? Click on the grid to give your response.<br/>
					<img id="shape-probe" src=""></img>
				</p>
				</div>
			</div>
			
			<div id="LevelUpBox" style= "width:650px;text-align:center">
				<div class="grid-row" align="center">
					<div class="coin" id="31"></div
					><div class="coin" id="32"></div
					><div class="coin" id="33"></div
					><div class="coin" id="34"></div>	
				</div>
			<div id="LevelUpBox" style= "width:650px;text-align:center">
				<div class="bar" id="41"></div>
			</div>
			
			<div>
				<p>
				</p>
			</div>

			<!--button id="left-button2" class="btn btn-lg btn-default pull-left">L</button-->
			<!--div class="square" id="1"><img id="img-1" src="" style= "height:75px;width:75px" class="center"></div -->

			<!--<div id="pause-message">Game Paused</div>-->
			<div id="board" style= "width:650px" align="center">
				<div class="grid-row">
					<div class="square" id="01"><img id="img-01" src=""  style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="02"><img id="img-02" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="03"><img id="img-03" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="04"><img id="img-04" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="05"><img id="img-05" src="" style= "height:60px;width:60px;margin:10px" class="center"></div>
				</div
				><div class="grid-row">
					<div class="square" id="06"><img id="img-06" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="07"><img id="img-07" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="08"><img id="img-08" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="09"><img id="img-09" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="10"><img id="img-10" src="" style= "height:60px;width:60px;margin:10px" class="center"></div>
				</div>
				<div class="grid-row">
					<div class="circle" id="26"><img id="img-26" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="11"><img id="img-11" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="12"><img id="img-12" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="13"><img id="img-13" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="14"><img id="img-14" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="15"><img id="img-15" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="circle" id="27"><img id="img-27" src="" style= "height:60px;width:60px;margin:10px" class="center"></div>
				</div>
				<div class="grid-row">
					<div class="square" id="16"><img id="img-16" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="17"><img id="img-17" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="18"><img id="img-18" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="19"><img id="img-19" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="20"><img id="img-20" src="" style= "height:60px;width:60px;margin:10px" class="center"></div>
				</div>
				<div class="grid-row">
					<div class="square" id="21"><img id="img-21" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="22"><img id="img-22" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="23"><img id="img-23" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="24"><img id="img-24" src="" style= "height:60px;width:60px;margin:10px" class="center"></div
					><div class="square" id="25"><img id="img-25" src="" style= "height:60px;width:60px;margin:10px" class="center"></div>
				</div>
			</div>




			<button id="trial-button" class="btn btn-lg btn-default">Start Next Trial</button>


			<div id="info">
				<div id="score">Score: <span id="current-score">0</span> <span id="added-points"></span></div>
				<div id="LevelNum"> <span id="levelnum-msg"> Level: 1</span></div>
				<div id="timer"><span id="timer-text">00:00</span></div>
			</div>

			<div id="options">
				<button id="pause-button" class="btn btn-default">Pause</button>
				<!--<button id="stop-button" class="btn btn-default">Stop Playing</button>-->
			</div>
			<!--<div id="pause-screen">Game Paused</div>-->
		</div>

		<div class="jumbotron" id="end-div">
				<p>Your Final Score:<br/>
					<span id="final-score" class="score-class"></span></p>

				<p id="new-high-score-msg"><em>You got a new high score!</em></p>

				<p id="current-high-score-msg">Your Current High Score:<br/>
					<span id="current-high-score" class="score-class"></span></p>
				<p id="previous-high-score-msg">Your Previous High Score: <br/>
					<span id="previous-high-score" class="score-class"></span></p>
		</div>
	</div>

	<div class="modal fade" id="Levelup-modal" role="dialog">
    	<div class="modal-dialog">

			<div class="modal-content">
		    	<div class="modal-header">
					<h4 class="modal-title">Level Completed</h4>
				</div>
				<div class="modal-body">
					<p id="levelup-msg">Wow it looks like you solved this level.</p> 
					<p>Click the button below to move to the next level.</p>
				</div>
				<div class="modal-footer">
					<button type="button" id="levelup-button" class="btn btn-default" data-dismiss="modal">Start Next Level</button>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="Toggle-modal" role="dialog">
    	<div class="modal-dialog">

			<div class="modal-content">
		    	<div class="modal-header">
					<h4 class="modal-title">Oops!</h4>
				</div>
				<div class="modal-body">
					<p id="toggle-msg">It looks like you are having trouble solving this level</p> 
					<p>You can always click on a square to make it change </p>
					<p>(but you lose any coins you currently have in the level)</p>
				</div>
				<div class="modal-footer">
					<button type="button" id="toggle-button" class="btn btn-default" data-dismiss="modal">OK</button>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="pause-modal" role="dialog">
    	<div class="modal-dialog">

			<div class="modal-content">
		    	<div class="modal-header">
					<h4 class="modal-title">Game Paused</h4>
				</div>
				<div class="modal-body">
					<p id="idle-msg">It looks like you've stopped playing, so we've paused the game for you.</p> 
					<p>When you're ready to start playing again, click Resume.</p>
				</div>
				<div class="modal-footer">
					<button type="button" id="resume-button" class="btn btn-default" data-dismiss="modal">Resume</button>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="trial-modal" role="dialog">
    	<div class="modal-dialog">

			<div class="modal-content">
		    	<div class="modal-header">
					<h4 class="modal-title">A few trials remaining!</h4>
				</div>
				<div class="modal-body">
					<p>You have played for the required amount of time, but it appears that you're moving
						through trials at a slower pace than normal. Please complete the remaining trials indicated by
						the trial counter before you end today's session.</p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default" data-dismiss="modal">OK</button>
				</div>
			</div>
		</div>
	</div>
      

</body>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
<script type="text/javascript" src="./js/bootstrap.min.js"></script>
<script type="text/javascript" src="./js/underscore-min.js"></script>
<!--script type="text/javascript" src="./js/raphael.js"></script-->
<script type="text/javascript" src="./js/jwerty.js"></script>
<script type="text/javascript" src="./js/toolkit.js"></script>
<script src="https://code.createjs.com/createjs-2015.11.26.min.js"></script>
<?php if ($loggedIn) { ?>
<script type="text/javascript" src="./js/ngm.js"></script>
<?php } ?>

</html>