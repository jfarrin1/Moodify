<?php
	class response {
		public $status;
		public $data;
	};

	$link = mysqli_connect('localhost', 'jfarrin1', 'jfarrin1') or die('Could not connect: ' . mysql_error());
	mysqli_select_db($link, 'jfarrin1') or die('Could not select database');
	$resp = new response;
	$resp->status = "connected";
	$data = array();
	$songs = json_decode($_POST["songs"]);
	$user_id = $_POST["user_id"];
	array_push($data, $songs, $user_id);
	$resp->data = $data;
	/* create a prepared statement */
	if ($stmt = mysqli_prepare($link, "INSERT INTO songs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE happy = ?, sad = ?, nostalgic = ?, relaxing = ?, energizing = ?")) {
		/* Loop over all songs */
		foreach($songs as $song){
			$song_id = $song->id;
			$song_user_id = $user_id;
			$song_name = $song->song;
			$song_album = $song->album;
			$song_artist = $song->artist;
			$song_danceability = $song->audio_features->danceability;
			$song_energy = $song->audio_features->energy;
			$song_key = $song->audio_features->key;
			$song_loudness = $song->audio_features->loudness;
			$song_mode = $song->audio_features->mode;
			$song_acousticness = $song->audio_features->acousticness;
			$song_speechiness = $song->audio_features->speechiness;
			$song_instrumentalness = $song->audio_features->instrumentalness;
			$song_liveness = $song->audio_features->liveness;
			$song_valence = $song->audio_features->valence;
			$song_tempo = $song->audio_features->tempo;
			$song_duration_ms = $song->audio_features->duration_ms;
			$song_time_signature = $song->audio_features->time_signature;
			$song_happy = $song->moods->HAPPY;
			$song_sad = $song->moods->SAD;
			$song_nostalgic = $song->moods->NOSTALGIC;
			$song_relaxing = $song->moods->RELAXING;
			$song_energizing = $song->moods->ENERGIZING;
			
			/* execute query */
			mysqli_stmt_bind_param($stmt, "ssssssssssssssssssssssssssss", $song_id, $song_user_id, $song_name, $song_album, $song_artist, $song_danceability, $song_energy, $song_key, $song_loudness, $song_mode, $song_acousticness, $song_speechiness, $song_instrumentalness, $song_liveness, $song_valence, $song_tempo, $song_duration_ms, $song_time_signature, $song_happy, $song_sad, $song_nostalgic, $song_relaxing, $song_energizing, $song_happy, $song_sad, $song_nostalgic, $song_relaxing, $song_energizing);
			/* bind parameters for markers */
			mysqli_stmt_execute($stmt);	
		}
		echo json_encode($resp);
		/* close statement */
		mysqli_stmt_close($stmt);
	}
	/* close connection */
	mysqli_close($link);
?>
