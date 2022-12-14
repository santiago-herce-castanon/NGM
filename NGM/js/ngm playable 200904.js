// stimuli
var stim = {
	directory: './stimuli/',
	numStim: 15,
	numImageFiles: 45,
	size: 100, // px
	numLocations: 25, //number of spaces on the board
	files: [] //will store the filenames for the stim here
}

stim.correct = stim.directory + 'sounds/correct.mp3';
stim.wrong = stim.directory + 'sounds/wrong.mp3';
stim.coin = stim.directory + 'sounds/coin.wav';

// parameters
var p = {
	startSeqLength: 1, //starting number of stimuli presented before probing
	startNumProbes: 1, //num of probes after the sequence
	staircaseUp: 16, //number of trials to get correct before increasing sequence length
	staircaseDown: 1, //number of trials to get wrong before decreasing sequence length
	floor: 1, //minimum length of the sequence
	ceiling: stim.numStim, //maximum length of the sequence
	minTrials: 1, //minimum number of trials to complete per session
	presentationTime: 500, //ms for shape to be displayed
	ISI: 300, //ms between shape presentation
	feedbackTime: 1500, //ms for duration of feedback
	ITI: 100, //ms before start of next trial (NOT including feedback time)
	pointsPerProbe: 10, //number of points each probe is worth
	playTime: 120, //amount of time required to play (minutes)
	idleLimit: 60, //how much time is allowed to pass before the idle message appears (seconds)
	minTrials: 1, //the minimum number of trials that need to be played, even with the play time met
	askForNextTrial: 0 // do people need to click a button to start the next trial? (may be good for better RTs)
}

var ImageSelOrd = _.shuffle(colon(1,45));
var ImageLocs = _.shuffle(colon(1,25));
var KeyDefaults = [+0,+0,+0,+0,+0,+0,+0,+0,+1,+1,+1,+1,+1,+1,+1];
var MasterKey = [-1.0010,    1.0020,   -1.0040,    1.0080,   -1.0160,    1.0320,   -1.0640,    1.1280,   -1.0000,    1.0000,   -1.0000,    1.0000,   -1.0000,    1.0000,   -1.0000] ; // the fractional parts are just a means for solving ties...
var CutOrder = [1, 2, 9, 3, 4, 10, 13, 5, 6, 11, 7, 8, 12, 14, 15]; // Bottom-First
var OrderedDef = [];
for (var iEl = 0; iEl<KeyDefaults.length; iEl++) { OrderedDef[iEl] = KeyDefaults[CutOrder[iEl]-1]; }

// experiment data storage
var se = {
	// the parameters below work for a curricula where the later leaf-nodes are the untiers of earlier ones, and later nodes never appear below (in the hierarchy) earlier ones
	numKeys: MasterKey.length,
	masterKey: MasterKey, 
	CutOrder: CutOrder,
	WhImageOrder: ImageSelOrd.filter((ImageSelOrd,idx) => idx < [15*2]),
	WhImageLocs: ImageLocs.filter((ImageLocs,idx) => idx < 15),
	KeyDefaults: KeyDefaults
}

//data storage
var d = {
	sessionStartTime: [],
	trialStart: [], //when the trial started (in relation to the start of the task)
	presentationSequence: [],
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
	rt: [],
	toggletimes: [],
	toggle: [],
	keystate: [],
	keyval: []
}

// BIND KEYS
//    jwerty.key('???',handleLeft);
//    jwerty.key('???',handleRight);
//    jwerty.key('???',handleDown);
//    jwerty.key('???',handleEnter); 


loadStimuli();


// *** INITIALIZATION ** //
//preload the stimuli
function loadStimuli() {
	//preload images
	//add image names to an array
	for (var i = 1; i <= stim.numImageFiles; i++) {
		stim.files.push(stim.directory + i + ".png");
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
		},
		{
			id: 'coin',
			src: stim.coin
		}
	]);
}

function initialize() {
	// setup the buttons
	$("#start-button").click(startTask);
	$(".square").click(getResponse);
	$(".circle").click(getResponse);
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

	$("#" + 26).css("background-color", "#ffffff");
	$("#" + 27).css("background-color", "#ffffff");

	$("coin" + 31).css("background-color", "#888888");
	$("coin" + 32).css("background-color", "#888888");
	$("coin" + 33).css("background-color", "#888888");
	$("coin" + 34).css("background-color", "#888888");


	// the probe is not even needed, maybe get rid of it altogether
	$("#probe-content").hide();
	
	//start the timer
	d.timerID = setInterval(updateTimer, 1000);

	//record the session start time
	d.sessionStartTime = Date.now();

	prepareTrial();
	
}

function prepareTrial() {

	var sequence = [];
	var locations = [];
	var order = [];
	var CutOrd = se.CutOrder;


	var keytoss = [];
	for (var k = 0; k < se.numKeys; k++) {
		keytoss[k] = se.KeyDefaults[k];
	}

	// loop through available stim
	for (var i = 0; i < d.seqLength; i++) {
		var ithToss = Math.sign(Math.random(1)-.5);
		keytoss[CutOrd[i]-1] = ithToss
		sequence.push(se.WhImageOrder[2*i+(ithToss>0)]);
		locations.push(se.WhImageLocs[i]);
		order.push(i)
	}
	
	var keystate = [];
	for (var j = 0; j < se.numKeys; j++) {
		keystate[j] = keytoss[j]*se.masterKey[j];
	}


	trialData.keystate = keystate;
	trialData.keyval = decodeKey(keystate);
	
	order = _.shuffle(order);

	var newLocations = [];
	var newSequence = [];
	
	for (var i = 0; i < d.seqLength; i++) {
		newSequence.push(sequence[order[i]]);
		newLocations.push(locations[order[i]]);
	}

	// add these to the list
	d.presentationSequence.push(newSequence);
	d.presentationLocation.push(newLocations);

	if (p.askForNextTrial==1){
		//show trial button
		setTimeout(showStartTrialBtn,p.feedbackTime);
	} else {
		setTimeout(startTrial,p.feedbackTime);
	}

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


function showStartTrialBtn (){
	$("#trial-button").show();
}


function hideBoard () {
	$("#board").css({opacity:0});
}

function fadeBoard (tmOffSt) {
//fade board
	//$("#board").css({opacity: .5});
	//$("#board").css({visibility: 'hidden'});
	$('#board').fadeOut(tmOffSt);
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
	$("#board").css({visibility: 'visible'});
	$('#board').show();
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
		//showProbe();
		StartRespWindow();
	}
	else {
		//show the cursor again
		//$("#task").css({cursor: 'default'});
		//now start the probe section
		//hideStimArray();
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
		if (trialData.response.length == 0 ) {
			var numStim = d.seqLength;
			for (var iS = 0; iS < numStim; iS++) {
				//display stimulus at determined location
				d.currstim = iS;
				var location = d.presentationLocation[d.trial][d.currstim];
				var locationstr = String("0" + location).slice(-2);
				var fileNumber = d.presentationSequence[d.trial][iS] - 1;
				var fileNumberstr = String("0" + fileNumber).slice(-2);
				console.log(`fn ${fileNumber} , cs  ${d.currstim} , loc ${location} , t ${d.trial} v ${trialData.keyval}`);
				$("#img-" + locationstr).attr("src", stim.files[fileNumber]);
				$("#img-" + locationstr).css({visibility: 'visible'})
				$("#" + locationstr).css("background-color", "#ff8000");
			}
			$("#" + 26).css("background-color", "#888888");
			$("#" + 27).css("background-color", "#888888");
			//wait for presentation duration, then switch to other stimulus
			//setTimeout(hideStim, p.presentationTime);
		}
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
	var numStim = d.curStim;
	for (var iS = 0; iS < 26; iS++) {
		var iSstr = String("0" + iS).slice(-2);
		$("#img-" + iSstr).attr("src", "");
		$("#img-" + iSstr).css({visibility: 'hidden'})
		//$("#" + iSstr).css("background-color", "");
		// increase stim number
		//d.curStim++;
	}
	$(".square").css("background-color", "");
	//wait before continuing with the sequence
	setTimeout(runTrialArray, p.ITI);
}

function StartRespWindow () {
	d.allowResponse = true;
	//get start of response time
	d.startTime = Date.now();

	if (!d.timeUp) {
		//start tracking the participant's idle time again
		resetIdleTimer();
	}
}

function showProbe() {
	//reset squares
	//$(".square").css("background-color", "#ff8000");

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

		$(".response-btn").click(getResponse);
		$(".response-btn").on('touchstart', function(e) {
			e.preventDefault(); //prevent delay and simulated mouse events for tablets
			getResponse(e);
		});

		//also clear the idle tracker
		clearInterval(d.idleID);

		//get ID of the div
		var selection = event.target.id;

		// predefine response variables
		var isResp = 0;
		var whResp = -1;
		
		if (selection == "27") { isResp = 1; whResp = 1;}
		if (selection == "26")  { isResp = 1; whResp = 0;}

		console.log(`event ${selection} , currstim  ${d.currstim} , resp ${whResp} , trial ${d.trial}`);
		
		if (isResp == 0) // then it is a toggle of the stimulus
		{
			//console.log(`event ${selection}`);
			var sz_sel = selection.length;
			var selection2d = selection[sz_sel-2] + selection[sz_sel-1];
			//console.log(`event ${selection2d}`);

			$("#" + selection2d).css("background-color", "#9ACDFF");

			//record toggle
			trialData.toggle.push(selection2d);
		}
		else
		{

			//get response time
			d.endTime = Date.now();
			trialData.rt.push(d.endTime - d.startTime);

			//turn off board
			d.allowResponse = false;

			//record response
			trialData.response.push(whResp);

			//get the correct answer
			//var index = d.presentationOrder[d.trial].indexOf(d.probeOrder[d.trial][d.curProbe]);
			//var location = d.presentationLocation[d.trial][index];
			//trialData.probeLocation.push(location);
			

			//record if correct or not
			var isValPos = trialData.keyval > 0;
			var correct = (whResp == isValPos);
			//console.log(`event ${selection} , location ${location} , currstim  ${d.currstim} , trial ${d.trial} isOdd ${isOddLoc}`);

			trialData.correct.push(correct);

			//fadeBoard (p.feedbackTime);
			setTimeout(hideBoard,p.feedbackTime);

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

			// Hide the array
			//hideStimArray();

			setTimeout(hideStimArray, p.feedbackTime);			


			//update the score
			updateScore();

			
			// update staircase before moving onto next trial
			updateStaircase();

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
				//hideStimArray();
				setTimeout(endExpt, p.feedbackTime);
			}
			else {
			    
				//prepare next trial
				//setTimeout(prepareTrial, p.feedbackTime);
				prepareTrial();
			}
		}
	}
}

function playCoin () {
	// play sound of a coin
	var sound = createjs.Sound.play('coin');
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
				//d.seqLength--;
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


	// Register Staircase Progress Visually
	var numCoins = Math.floor(d.up/4);
	var PropBar  = d.up%4;


	if (numCoins > 0) {
		$("#" + 31).css("background-color", "#ffbf00");
		if (PropBar==0) {
			//play incorrect sound
			setTimeout(playCoin,p.feedbackTime/4);	
		}
	} else {$("#" + 31).css("background-color", "#ffffff");}
	
	if (numCoins > 1) {
		$("#" + 32).css("background-color", "#ffbf00");
	} else {$("#" + 32).css("background-color", "#ffffff");}
	
	if (numCoins > 2) {
		$("#" + 33).css("background-color", "#ffbf00");
	} else {$("#" + 33).css("background-color", "#ffffff");}
	
	if (numCoins > 3) {
		$("#" + 34).css("background-color", "#ffbf00");
	} else {$("#" + 34).css("background-color", "#ffffff");}


	// set the filling gradient...
	if (PropBar == 0) {
		if (isIncorrect) {
			var BkGrStr = "linear-gradient(90deg, rgba(255,255,255,1) 0%,  rgba(255,255,255,1) 100%)";
		} else {
			var BkGrStr = "linear-gradient(90deg,rgba(255,255,255,1) 0%, rgba(0,0,255,1) 100%)";
		}
	}
	if (PropBar == 3) {
		var BkGrStr = "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(64,64,255,1) 75%, rgba(255,255,255,1) 75%, rgba(255,255,255,1) 100%)";
	}
	if (PropBar == 2) {
		var BkGrStr = "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(128,128,255,1) 50%, rgba(255,255,255,1) 50%, rgba(255,255,255,1) 100%)";
	}
	if (PropBar == 1) {
		var BkGrStr = "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(192,192,255,1) 25%, rgba(255,255,255,1) 25%, rgba(255,255,255,1) 100%)";
	}


	// apply the gradient
	$("#"+41).css("background", BkGrStr);

	//also change the number of probes
	//d.numProbes = Math.floor(d.seqLength/2);
	// fix number of probes for the time being...
	//d.numProbes = 1;

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
	trialData.toggletimes = [];

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
		$('#added-points').fadeOut(p.feedbackTime);

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
			sequenceLength: d.presentationSequence[d.trial].length,
			sequence: d.presentationSequence[d.trial].join(';'),
			sequencePos: d.presentationLocation[d.trial].join(';'),
			numProbes: d.seqLength,
			probes: d.presentationSequence[d.trial].join(';'),
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

function decodeKey(MK) {
	// sum(MK(15).*([    MK(14).*([   MK(12).*([ MK(8) MK(7)])   MK(11).*([ MK(6) MK(5)]) ])  MK(13).*([   MK(10).*([ MK(4) MK(3)])   MK(9).*( [MK(2) MK(1)]) ])]));
	var Val = 	(MK[14]*MK[13]*MK[11]*MK[7]) + (MK[14]*MK[13]*MK[11]*MK[6]) + 
				(MK[14]*MK[13]*MK[10]*MK[5]) + (MK[14]*MK[13]*MK[10]*MK[4]) + 
				(MK[14]*MK[12]*MK[9]*MK[3])  + (MK[14]*MK[12]*MK[9]*MK[2])  + 
				(MK[14]*MK[12]*MK[8]*MK[1])  + (MK[14]*MK[12]*MK[8]*MK[0])  ;
	return Val
}