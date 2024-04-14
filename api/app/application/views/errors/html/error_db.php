<?php
defined('BASEPATH') or exit ('No direct script access allowed');
echo json_encode(
	array(
		"error" => array(
			"heading" => $heading,
			"message" => $message,
		)
	)

);
exit();