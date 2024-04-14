<?php
defined('BASEPATH') or exit ('No direct script access allowed');
echo json_encode(
	array(
		"status" => 500,
		"headings" => $heading,
		"message" => $message
	)

);
exit();