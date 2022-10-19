<?php
/*Basic database utility functions for connecting to the database*/


/* =============== Database utils =============== */

/** 
 * try connecting to the database with the given parameters
 */
function get_db_connection($host, $dbname, $username, $password)
{
  $connect_string = "mysql:host=" . $host . ";dbname=" . $dbname . ";";
  $connection = null;
  try {
    $connection = new PDO($connect_string, $username, $password);
  } catch (Exception $e) {
    die('get_db_connection : ' . $e->getMessage());
  }
  return $connection;
}

/**
 * check current connection to see if it works
 */ 
function pdo_ping($bdd)
{
  try {
    $bdd->query('SELECT 1');
  } catch (PDOException $e) {
    return false;
  }
  return true;
}

?>
