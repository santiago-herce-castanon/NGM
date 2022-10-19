<?php
session_start();

//extra files
include "./loginInfo.php";
include "./db_utils.php";

$highScore = 0;

$message = "default"; //stores status message for success/failure of adding to the database

//checks if the variables were sent
//if (isset($_SESSION["subjID"]) && isset($_SESSION["task"]) && isset($_POST["numAttendDots"])) {
if (isset($_SESSION["sid"]) && isset($_SESSION["session"]) && isset($_POST["finalScore"])) {
	//store values sent
	$sid = $_SESSION["sid"];
	$session = $_SESSION["session"];
	$finalScore = $_POST["finalScore"];

	//initiate connection
	$connection = get_db_connection($host, $exptdb, $username, $password); //from loginInfo.php

	//get score information from each session 
	$scorequery = $connection->prepare("SELECT * FROM sessions WHERE sid=:sid"); 
		
	//setup parameters		 
	$scorequery->bindParam(":sid", $sid);
	if($scorequery->execute()) {
		while ($scoreresult = $scorequery->fetch()) {
			if ($scoreresult["score"] > $highScore) {
				$highScore = $scoreresult["score"];
			}
		}
	}
	else {
		$message = print_r($scorequery->errorInfo());
		exit($message);
	}
	
	//add new score
	$addquery = $connection->prepare("UPDATE sessions SET score=:score WHERE sid=:sid AND session=:session");
	$addquery->bindParam(":score", $finalScore);
	$addquery->bindParam(":sid", $sid);
	$addquery->bindParam(":session", $session);

	if ($addquery->execute()) {
		$message = "Score successfully updated.";
	}
	else {
		$message = print_r($addquery->errorInfo());
	}

 	//close connection to database
 	unset($connection);
}

exit((string)$highScore);

?>