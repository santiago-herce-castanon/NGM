<?php
session_start();

/**
 * Adds the session finish time to the participant's records
 *
 * Required parameters:
 * - sid: the subject's id
 * - session: the current session
 * - localFinishTime: the finish time in the subject's time zone
 */

//extra php scripts
include "./loginInfo.php";
include "./db_utils.php";

//checks if the variables were sent
if (isset($_SESSION["sid"], $_SESSION["session"], $_POST["localFinishTime"])) {
	$sid = $_SESSION["sid"];
	$session = $_SESSION["session"];
	$localFinishTime = $_POST["localFinishTime"];

	//initiate connection
	$connection = get_db_connection($host, $exptdb, $username, $password); //from loginInfo.php

	//change time to time string
	$localtime = date('Y-m-d H:i:s', $localFinishTime);

	//add their finish time to the database
	$addquery = $connection->prepare("UPDATE sessions SET localFinishTime=:locTime, finishTime=NOW() WHERE sid=:sid AND session=:session");
	$addquery->bindParam(":locTime", $localtime);
	$addquery->bindParam(":sid", $sid);
	$addquery->bindParam(":session", $session);

	if ($addquery->execute()) {
		$message = "Finish time successfully added.";
	}
	else {
		$message = print_r($addquery->errorInfo());
	}

	

	//close connection to database
	unset($connection);
}

exit($message);

?>