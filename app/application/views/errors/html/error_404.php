<?php
echo json_encode(
	array(
		"status" => 404,
		"error" => array(
			"heading" => $heading,
			"message" => $message
		)
	)
);
exit();