<?php
defined('BASEPATH') or exit ('No direct script access allowed');

echo json_encode(
	array(
		"error" => array(
			"message" => $message,
			"file" => $exception->getFile(),
			"line" => $exception->getLine(),
			"trace" => $exception->getTrace()
		)
	)

);
exit();
