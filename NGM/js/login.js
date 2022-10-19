//Basic functions to deal with logging in the participant

$(document).ready(init); //when the html page is ready, setup required js

/**
 * Give functionality to the login button. Can be either clicked, or pressing the
 * Enter key will also have the same behavior.
 */
function init() {
	$("#loginID").keypress(function(event) {
		if (event.which == 13) {
			event.preventDefault();
			loginSubject();
		}
	});

	$("#loginButton").click(loginSubject);
}

/**
 * Pass the required information to page where this info is posted.
 * Parameters passed:
 * - subject ID
 * - local time for subject
 */ 
function loginSubject() {
	if ($.trim($("#loginID").val()) == "") {
		alert("Please enter a valid ID.");
	}
	else {
		var d = new Date();
		var localsec = Math.round(d.getTime()/1000) - d.getTimezoneOffset()*60;

		$("#localsec").val(localsec);
		$("#login-info").submit();
	}
}