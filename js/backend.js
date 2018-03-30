function insertUser(user_id){
         //console.log(user_id);
         $.ajax({
                url: './php/insert_user.php',
                type: 'POST',
                dataType: "json",
                data: {
                        user_id: user_id
                },
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

function insertSongs(songs, user_id){
		songJSON = JSON.stringify(songs);
        //console.log(songs, user_id);
         $.ajax({
                url: './php/insert_songs.php',
                type: 'POST',
                dataType: "json",
                data: {
                        songs: songJSON,
						user_id: user_id
                },
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
