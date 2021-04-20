// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event
		let parent = event.target.parentElement;

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		if (parent.matches('.card.track')){
			handleSelectTrack(parent)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		if (parent.matches('.card.podracer')){
			handleSelectPodRacer(parent)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	try {
		//Get player_id and track_id from the sto
		const  player_id = store.player_id
		const track_id = store.track_id
		// const race = TODO - invoke the API call to create the race, then save the result
		const race = await createRace(player_id, track_id);
		console.log(race, 'createRace::')
		//update the store with the race id
		store.race_id = parseInt(race.ID) - 1;
		console.log(store.race_id)
		// render starting UI
		renderAt('#race', renderRaceStartView(race.Track, race.Cars));
		// The race has been created, now start the countdown
		// call the async function runCountdown
		await runCountdown();
		// call the async function startRace
		await startRace(store.race_id);
		// call the async function runRace
		await runRace(store.race_id);
	} catch(error) {
		console.log(error, 'Problem with handleCreateRace::');
	}
}

function runRace(raceID) {
	return new Promise(resolve => {
	// TODO - use Javascript's built in setInterval method to get race info every 500ms
		let raceInterval = setInterval(async() => {
				let raceStatus = await getRace(raceID);
				console.log(raceStatus);
				if(raceStatus.status === "in-progress"){
					renderAt('#leaderBoard', raceProgress(raceStatus.positions))
				} else if (raceStatus.status === "finished"){
					clearInterval(raceInterval) // to stop the interval from repeating
					renderAt('#race', resultsView(raceStatus.positions)) // to render the results view
					resolve(raceStatus) // resolve the promise
				}
		}, 500);
	}).catch(error => console.log(error))
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			const interval = setInterval(() => {
				if(timer !== 0) {
					document.getElementById('big-numbers').innerHTML = --timer
				} else {
					//if the countdown is done, clear the interval, resolve the promise, and return
					clearInterval(interval);
					resolve();
					return;
				}	
			}, 1000);
			console.log(interval)
		})
	} catch(error) {
		console.log(error, 'problem with runCountdown ::');
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	//save the selected racer to the store
	store.player_id = parseInt(target.id);
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	//save the selected track id to the store
	store.track_id = parseInt(target.id);
	console.log(store.track_id)
	
}

function handleAccelerate() {
	console.log("accelerate button clicked")
	// TODO - Invoke the API call to accelerate
	accelerate(store.race_id);
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function racerName(name)  {
	let newName;

	if(name === "Racer 1") {
		newName = "Luna"
	} else if (name === "Racer 2") {
		newName = "Muffintop"
	} else if (name === "Racer 3") {
		newName = "Kitty"
	} else if (name === "Racer 4") {
		newName = "Princess Caroline"
	} else if (name === "Racer 5") {
		newName = "Gentleman"
	}
	return newName;
}

function trackName(name) {
	let newName;

	if(name === "Track 1") {
		newName = "Kitty's backyard"
	} else if (name === "Track 2") {
		newName = "Roof"
	} else if (name === "Track 3") {
		newName = "Gentleman's living rooms"
	} else if (name === "Track 4") {
		newName = "Fishery"
	} else if (name === "Track 5") {
		newName = "Garden"
	} else if (name === "Track 6") {
		newName = "Ice cream shop"
	}
	return newName;
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${racerName(driver_name)}</h3>
			<p>Top speed: ${top_speed}</p>
			<p>Acceleration: ${acceleration}</p>
			<p>Handling: ${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${trackName(name)}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
		return `
		<header>
			<h1>Race: ${trackName(track.name)}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		if(p.id === store.player_id){
			return `
			<tr>
				<td>
					<h3>${count++} - ${racerName(p.driver_name)} (you) </h3>
				</td>
			</tr>
			
			`
		}
		return `
			<tr>
				<td>
					<h3>${count++} - ${racerName(p.driver_name)}</h3>
				</td>
			</tr>
		`
	}).join(' ')

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				<div class="results">
				${results}
				</div>
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	return fetch(`${SERVER}/api/tracks`)
	.then(res => res.json())
	//.then(data => console.log(data))
	.catch((error) => console.log(error, 'cannot get track information::'))
}

function getRacers() {
	// GET request to `${SERVER}/api/cars`
	return fetch(`${SERVER}/api/cars`)
	.then(res => res.json())
	.catch((error) => console.log(error, 'cannot get car information')) 
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
		})
		.then(res => res.json())
		.catch((error) => (error, "Problem with createRace request::"))
}

function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`)
	.then(res => res.json())
	.catch((error) => console.log(error, "Problem with getRace request::")) 
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	//return await res.json()
	.catch ((error) => console.log("Problem with getRace request::", error))
}


function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
			method: 'POST',
			...defaultFetchOpts()
		})
	.catch ((error) => console.log(error, "Problem with accelerate request::"))
	}
