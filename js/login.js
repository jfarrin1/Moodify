//~Global Variables
//array to hold song mood data
var songData = {};
var CURRENT_MOOD = [];
var Moods = ['HAPPY', 'SAD', 'NOSTALGIC', 'RELAXING', 'ENERGIZING'];
var saveSongIndex = 0;
var userID = '';
var NUM_TRACKS_DISPLAY = 10;
var accessToken = '';
var NUM_TOP_TRACKS = 0;
var LOADING_ANIMATION = `<div style="align-items: center; border: 4px solid #fae62d; display: flex; height: 6rem; margin: auto; width: 6rem; display:none">
			<svg xmlns="http://www.w3.org/2000/svg" width="72%" height="55%" viewBox="5 0 80 60" syle="margin: 0 auto; overflow: hidden;">
				<path id="wave" fill="none" stroke="#1ed760" stroke-width="4" stroke-linecap="round"></path>
			</svg>
		</div>`;
//GLOBAL API CALLS
//=================================================================================================================

//get audio features for an array of tracks
function getTrackFeatures(accessToken, trackIDs) {
	ids = '';
	for (var i=0; i < trackIDs.length-1; i++){
		ids += trackIDs[i] + ',';
	}
	ids += trackIDs[trackIDs.length-1];
	return $.ajax({
		url: 'https://api.spotify.com/v1/audio-features/?ids=' + ids,
		headers: {
			'Authorization': 'Bearer ' + accessToken
		}
	});
}

//get the user's top artists as given by spotify
function getUserTopArtists() {
	return $.ajax({
		url: 'https://api.spotify.com/v1/me/top/artists?limit=5',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		}
	});
}

function addTrackToPlaylist(playlist){
	 //console.log(playlist);
	 $.ajax({
		url: 'https://api.spotify.com/v1/users/' + userID + '/playlists/' + playlist + '/tracks?uris=' + songData[saveSongIndex].audio_features.uri,
		headers: {
			'Authorization': 'Bearer ' + accessToken
		},
		type: 'POST',
		dataType: "json",
		success: function(response){
				//console.log(response);
		},
		error: function(response) {
				//console.log(response);
				console.log('error!');
		}
	});
	return false;

}

//LOGIN/LOAD TOP SONGS ORDERED API CALLS
//================================================================================================================================
		
(function () {


    function login(callback) {
        var CLIENT_ID = '3f863a7a2d3f413bbee210de4998b268';
        var REDIRECT_URI = 'http://dsg1.crc.nd.edu/moodify/spotify-oauth.html';
        function getLoginURL(scopes) {
            return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
              '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
              '&scope=' + encodeURIComponent(scopes.join(' ')) +
              '&response_type=token';
        }

        var url = getLoginURL([
            'user-top-read',
			'playlist-modify-public',
			'playlist-modify-private'
        ]);

        var width = 450,
            height = 730,
            left = (screen.width / 2) - (width / 2),
            top = (screen.height / 2) - (height / 2);

        window.addEventListener("message", function (event) {
            var hash = JSON.parse(event.data);
            if (hash.type == 'access_token') {
                callback(hash.access_token);
            }
        }, false);

        var w = window.open(url,
                            'Spotify',
                            'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
                           );

    }
    //get basic user data (not used currently)
    function getUserData(accessToken) {
        return $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    }
	//get the user's top tracks as given by spotify
    function getUserTopTracks(accessToken) {
        return $.ajax({
            url: 'https://api.spotify.com/v1/me/top/tracks',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    }
	
	//get the user's top 10 tracks as given by spotify
    function getUserTopTracks(accessToken) {
        return $.ajax({
            url: 'https://api.spotify.com/v1/me/top/tracks?limit=50',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    }
	
    //add a slider in the modal for each mood
    function populateModal() {
        var tempHTML = '';
		 for (var i = 0; i < Moods.length; i++) {
            tempHTML += '<h5>' + Moods[i] + '</h5><form><div class="range-control"><input type="range" min="-5" max="5" value="0" step="1" data-thumbwidth="20" oninput="moveOutput(this)" class="slider" id="modalMood' + Moods[i]+ '"><output name="rangeVal">0</output></div></form>'
		 };
		
        $("#modalMoods").html(tempHTML);
		$("#userMoods").html(tempHTML);
    }

    var loginButton = document.getElementById('btn-login');
    var headRow = document.getElementById('headerRow');

    loginButton.addEventListener('click', function () {
        login(function (access_token) {
			accessToken = access_token;
            getUserData(accessToken)
                .then(function(response) {
                    loginButton.style.display = 'none';
                    //console.log(response);
                    userID = response.id;
					insertUser(userID);
                });
            getUserTopTracks(accessToken)
                .then(function (response) {
					NUM_TOP_TRACKS = response.items.length;
                    headRow.style.display = 'none';
                    //console.log(response);
					var trackIDs = []
                    var innerHTML = '<h2 style="margin-top:50px;">Your Top Songs</h2><table class="table table-hover"><thead><tr><th scope="col">#</th><th scope="col">Song</th><th scope="col">Album</th><th scope="col">Artist</th><th scope="col">Mood</th></tr></thead><tbody>';
                    for (var i = 0; i < response.items.length; i++) {
						trackIDs.push(response.items[i].id);
                        var album = response.items[i].album.name;
                        var song = response.items[i].name;
                        var uri = response.items[i].uri;
                        //needs to loop for multiple artists
                        artist = '';
                        for (var a = 0; a < response.items[i].artists.length-1; a++) {
                            artist += response.items[i].artists[a].name;
                            artist += ', ';
                        }
						var artist_id = response.items[i].artists[0].id;
                        artist += response.items[i].artists[response.items[i].artists.length - 1].name;
						if(i < NUM_TRACKS_DISPLAY){
							innerHTML += '<tr><th scope="row">' + i + '</th><td>' + song + '</td><td>' + album + '</td><td>' + artist + '</td><td><button class="btn btn-secondary moodButton" type="button" onclick="openMoodModal(\'' + i + '\',0)">Select Mood</button></td></tr>';
						}
						//add song to song array(dictionary)
						songData[i] = createSongObject(response.items[i].id, song, album, artist, artist_id);
					}
                    innerHTML += '</tbody></table><a class="btn btn-xl btn-primary" style="float:right; margin-bottom: 20px;" onclick="submitSongData(); document.getElementById(\'page-top\').scrollIntoView(true);">Get Recommendations</a>';
                    //get audio-features for song and add to songData
					getTrackFeatures(accessToken, trackIDs)
						.then(function(response) {
								//console.log(response);
								for (var i=0; i < response.audio_features.length; i++){
									songData[i].audio_features = response.audio_features[i];
									//console.log(response.audio_features[i]);
								}
						});
					$('#trackTable').html(innerHTML);
					//add sliders to mood modal
					populateModal();
					getUserPlaylists(0)
                });
        });
    });
})();

//GENERAL FRONT_END FUNCTIONALITY
//=================================================================================================================================

//get song recommendations
function getSongRecommendations() {
	$('#loader').css('display', 'flex');
	$('#trackTable').html('');
	buildWave(90,60);
	current_mood = [];
	var sliders = $('#userMoods .slider');
	for(var i=0; i<sliders.length; i++){
	 current_mood[i] = sliders[i].value;
	 CURRENT_MOOD[i] = sliders[i].value;
	}
	var seed_artists = '';
	getUserTopArtists().then(function(response){
		NUM_ARTISTS = 5;
		//handle if API call returns 0-4 artists instead of 5
		if (response.items.length < NUM_ARTISTS){
			NUM_ARTISTS = response.items.length;
		}
		if (NUM_ARTISTS){
			seed_artists = response.items[0].id
			for(var i=1; i < NUM_ARTISTS; i ++){
				seed_artists +=',' + response.items[i].id;
			}
		}
	});
	// console.log(seed_artists);
	//call backend python script to pull feature targets
	getFeaturesbyMood(current_mood)
		.then(function (response) {
			var count = 0;
			features = '';
			response = JSON.parse(response);
			// console.log(response);
			for(i in response){
				if (count < Object.keys(response).length-1){
					features += 'target_' + i + '=' + response[i] + '&';
				} else {
					features += 'target_' + i + '=' + response[i];
				}
				count++;
			}
			//console.log(features);
			feature_targets = features;
			//console.log(seed_artists);
			$.ajax({
				url: 'https://api.spotify.com/v1/recommendations?seed_artists=' + seed_artists + '&' + feature_targets,
				headers: {
					'Authorization': 'Bearer ' + accessToken
				},
				success: function(response){
					//console.log(response);
					var innerHTML = '<h2 style="margin-top:50px;">Your Recommended Songs</h2><table class="table table-hover"><thead><tr><th scope="col">#</th><th scope="col">Song</th><th scope="col">Album</th><th scope="col">Artist</th><th scope="col">Mood</th></tr></thead><tbody>';
                    var trackIDs = []
					for (var i = 0; i < response.tracks.length; i++) {
						trackIDs.push(response.tracks[i].id);
                        var album = response.tracks[i].album.name;
                        var song = response.tracks[i].name;
                        var uri = response.tracks[i].uri;
                        //needs to loop for multiple artists
                        artist = '';
                        for (var a = 0; a < response.tracks[i].artists.length-1; a++) {
                            artist += response.tracks[i].artists[a].name;
                            artist += ', ';
                        }
                        artist += response.tracks[i].artists[response.tracks[i].artists.length - 1].name;
						var artist_id = response.tracks[i].artists[0].id;
						if(i < NUM_TRACKS_DISPLAY){
							innerHTML += '<tr><th scope="row">' + i + '</th><td>' + song + '</td><td>' + album + '</td><td>' + artist + '</td><td><button class="btn btn-secondary moodButton" type="button" onclick="openMoodModal(\'' + (i + NUM_TOP_TRACKS) + '\',1)">Listen</button></td></tr>';
						}
						//add song to song array(dictionary)
						songData[NUM_TOP_TRACKS + i] = createSongObject(response.tracks[i].id, song, album, artist, artist_id);
					}
                    innerHTML += '</tbody></table><a class="btn btn-xl btn-primary" style="float:right; margin-bottom: 20px;" onclick="$(\'#userMoodModal\').modal(\'toggle\'); document.getElementById(\'page-top\').scrollIntoView(true);">Change Mood</a>';
                    getTrackFeatures(accessToken, trackIDs)
						.then(function(response) {
								//console.log(response);
								//console.log(songData);
								if(response.audio_features[0] != null){
									for (var i=0; i < response.audio_features.length; i++){
									songData[i+NUM_TOP_TRACKS].audio_features = response.audio_features[i];
									//console.log(response.audio_features[i]);
									}
								} else alert('error 429, too many requests. Please reload the webpage and try again.');
								
						});
					$('#trackTable').html(innerHTML);
					$('header.masthead').css('background-image', 'linear-gradient(90deg,#f037a5,#fae62d)');
					$('#loader').css('display', 'none');
				},
				error: function(response){
					console.log('error');
					consoloe.log(response);
				}
			});
		});
}

//create a song object to store in songData
function createSongObject(id, song, album, artist, artist_id) {
	var tempObject = {
		'song': song,
		'album': album,
		'artist': artist,
		'id' : id,
		'artist_id' : artist_id
	}
	return tempObject;
}

function saveSongMoods() {
    //loop over moods in model and update their songData values
	var sliders = $("#modalMoods .slider");
    for (var i = 0; i < sliders.length; i += 1) {
        key = sliders[i].id.substring(9);
        songData[saveSongIndex].moods[key] = sliders[i].value;
    }
	var moodButtons = $(".moodButton");
	songIndex = saveSongIndex;
	if (saveSongIndex >= NUM_TOP_TRACKS) {songIndex = saveSongIndex - NUM_TOP_TRACKS};
	moodButtons[songIndex].className = 'btn btn-primary moodButton';
	songData[saveSongIndex]['saved'] = 1;
}

//Load user playlists
function getUserPlaylists(offset){
	 //console.log(user_id);
	 $.ajax({
		url: 'https://api.spotify.com/v1/me/playlists?offset=' + offset,
		headers: {
			'Authorization': 'Bearer ' + accessToken
		},
		dataType: "json",
		success: function(response){
			//console.log(response);
			$.each(response.items, function (i, item) {
				if(item.owner.id != 'spotify'){
					$('#playlistDropDown').append($('<option>', { 
						value: item.id,
						text : item.name 
					}));
				}
			});
			if (response.next != null){
				nextPage = response.next;
				getUserPlaylists(offset+20);
			}
		},
		error: function(response) {
			//console.log(response);
			console.log('error!');
		}
	});
	return false;

}

function openMoodModal(index, recommended) {
	//since we use the same modal for all songs, we have to change out the data for each song
	var song = songData[index].song;
	var artist = songData[index].artist;
	var uri = songData[index].audio_features.uri;
    $("#modalSong").text(song);
    $("#modalArtist").text('by ' + artist);
    $("#modalPlayer").attr('src', 'https://open.spotify.com/embed?uri=' + uri);
	if(recommended){
		innerHTML = `
			<div class="input-group mb-3" style="width:100%; margin-top:15px;">
				<div class="input-group-prepend" style="width:75%">
					<label style="width:100%" class="input-group-text" for="inputGroupSelect01">Do you like this song?</label>
				</div>
				<select class="custom-select" id="likedSelect">
					<option selected>Choose...</option>
					<option value="1">Yes</option>
					<option value="0">No</option>
				</select>
			</div>
			<div class="input-group mb-3" style="width:100%; margin-top: 15px;">
				<div class="input-group-prepend" style="width:75%">
					<label style="width:100%;" class="input-group-text" for="inputGroupSelect02">Does this song match your current mood?</label>
				</div>
				<select class="custom-select" id="matchedSelect" onchange="toggleShowMoods()">
					<option selected>Choose...</option>
					<option value="1">Yes</option>
					<option value="0">No</option>
				</select>
			</div>
		`;
		$('#modalFeedback').html(innerHTML);
		$('#modalMoods').css('display', 'none');
		$('#feedbackHeader').css('display', 'none');
		$('#moodModalSubmit').attr('onclick','submitRecommendedSong()');
		$('#moodModalSubmit').attr('data-dismiss','');
		$('#moodModalSubmit').html('Submit');
		$('#playlistDropDown').css('display', 'block');
		$('#playlistDropDown').val('ADD TRACK TO PLAYLIST...');
	}
	if (!('moods' in songData[index])) {
		//create mood attribute and set all to default 0
		songData[index].moods = {};
		for (var i = 0; i < Moods.length; i++) {
			if(recommended) songData[index].moods[Moods[i]] = CURRENT_MOOD[i];
			else songData[index].moods[Moods[i]] = 0;
		}
	}
	var sliders = $("#modalMoods .slider");
	for (var i = 0; i < sliders.length; i += 1) {
		//set sliders to proper position for this song
		key = sliders[i].id.substring(9);
		sliders[i].value = songData[index].moods[key];
		moveOutput(sliders[i]);
	}
	// }
	
	$("#moodModal").modal('toggle');
	saveSongIndex = index;
} 

function submitSongData(){
	// console.log(songData);
	var songs = [];
	for(var i in songData){
		if ('saved' in songData[i]){
			songs.push(songData[i]);
		}
	}
	insertSongs(songs, userID);
	$("#userMoodModal").modal('toggle');
};

//used to move the output display bubble above the slider
function moveOutput(slider){
  var control = $(slider),
    controlMin = control.attr('min'),
    controlMax = control.attr('max'),
    controlVal = control.val(),
    controlThumbWidth = control.data('thumbwidth');

  var range = controlMax - controlMin;
  
  var position = ((controlVal - controlMin) / range) * 100;
  var positionOffset = Math.round(controlThumbWidth * position / 100) - (controlThumbWidth / 2);
  var output = control.next('output');
  
  output
    .css('left', 'calc(' + position + '% - ' + positionOffset + 'px)')
    .text(controlVal);
};

function toggleShowMoods(){
	var matched = $('#matchedSelect').val();
	if (matched == 0){
		$('#modalMoods').css('display', 'block');
		$('#feedbackHeader').css('display', 'block');
	} else {
		$('#modalMoods').css('display', 'none');
		$('#feedbackHeader').css('display', 'none');
	}
}


function submitRecommendedSong(){
	var liked = $('#likedSelect').val();
	var matched = $('#matchedSelect').val();
	var playlist = $('#playlistDropDown').val();
	if(liked == "Choose..." || matched == "Choose..."){
		alert('Please select a response to both questions (or click the \'x\' in the top-right to exit without saving)');
		return
	} else {
		$("#moodModal").modal('toggle');
		updatePerformance(liked, matched);
		saveSongMoods();
		var songs = [songData[saveSongIndex]];
		insertSongs(songs, userID);
	}
	if(playlist != 'ADD TRACK TO PLAYLIST...'){
		addTrackToPlaylist(playlist);
	}
}
