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
	$user_id = $_POST["user_id"];
	array_push($data, $user_id);
	$resp->data = $data;
	/* create a prepared statement */
	if ($stmt = mysqli_prepare($link, "INSERT IGNORE INTO users (user_id) VALUES (?)")) {
		/* execute query */
		mysqli_stmt_bind_param($stmt, "s", $user_id);
		/* bind parameters for markers */
		mysqli_stmt_execute($stmt);
		echo json_encode($resp);
		/* close statement */
		mysqli_stmt_close($stmt);
	}
	/* close connection */
	mysqli_close($link);
?>
