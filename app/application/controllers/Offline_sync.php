<?php
defined('BASEPATH') or exit ('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
class Offline_sync extends CI_Controller
{

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Offline_sync_model');
    }

    public function index()
    {
        $resultQueries = $this->Offline_sync_model->offline_sync_query();
        $lab_id = $this->db->get('lab')->row()->id;
        // get user data
        $user = $this->db->get('system_users')->row_array();
        $token = $this->jwt_enc($user);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(
                json_encode(
                    array(
                        'queries' => $resultQueries,
                        'lab_id' => $lab_id,
                        'token' => $token
                    )
                )
            );
    }

    public function jwt_enc($data, $expir = "1900")
    {
        $iat = time();
        $exp = $iat + $expir;
        $data["iat"] = $iat;
        $data["exp"] = $exp;
        $key = "@@redhaalasd2020@@";
        $payload = $data;
        $jwt = JWT::encode($payload, $key, 'HS256');
        return $jwt;
    }

    public function update_sync()
    {
        $this->Offline_sync_model->update_offline_sync();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array('message' => 'Sync updated')));
    }

    public function trancate_sync()
    {
        $this->Offline_sync_model->trancate_offline_sync();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array('message' => 'Sync trancated')));
    }
}