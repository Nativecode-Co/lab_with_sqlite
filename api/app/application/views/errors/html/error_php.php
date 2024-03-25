<?php
defined('BASEPATH') or exit ('No direct script access allowed');

echo json_encode(
	array(
		"error" => array(
			"message" => $message,
			"filepath" => $filepath,
			"line" => $line
		)
	)

);
exit();