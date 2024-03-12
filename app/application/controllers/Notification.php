<?php
defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Notification extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('Menu_db');
        $this->load->model('Notification_model');
        $this->load->library('ApiMiddelware');
        $token = $this->input->get_request_header('Authorization', TRUE);
        $token = str_replace("Bearer ", "", $token);
        $decoded_array = $this->jwt_dec($token);
        if ($decoded_array == 0) {
            echo json_encode(
                array(
                    "status" => false,
                    "message" => "Invalid token",
                    "isAuth" => false,
                    "data" => null
                ),
                JSON_UNESCAPED_UNICODE
            );
            exit();
        } else {
            $res = $this->Menu_db->check_user_by_hash($decoded_array["hash"], $decoded_array["lab_id"]);
            $token = $this->jwt_enc($res);
        }
    }


    public function index()
    {
        echo "hello world";
    }


    public function get()
    {
        $hash = $this->input->post('hash');
        $data = $this->Notification_model->get($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function create()
    {
        $data = $this->input->post();
        $labs = $data["labs"];
        unset($data["labs"]);
        $data["hash"] = round(microtime(true) * 10000) . rand(0, 1000);
        $res = $this->Notification_model->add($data, $labs);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(
                json_encode(
                    array(
                        "status" => true,
                        "message" => "Notification added successfully",
                        "data" => $res
                    )
                )
            );
    }

    public function update()
    {
        $data = $this->input->post();
        $hash = $data["hash"];
        unset($data["hash"]);
        $labs = $data["labs"];
        unset($data["labs"]);
        $res = $this->Notification_model->update($hash, $data, $labs);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(
                json_encode(
                    array(
                        "status" => true,
                        "message" => "Notification updated successfully",
                        "data" => $res
                    )
                )
            );
    }

    public function delete()
    {
        $hash = $this->input->post('hash');
        $res = $this->Notification_model->delete($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(
                json_encode(
                    array(
                        "status" => true,
                        "message" => "Notification deleted successfully",
                        "data" => $res
                    )
                )
            );
    }
    public function getNotifications()
    {
        $search = $this->input->post('search');
        $search = $search['value'];
        $draw = intval($this->input->post("draw"));
        $start = intval($this->input->post("start"));
        $length = intval($this->input->post("length"));
        $data = $this->Notification_model->getNotifications($length, $start, $search);
        $total_rows = $this->Notification_model->record_count($search);
        $output = array(
            "draw" => $draw,
            "recordsTotal" => $total_rows,
            "recordsFiltered" => $total_rows,
            "data" => $data,
            "search" => $search
        );

        echo json_encode($output);
        exit();
    }

    public function getAll()
    {
        $lab_id = $this->input->post('lab');
        $data = $this->Notification_model->getAll($lab_id);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(
                json_encode(
                    array(
                        "data" => $data,
                        "count" => count($data)
                    )
                )
            );
    }

    public function getLabs()
    {
        $data = $this->Notification_model->getLabs();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(
                json_encode(
                    array(
                        "data" => $data,
                        "count" => count($data)
                    )
                )
            );
    }


    public function jwt_enc($data, $expir = "1900")
    {
        // die($expir);
        $iat = time();
        $exp = $iat + $expir;
        $data["iat"] = $iat;
        $data["exp"] = $exp;
        //die(print_r($data));
        $key = "@@redhaalasd2020@@";
        $payload = $data;
        $jwt = JWT::encode($payload, $key, 'HS256');
        return $jwt;
    }

    public function jwt_dec($token, $type = "normal")
    {
        //die("aaaa");
        try {
            $key = "@@redhaalasd2020@@";
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            $decoded_array = (array) $decoded;
            $exp = $decoded_array["exp"];
            $iat = time();
            //die($exp." x ".$iat." ".$type);
            if ($exp > $iat || $type == "logout")
                return $decoded_array;
            else
                return 0;
        } catch (Exception $e) {
            return 0;
        }
    }
}
