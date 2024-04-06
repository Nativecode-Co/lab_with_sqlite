<?php

defined('BASEPATH') or exit('No direct script access allowed');
// include JWT library
require APPPATH . 'libraries/JWT/autoload.php';
use \Firebase\JWT\JWT;
use Firebase\JWT\Key;


class Login extends CI_Controller
{
    public $key = '@@redhaalasd2020@@';


    public function __construct()
    {
        parent::__construct();
        
    }
    
    function login_pre()
    {
        // get headers
        $headers = $this->input->request_headers();
        // Extract the token
        $token = $headers['Authorization'];
        // get token
        $token = str_replace("Bearer ", "", $token);
        try {
            // Validate the token
            $decoded = JWT::decode($token, new Key('@@redhaalasd2020@@', 'HS256'));
            // Check if the token is valid
            if ($decoded === false) {
                // Token is invalid
                $this->output
                    ->set_status_header(401)
                    ->set_content_type('application/json')
                    ->set_output(json_encode(array('message' => 'Unauthorized')));
                exit;
            } else {
                
            }
        } catch (Exception $e) {
            $this->output
                ->set_status_header(401)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('message' => 'Unauthorized')));
            exit;
        }
    }
}
