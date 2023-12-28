<?php
defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Code extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('Menu_db');
        $this->load->model('Codes');
        $this->load->library('ApiMiddelware');
        $token = $this->input->get_request_header('Authorization', TRUE);
        $token = str_replace("Bearer ", "", $token);
        $decoded_array = $this->jwt_dec($token);
        if ($decoded_array == 0) {
            echo json_encode(array(
                "status" => false,
                "message" => "Invalid token",
                "isAuth" => $token,
                "data" => null
            ), JSON_UNESCAPED_UNICODE);
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

    public function getAll()
    {
        $search = $this->input->post('search');
        $type = $this->input->post('columns[1][search][value]');
        $start = intval($this->input->post("start"));
        $length = intval($this->input->post("length"));
        $status = $this->input->post('columns[2][search][value]');
        $customer = $this->input->post('columns[3][search][value]');
        $date = $this->input->post('columns[4][search][value]');
        $search = $search['value'];

        $result = $this->Codes->getCodes($start, $length, $search, $status, $type, $customer, $date);
        $output = array(
            'status' => 200,
            "recordsTotal" => $result['length'],
            "recordsFiltered" => $result['length'],
            "data" => $result['codes'],
        );
        echo json_encode($output);
        exit();
    }

    public function get()
    {
        $number = $this->input->post('number');
        // check number
        if (!$number) {
            $output = array(
                "status" => 400,
                "message" => "الرجاء ادخال رقم الكود",
            );
            echo json_encode($output);
            exit();
        }
        $result = $this->Codes->getCode($number);
        $output = array(
            "status" => 200,
            "message" => "تم الحصول على الكود بنجاح",
            "data" => $result,
        );
        echo json_encode($output);
        exit();
    }

    public function create()
    {
        $type = $this->input->post('type');
        $number = $this->input->post('number');
        $hash = $this->input->post('hash');
        $customer = $this->input->post('customer') ?? "";
        // check data number,type, hash
        if (!$type || !$number || !$hash) {
            $output = array(
                "status" => 400,
                "message" => "الرجاء ادخال جميع البيانات",
            );
            echo json_encode($output);
            exit();
        }
        $codes = $this->Codes->createCodes($number, $type, $hash, $customer);
        $output = array(
            "status" => 201,
            "message" => "تم انشاء الاكواد بنجاح",
            "data" => $codes,
        );
        echo json_encode($output);
        exit();
    }

    public function update()
    {
        $number = $this->input->post('number');
        $data = $this->input->post('data');
        // decode data
        $data = json_decode($data);
        // check data number,type
        if (!$data->number || !$data) {
            $output = array(
                "status" => 400,
                "message" => "الرجاء ادخال جميع البيانات",
            );
            echo json_encode($output);
            exit();
        }
        $code = $this->Codes->updateCode($number, $data);
        $output = array(
            "status" => 200,
            "message" => "تم تعديل الكود بنجاح",
            "data" => $code,
        );
        echo json_encode($output);
        exit();
    }

    public function delete()
    {
        $number = $this->input->post('number');
        // check number
        if (!$number) {
            $output = array(
                "status" => 400,
                "message" => "الرجاء ادخال رقم الكود",
            );
            echo json_encode($output);
            exit();
        }
        $code = $this->Codes->deleteCode($number);
        $output = array(
            "status" => 200,
            "message" => "تم حذف الكود بنجاح",
            "data" => $code,
        );
        echo json_encode($output);
        exit();
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
