<?php
defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Activate extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('Menu_db');
        $this->load->model('ActivateCode');
        $this->load->model('LabActivate');
        $this->load->library('ApiMiddelware');
        $token = $this->input->get_request_header('Authorization', TRUE);
        $token = str_replace("Bearer ", "", $token);
        $decoded_array = $this->jwt_dec($token);
        if ($decoded_array == 0) {
            echo json_encode(
                array(
                    "status" => false,
                    "message" => "Invalid token",
                    "isAuth" => $token,
                    "data" => $decoded_array
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
        echo "Codes";
    }

    public function active()
    {
        $code = $this->input->post('code');
        $lab = $this->input->post('lab');
        $hash = $this->input->post('hash');

        // check code, lab
        if (strlen($code) == 0 || strlen($lab) == 0 || $code == 0 || $lab == 0) {
            $output = array(
                "status" => 400,
                "message" => "الرجاء ادخال جميع البيانات بشكل صحيح",
            );
            echo json_encode($output);
            exit();
        }
        $result = $this->ActivateCode->active($lab, $code);
        if ($result) {
            $this->LabActivate->update_or_insert($code, $lab, $hash);
            $last_date = $this->LabActivate->get_last_expire($lab);
            $output = array(
                'status' => 200,
                "message" => "تم تفعيل الكود بنجاح",
                "data" => $last_date
            );
            echo json_encode($output);
            exit();
        } else {
            $output = array(
                'status' => 400,
                "message" => "الكود غير صحيح او تم تفعيله من قبل",
                "data" => $result
            );
            echo json_encode($output);
            exit();
        }
    }

    public function get_last_date()
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