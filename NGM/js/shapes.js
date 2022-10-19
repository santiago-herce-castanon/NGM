// stimuli
var stim = {
	directory: './stimuli/',
	numStim: 6,
	size: 100, // px
	numLocations: 25, //number of spaces on the board
	files: [] //will store the filenames for the stim here
}

stim.correct = stim.directory + 'sounds/correct.mp3';
stim.wrong = stim.directory + 'sounds/wrong.mp3';

// parameters
var p = {
	startSeqLength: 3, //starting number of stimuli presented before probing
	startNumProbes: 1, //num of probes after the sequence
	staircaseUp: 3, //number of trials to get correct before increasing sequence length
	staircaseDown: 1, //number of trials to get wrong before decreasing sequence length
	floor: 2, //minimum length of the sequence
	ceiling: stim.numStim, //maximum length of the sequence
	minTrials: 25, //minimum number of trials to complete per session
	presentationTime: 500, //ms for shape to be displayed
	ISI: 300, //ms between shape presentation
	feedbackTime: 1000, //ms for duration of feedback
	ITI: 100, //ms before start of next trial (NOT including feedback time)
	pointsPerProbe: 10, //number of points each probe is worth
	playTime: 11, //amount of time required to play (minutes)
	idleLimit: 15, //how much time is allowed to pass before the idle message appears (seconds)
	minTrials: 60 //the minimum number of trials that need to be played, even with the play time met
}

//data storage
var d = {
	sessionStartTime: [],
	trialStart: [], //when the trial started (in relation to the start of the task)
	presentationOrder: [],
	presentationLocation: [],
	presetProbes: [],
	probesSoFar: 0,
	probeOrder: [],
	response: [],
	probeLocation: [],
	correct: [],
	rt: [],
	seqLength: p.startSeqLength,
	numProbes: p.startNumProbes,
	up: 0,
	down: 0,
	trial: 0,
	curStim: 0, //keeps track of which stimulus we're currently on
	curProbe: 0, //keeps track of which probe we're currently on
	allowResponse: false, //can be "present" or "respond"
	startTime: -1,
	endTime: -1,
	currentScore: 0,
	newPoints: 0,
	scoreMultiplier: 1, //based on consecutive correct answers
	timerOn: false, //keeps track when the timer is on
	timerTime: 0, //keeps track of how many seconds have passed
	timerID: -1, //storage for timer object
	timeUp: false, // keeps track if time is up for play
	countdownStarted: false, //we switch over to a trial countdown if the timer is up
	countdownWarning: false, //note that the warning has been shown indicating the timer switched to a trial counter 
	idleStartTime: 0, //keeps track of when the idle time 
	idleID: -1 //keeps track of when the idle timer is on 
}

//specific data storage for each trial for probe responses
var trialData = {
	response: [],
	probeLocation: [],
	correct: [],
	rt: []
}

loadStimuli();


// *** INITIALIZATION ** //
//preload the stimuli
function loadStimuli() {
	//preload images
	//add image names to an array
	for (var i = 1; i <= stim.numStim; i++) {
		stim.files.push(stim.directory + i + ".png"); // Line commented by SHC to change png for TIF
		//stim.files.push(stim.directory + i + ".TIF");
	}

	//now preload the files
	$(stim.files).each(function() {
		var image = $("<img />").attr("src", this);
	});

	//also preload sounds
	var queue = new createjs.LoadQueue();
	queue.installPlugin(createjs.Sound);
	queue.addEventListener("complete", initialize);
	queue.loadManifest([
		{ 
			id: 'correct',
			src: stim.correct
		},
		{
			id: 'wrong',
			src: stim.wrong
		}
	]);
}

function initialize() {
	// setup the buttons
	$("#start-button").click(startTask);
	$(".square").click(getResponse);
	$("#trial-button").click(startTrial);
	$("#pause-button").click(pauseTimer);
	$("#resume-button").click(resumeTimer);
	$("#stop-button").click(endExpt);
	$("#stop-button").prop("disabled", true);

	//setup the probes
	determineProbes();
}

// predetermine what locations are probed so that all locations
// are mostly uniformly sampled
function determineProbes() {
	//estimate about a probe a second (this is definitely plenty for the duration of the session)
	var numTotalProbes = p.playTime * 60;

	//create array of all location options
	var locationArray = [];
	for (var i = 0; i < stim.numLocations; i++) {
		locationArray[i] = i+1;
	}

	//determine how many times we need to go through the locations
	//to cover all of these
	var numIterations = Math.ceil(numTotalProbes/stim.numLocations);

	//now randomize the locations and assign them a probe order
	for (var i = 0; i < numIterations; i++) {
		var shuffledLocations = _.shuffle(locationArray);
		d.presetProbes = d.presetProbes.concat(shuffledLocations);
	}
}

//start the task
function startTask() {
	$("#instructions").hide();
	$("#task").show();

	//start the timer
	d.timerID = setInterval(updateTimer, 1000);

	//record the session start time
	d.sessionStartTime = Date.now();

	prepareTrial();
}

//determine the order of stimuli for presentation and their locations for this trial
function prepareTrial() {
	//initialize/reset values
	d.curStim = 0;
	d.curProbe = 0;
	//d.numStim = d.presentationOrder[d.trial].length;
	$(".square").css("background-color", "");

	//hide probe question
	$("#probe-content").hide();

	var sequence = [];
	var locations = [];
	var order = [];

	// select probe locations from the preset values
	var probeLocations = d.presetProbes.slice(d.probesSoFar, d.probesSoFar+d.numProbes);

	//add to list of locations
	locations = probeLocations;
	d.probesSoFar = d.probesSoFar + d.numProbes;

	//now randomly select the other locations (**** TO DO! *****)
	for (var i = 0; i < d.seqLength; i++) {
		//select a stimulus, and make sure it already hasn't been selected
		var possibleStim = _.random(1,stim.numStim);
		while (sequence.indexOf(possibleStim) != -1) {
			possibleStim = _.random(1,stim.numStim);
		}
		sequence.push(possibleStim);

		//select a location, and make sure it already hasn't been selected
		// (only get a new location for the filler locations)
		if (i >= d.numProbes) {
			var possibleLocation = _.random(1,stim.numLocations);
			while (locations.indexOf(possibleLocation) != -1) {
				possibleLocation = _.random(1,stim.numLocations);
			}
			locations.push(possibleLocation);
		}

		//create a simple array of index values
		order.push(i);
	}

	//get the probes
	var probes = sequence.slice(0, d.numProbes);
	d.probeOrder.push(probes);

	//shuffle the order so all the probes aren't at the beginning
	order = _.shuffle(order);

	newLocations = [];
	newSequence = [];

	for (var i = 0; i < d.seqLength; i++) {
		newSequence.push(sequence[order[i]]);
		newLocations.push(locations[order[i]]);
	}

	// add these to the list
	d.presentationOrder.push(newSequence);
	d.presentationLocation.push(newLocations);

	//show trial button
	$("#trial-button").show();

	//fade board
	$("#board").css({opacity: 0.1});
	//$("#board").css({visibility: 'hidden'});

	if (!d.timeUp) {
		//start idle timer
		resetIdleTimer();	
	}

	//check if the message about replacing the timer with a trial counter
	//need to be shown
	if (d.countdownStarted && !d.countdownWarning) {
		//show message to warn user that the timer is up, but they still need
		//to keep playing until the min number of trials is met
		$('#trial-modal').modal({
		  backdrop: 'static',
		  keyboard: false
		});

		//also note that we've shown the message to the participant once already
		d.countdownWarning = true;
	}

}

function startTrial() {
	//participant gave a response, so stop checking for idle-ness
	clearInterval(d.idleID);

	//mark trial start
	d.trialStart[d.trial] = Date.now() - d.sessionStartTime;

	//hide trial button
	$("#trial-button").hide();

	//show board
	$("#board").css({opacity: 1});
	//$("#board").css({visibility: 'visible'});

	//now start the trial
	//setTimeout(runTrial, p.ITI);
	setTimeout(runTrialArray, p.ITI);
}

function runTrial() {
	if (d.curStim < d.presentationOrder[d.trial].length) {
		//hide the cursor during the presentation period
		$("#task").css({cursor: 'none'});

		showStim();
	}
	else {
		//show the cursor again
		$("#task").css({cursor: 'default'});
		//now start the probe section
		showProbe();
	}
}

function runTrialArray() {
	if (trialData.response.length == 0 ) {
		//hide the cursor during the presentation period
		//$("#task").css({cursor: 'none'});

		showStimArray();
	}
	else {
		//show the cursor again
		//$("#task").css({cursor: 'default'});
		//now start the probe section
		hideStimArray();
	}
}

function showStim() {
	//display stimulus at determined location
	var location = d.presentationLocation[d.trial][d.curStim];

	var fileNumber = d.presentationOrder[d.trial][d.curStim] - 1;
	$("#img-" + location).attr("src", stim.files[fileNumber]);
	$("#img-" + location).css({visibility: 'visible'})


	//wait for presentation duration, then switch to other stimulus
	setTimeout(hideStim, p.presentationTime);
}

// added by SHC to show the stimuli all at once
function showStimArray() {
	var numStim = d.presentationOrder[d.trial].length;
	for (d.curStim = 0; d.curStim < numStim; d.curStim++) {
		//display stimulus at determined location
		var location = d.presentationLocation[d.trial][d.curStim];

		var fileNumber = d.presentationOrder[d.trial][d.curStim] - 1;
		$("#img-" + location).attr("src", stim.files[fileNumber]);
		$("#img-" + location).css({visibility: 'visible'})
	}

	//wait for presentation duration, then switch to other stimulus
	//setTimeout(hideStim, p.presentationTime);
}

function hideStim() {
	var location = d.presentationLocation[d.trial][d.curStim];
	$("#img-" + location).attr("src", "");
	$("#img-" + location).css({visibility: 'hidden'})

	// increase stim number
	d.curStim++;

	//wait before continuing with the sequence
	setTimeout(runTrial, p.ITI);
}

function hideStimArray() {
	var numStim = d.presentationOrder[d.trial].length;
	for (d.curStim = 0; d.curStim < numStim; d.curStim++) {
		var location = d.presentationLocation[d.trial][d.curStim];
		$("#img-" + location).attr("src", "");
		$("#img-" + location).css({visibility: 'hidden'})

		// increase stim number
		//d.curStim++;
	}
	//wait before continuing with the sequence
	setTimeout(runTrial, p.ITI);
}

function showProbe() {
	//reset squares
	$(".square").css("background-color", "");

	// display probe
	var fileNumber = d.probeOrder[d.trial][d.curProbe] - 1;
	$("#shape-probe").attr("src", stim.files[fileNumber]);

	$("#probe-content").show();

	d.allowResponse = true;

	//get start of response time
	d.startTime = Date.now();

	if (!d.timeUp) {
		//start tracking the participant's idle time again
		resetIdleTimer();
	}
}

function getResponse(event) {
	if (d.allowResponse && !d.gamePaused) {
		//get response time
		d.endTime = Date.now();
		trialData.rt.push(d.endTime - d.startTime);

		//also clear the idle tracker
		clearInterval(d.idleID);

		//get ID of the div
		var selection = event.target.id;

		//record response
		trialData.response.push(selection);

		//get the correct answer
		var index = d.presentationOrder[d.trial].indexOf(d.probeOrder[d.trial][d.curProbe]);
		var location = d.presentationLocation[d.trial][index];
		trialData.probeLocation.push(location);

		//record if correct or not
		var correct = (selection == location);
		trialData.correct.push(correct);


		//give feedback
		if (correct) {
			//change square to green
			$("#" + selection).css("background-color", "#9ACD32");

			//play correct sound
			var sound = createjs.Sound.play('correct');
		}
		else {
			//otherwise, change it to red
			$("#" + selection).css("background-color", "#FF6347");

			//play incorrect sound
			var sound = createjs.Sound.play('wrong');
		}

		//update the score
		updateScore();

		//move onto next probe
		d.curProbe++;
		if (d.curProbe < d.probeOrder[d.trial].length) {
			setTimeout(showProbe, p.feedbackTime);
		}
		else {
			// update staircase before moving onto next trial
			updateStaircase();

			//turn off board
			d.allowResponse = false;

			//increment trial number
			d.trial++;

			//check if the countdown timer needs to be updated
			// (only activated when the timer is up)
			if (d.countdownStarted) {
				updateRemainingTrials();
			}

			// if the timer's up and they've played at least the min number of trials,
			// stop the game
			if (d.timeUp && d.trial >= p.minTrials) {
				setTimeout(endExpt, p.feedbackTime);
			}
			else {
				//prepare next trial
				setTimeout(prepareTrial, p.feedbackTime);
			}
		}
	}
}

// update the staircase based on the overall results for the trial
function updateStaircase() {
	var isIncorrect = false;
	for (var i = 0; i < trialData.correct.length; i++) {
		if (!trialData.correct[i]) {
			isIncorrect = true;
			break;
		}
	}

	// if there was an incorrect response, then add to the downward trend
	if (isIncorrect) {
		d.down++;
		d.up = 0;
		if (d.down == p.staircaseDown) {
			if (d.seqLength > p.floor) {
				d.seqLength--;
			}
			d.down = 0;
		}
	}

	//otherwise if correct, add to the upward trend
	else {
		d.up++;
		d.down = 0;
		if (d.up == p.staircaseUp) {
			if (d.seqLength < p.ceiling) {
				d.seqLength++;
			}
			d.up = 0;
		}
	}

	//also change the number of probes
	d.numProbes = Math.floor(d.seqLength/2);

	//add data now to the overall data storage
	d.response.push(trialData.response);
	d.probeLocation.push(trialData.probeLocation);
	d.correct.push(trialData.correct);
	d.rt.push(trialData.rt);

	//now clear out trial data for next trial
	trialData.response = [];
	trialData.probeLocation = [];
	trialData.correct = [];
	trialData.rt = [];

	//and push the new data to the database
	saveTrialData();
}

function updateScore() {
	var index = trialData.correct.length - 1;
	d.newPoints = 0;
	if (trialData.correct[index]) {
		d.newPoints = p.pointsPerProbe * d.scoreMultiplier;
	}
	else {
		d.scoreMultiplier = 1;
	}

	//update score
	$('#current-score').text(d.currentScore);

	if (trialData.correct[index]) {
		//also show any points just gained
		$('#added-points').text('+ ' + d.newPoints);
		d.scoreMultiplier++;
		$('#added-points').show();
		$('#added-points').fadeOut(1000);

		setTimeout(addToScore, 1000);
	}
	
}

function addToScore() {
	d.currentScore = d.currentScore + d.newPoints;

	$('#current-score').text(d.currentScore);
	$('#added-points').text('');
}

function updateTimer() {
	d.timerTime++;
	//calculate minutes and seconds
	var minutes = Math.floor(d.timerTime / 60);
	if (minutes < 10) {
		minutes = "0" + minutes.toString();
	}

	var seconds = d.timerTime % 60;
	if (seconds < 10) {
		seconds = "0" + seconds.toString();
	}

	//update time display
	$("#timer-text").text(minutes + ":" + seconds);

	//stop timer if it's reached the allotted play time
	if (d.timerTime >= (p.playTime * 60)) {
		clearInterval(d.timerID);

		//get rid of idle timer too since we're not using the timer anymore
		clearInterval(d.idleID);

		//change color of timer to bring attention to it
		$("#timer-text").css("color", "black");

		//note that the timer is up (and check the current state of the trial)
		d.timeUp = true;

		//if they haven't reached the min number of trials to play, change the
		//timer to number of trials remaining
		if (d.trial < (p.minTrials - 1)) { //-1 since trial starts at 0
			d.countdownStarted = true;
		}
		
	}
}

function pauseTimer() {
	clearInterval(d.timerID);
	d.gamePaused = true;

	//$("#pause-button").text("Resume");
	$('#pause-modal').modal({
	  backdrop: 'static',
	  keyboard: false
	});

	//also clear interval for idle tracker
	clearInterval(d.idleID);
}

function resumeTimer() {
	d.timerID = setInterval(updateTimer, 1000);
	d.gamePaused = false;

	if (!d.timeUp) {
		//reset idle time and tracker
		resetIdleTimer();
	}

	//hide idle-related message
	$("#idle-msg").hide();

	//$("#pause-button").text("Pause");
}

function saveTrialData() {
	$.ajax({
		type: "POST",
		url: "./php/saveTrial.php",
		data: {
			trial: d.trial,
			trialStart: d.trialStart[d.trial],
			sequenceLength: d.presentationOrder[d.trial].length,
			sequence: d.presentationOrder[d.trial].join(';'),
			sequencePos: d.presentationLocation[d.trial].join(';'),
			numProbes: d.probeOrder[d.trial].length,
			probes: d.probeOrder[d.trial].join(';'),
			probePos: d.probeLocation[d.trial].join(';'),
			responses: d.response[d.trial].join(';'),
			correct: d.correct[d.trial].join(';'),
			rt: d.rt[d.trial].join(';')
		}
	});
	// }).done(function(msg) {
	// 	console.log(msg);
	// });
}

function endExpt() {
	$("#task").hide();

	//record when the participant finished this session
	var currentDate = new Date();
	var localFinishTime = Math.round(currentDate.getTime()/1000) - currentDate.getTimezoneOffset()*60;

	$.ajax({
		type: "POST",
		url: "./php/addFinishTime.php",
		data: {
			localFinishTime: localFinishTime,
		}
	});

	// determine current high schore
	var gotHighScore = false;
	var highScore = d.currentScore;
	var previousHighScore = 0;

	//add final score to database, and retrieve high score
	$.ajax({
		type: "POST",
		url: "./php/getHighScore.php",
		data: {
			finalScore: d.currentScore,
		}
	}).done(function(oldHighScore) {
		if (highScore > oldHighScore) {
			gotHighScore = true;
			previousHighScore = oldHighScore;
		}
		else {
			highScore = oldHighScore;
		}

		//show scores
		$("#final-score").text(d.currentScore);

		if (gotHighScore) {
			$("#new-high-score-msg").show();
			$("#previous-high-score").text(previousHighScore);
			$("#previous-high-score-msg").show();
		}
		else {
			$("#current-high-score").text(highScore);
			$("#current-high-score-msg").show();
		}

		$("#end-div").show();
	});
}

//this resets the start of when the idle time started
function resetIdleTimer() {
	d.idleStartTime = Date.now();
	d.idleID = setInterval(checkIdleTime, 1000);
}

//this checks if we need to pause the game if enough idle time has passed
function checkIdleTime() {
	//check how much time has passed since the idle start time was recorded
	var timePassed = (Date.now() - d.idleStartTime)/1000;

	if (timePassed >= p.idleLimit) {

		//pause the game
		pauseTimer();

		//show idle message
		$("#idle-msg").show();
	}
}

//update the number of trials remaining to do before ending the session
function updateRemainingTrials() {
	var trialsRemaining = p.minTrials - d.trial;
	$("#timer-text").text('Trials Left: ' + trialsRemaining);
	//console.log('current trial: ' + d.trial);
	// if (trialsRemaining == 0) {

	// }
}

//update the number of trials remaining to do before ending the session
function rgb2Hex(rgbStr) {
	var lookUpTbl = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
	sixteenStr =  [0,0,0,0,0,0];
	hexStr = "000000";
	for (i = 0 ; i < 3; i++) {
			 sixteenStr[i*2] =  Math.floor(rgbStr[i]/16); 
	         sixteenStr[i*2 + 1] =  Math.floor((rgbStr[i]%16)); 
	         hexStr.charAt([i*2]) =  lookUpTbl[Math.floor(rgbStr[i]/16)]; 
	         hexStr.charAt([i*2 + 1]) =  lookUpTbl[Math.floor((rgbStr[i]%16))]; 
		}
}


