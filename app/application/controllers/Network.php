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
        $ip = "http://" . $_SERVER['REMOTE_ADDR'] . ":" . $port;
        $ipAddresses = gethostbynamel($computerName);

        //die(print_r($ipAddresses));
        $myip = "";
        // Output all IP addresses
        foreach ($ipAddresses as $ip) {
            if (strpos($ip, '192.168') === 0) {
                $myip = $ip;
                break; // Stop the loop once we find an IP address starting with "192.168"
            }
        }
        $myip = $myip . ":" . $port;

        echo json_encode(
            array(
                "computerName" => $computerName,
                "url" => $url,
                "ip" => $myip,
                'SERVER_NAME' => $_SERVER['SERVER_NAME'],
                'HTTP_HOST' => $_SERVER['HTTP_HOST'],
                'ip_address' => gethostbyname($url)
            ),
            JSON_UNESCAPED_UNICODE
        );
    }
}
