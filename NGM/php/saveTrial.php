<?php
session_start();

//extra files
include("./loginInfo.php");

$message = "default"; //stores status message for success/failure of adding to the database

//checks if the variables were sent
//if (isset($_SESSION["subjID"]) && isset($_SESSION["task"]) && isset($_POST["numAttendDots"])) {
if (isset($_SESSION["sid"]) && isset($_SESSION["session"]) && isset($_POST["trial"])) {
	//store values sent
	$sid = $_SESSION["sid"];
	$session = $_SESSION["session"];
	$trial = $_POST["trial"];
	$trialStart = $_POST["trialStart"];
	$sequenceLength =  $_POST["sequenceLength"];
	$sequence = $_POST["sequence"];
	$sequencePos = $_POST["sequencePos"];
	$numProbes = $_POST["numProbes"];
	$probes = $_POST["probes"];
	$probePos = $_POST["probePos"];
	$responses = $_POST["responses"];
	$correct = $_POST["correct"];
	$rt = $_POST["rt"];

	//initiate connection
	try {
		$bdd = new PDO("mysql:host=localhost;dbname=$exptdb;", $username, $password);
	} catch (Exception $e){
		$message =  $e->getMessage();
		exit($message);
	}
  
	//add trial data
	$trialquery = $bdd->prepare("INSERT INTO trialData (sid, session, trial, trialStart, " .
		"sequenceLength, sequence, sequencePos, numProbes, probes, probePos, responses, correct, rt) " .
		"VALUES (:sid, :session, :trial, :trialStart, :sequenceLength, :sequence, :sequencePos, " .
		":numProbes, :probes, :probePos, :responses, :correct, :rt)"); 
		
	//setup parameters		 
	$trialquery->bindParam(":sid", $sid);
	$trialquery->bindParam(":session", $session);
	$trialquery->bindParam(":trial", $trial);
	$trialquery->bindParam(":trialStart", $trialStart);
	$trialquery->bindParam(":sequenceLength", $sequenceLength);
	$trialquery->bindParam(":sequence", $sequence);
	$trialquery->bindParam(":sequencePos", $sequencePos);
	$trialquery->bindParam(":numProbes", $numProbes);
	$trialquery->bindParam(":probes", $probes);
	$trialquery->bindParam(":probePos", $probePos);
	$trialquery->bindParam(":responses", $responses);
	$trialquery->bindParam(":correct", $correct);
	$trialquery->bindParam(":rt", $rt);	
			
	if ($trialquery->execute()) {
		$message = "Trial successfully added.";
	}
	else {
		$message = print_r($trialquery->errorInfo());
	}
 	
 	//close connection to database
 	unset($bdd);
}
//not currently in use
exit($message);

?>