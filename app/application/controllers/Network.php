<?php
defined('BASEPATH') or exit('No direct script access allowed');


class Network extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
    }


    public function index()
    {
        $computerName = gethostname();
        $port = 8807;
        $url = "http://" . $computerName . ":" . $port;
        $ip = "http://" . $_SERVER['SERVER_NAME'] . ":" . $port;
        echo json_encode(
            array(
                "computerName" => $computerName,
                "url" => $url,
                "ip" => $ip,
                'SERVER_NAME' => $_SERVER['SERVER_NAME'],
                'HTTP_HOST' => $_SERVER['HTTP_HOST'],
                'ip_address' => gethostbyname($url)
            ),
            JSON_UNESCAPED_UNICODE
        );
    }
}