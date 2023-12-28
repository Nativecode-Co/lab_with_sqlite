<?php
defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class LastDate extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('LabActivate');
        $this->load->library('ApiMiddelware');
    }


    public function index()
    {
        echo "Codes";
    }

    public function get()
    {
        $lab = $this->input->post('lab');
        // check lab 
        if (isset($lab) == false) {
            $output = array(
                "status" => 400,
                "message" => "الرجاء ادخال جميع البيانات",
            );
            echo json_encode($output);
            exit();
        }
        $result = $this->LabActivate->get_last_expire($lab);
        if ($result) {
            $output = array(
                'status' => 200,
                "message" => "تم الحصول على البيانات بنجاح",
                "data" => $result
            );
            echo json_encode($output);
            exit();
        } else {
            $output = array(
                'status' => 400,
                "message" => "لم يتم الحصول على البيانات",
                "data" => $result
            );
            echo json_encode($output);
            exit();
        }
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
