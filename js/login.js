//~Global Variables
//array to hold song mood data
var songData = {};
var Moods = ['HAPPY', 'SAD', 'NOSTALGIC', 'RELAXED', 'ANGRY'];
var saveSongIndex = 0;

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
            'user-top-read'
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
    //get the user's top 10 tracks as given by spotify
    function getUserTopTracks(accessToken) {
        return $.ajax({
            url: 'https://api.spotify.com/v1/me/top/tracks?limit=10',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    }
    //gets the first 10 tracks from a playlist (not used currently)
    function getPlaylistTracks(accessToken, userID, playlistID) {
        return $.ajax({
            url: 'https://api.spotify.com/v1/users/' + userID + '/playlists/' + playlistID + '/tracks?limit=10',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    }
    //add a slider in the modal for each mood
    function populateModal() {
        var tempHTML = '';
		 for (var i = 0; i < Moods.length; i++) {
            tempHTML += '<h5>' + Moods[i] + '</h5><form><div class="range-control"><input type="range" min="0" max="10" value="0" step="1" data-thumbwidth="20" oninput="moveOutput(this)" class="slider" id="modalMood' + Moods[i]+ '"><output name="rangeVal">0</output></div></form>'
		 };
		 
		
        $("#modalMoods").html(tempHTML);
    }
    
    var loginButton = document.getElementById('btn-login');
    var headRow = document.getElementById('headerRow');

    loginButton.addEventListener('click', function () {
        login(function (accessToken) {
            userID = '';
            getUserData(accessToken)
                .then(function(response) {
                    loginButton.style.display = 'none';
                    console.log(response);
                    userID = response.id;
                });
            getUserTopTracks(accessToken)
                .then(function (response) {
                    headRow.style.display = 'none';
                    console.log(response);
                    var innerHTML = '<h2 style="margin-top:50px;">Your Top 10 Songs</h2><table class="table table-hover"><thead><tr><th scope="col">#</th><th scope="col">Song</th><th scope="col">Album</th><th scope="col">Artist</th><th scope="col">Mood</th></tr></thead><tbody>';
                    for (i = 0; i < response.items.length; i++) {
                        album = response.items[i].album.name;
                        song = response.items[i].name;
                        uri = response.items[i].uri;
                        //needs to loop for multiple artists
                        artist = '';
                        for (a = 0; a < response.items[i].artists.length-1; a++) {
                            artist += response.items[i].artists[a].name;
                            artist += ', ';
                        }
                        artist += response.items[i].artists[response.items[i].artists.length - 1].name;
                        innerHTML += '<tr><th scope="row">' + i + '</th><td>' + song + '</td><td>' + album + '</td><td>' + artist + '</td><td><button class="btn btn-secondary" type="button" onclick="openMoodModal(\'' + i + '\',\'' + song + '\',\'' + artist + '\',\'' + uri + '\')">Select Mood</button></td></tr>';
                    }
                    innerHTML += '</tbody></table><a class="btn btn-xl btn-primary" style="float:right; margin-bottom: 20px">Submit</a>';
                    $('#trackTable').html(innerHTML);

                });
            populateModal();
        });
    });
})();

//create a song object to store in songData
function createSongObject(song, album, artist) {
    var tempObject = {
        'song': song,
        'album': album,
        'artist': artist,
        'moods': {}
    }
    for (var i = 0; i < Moods.length; i++) {
        tempObject.moods[Moods[i]] = 0;
    }
    return tempObject;
}

function saveSongMoods() {
    //loop over moods in model and update their songData values
	var sliders = $(".slider");
    for (var i = 0; i < sliders.length; i += 1) {
        key = sliders[i].id.substring(9);
        songData[saveSongIndex].moods[key] = sliders[i].value;
		
    }
}

function openMoodModal(index, song, artist, uri) {
	//since we use the same modal for all songs, we have to change out the data for each song
    $("#modalSong").text(song);
    $("#modalArtist").text('by ' + artist);
    $("#modalPlayer").attr('src', 'https://open.spotify.com/embed?uri=' + uri);
    if (!(index in songData)) {
        //create song data objects
        var songObject = createSongObject(song, album, artist);
        songData[index] = songObject;
    }
	var sliders = $(".slider");
    for (var i = 0; i < sliders.length; i += 1) {
		//set sliders to proper position for this song
        key = sliders[i].id.substring(9);
        sliders[i].value = songData[index].moods[key];
    }
    $("#moodModal").modal('toggle');
    saveSongIndex = index;
}

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
