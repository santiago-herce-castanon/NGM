<?php
session_start();

/**
 * Handles setting up the session variables for this current session, and also
 * adds a new subject to the database
 *
 * Required parameters:
 * - loginID: the assigned ID which will become the participant's subject ID
 * - localsec: local time for the subject
 *
 * SESSION variables that are initialized in this script:
 * - sid
 */

//extra php scripts
include "./loginInfo.php";
include "./db_utils.php";

//clear out any old session data (e.g. the browser window has stayed open but new participant has logged in)
$_SESSION = array();

$_SESSION['sid'] = -1; //stores status message for success/failure of adding to the database
$tasksURL = "../task.php"; //main page for task once the subject logs in
$redirect_link = "../index.php?error=1"; //default page if something goes wrong


//checks if the variables were sent
if (isset($_REQUEST["loginID"], $_REQUEST["localsec"])) {
	$_SESSION['sid'] = $_REQUEST["loginID"];
	$localsec = $_REQUEST["localsec"];

	//initiate connection
	$connection = get_db_connection($host, $exptdb, $username, $password); //from loginInfo.php

	//change time to time string
	$localtime = date('Y-m-d H:i:s', $localsec);

	//check for existing user (get the latest entry if there's more than 1)
	$existquery = $connection->prepare("SELECT * FROM sessions WHERE sid=:sid ORDER BY id DESC LIMIT 1");
	$existquery->bindParam(":sid", $_SESSION['sid']);
	$existquery->execute();
	
	$curSession = 0;
	//if they already are in the database, no need to add them again
	if ($existresult = $existquery->fetch()) {
		$lastSession = $existresult['session'];
		$curSession = $lastSession + 1;
	}

	//set session variable
	$_SESSION['session'] = $curSession;

	//now add new entry to the sessions table
	$addquery = $connection->prepare("INSERT INTO sessions (sid, localStartTime, startTime, session)" .
			" VALUES (:sid, :loctime, NOW(), :session)");
	$addquery->bindParam(':sid', $_SESSION['sid']);	
	$addquery->bindParam(':loctime', $localtime);	
	$addquery->bindParam(':session', $curSession);
	$addquery->execute();

	$redirect_link = $tasksURL;

	//close connection to database
	unset($connection);
}

header('Location: ' . $redirect_link);

?>