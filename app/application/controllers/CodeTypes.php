<?php
defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Twilio\TwiML\Messaging\Message;

class CodeTypes extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('Menu_db');
        $this->load->model('CodeType');
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
        $start = intval($this->input->post("start"));
        $length = intval($this->input->post("length"));
        // // check status, start, length, search
        // if (strlen($start) ==0 || strlen($length) ==0 || strlen($status) ==0) {
        //     $output = array(
        //         "status" => 400,
        //         "message" => "الرجاء ادخال جميع البيانات",
        //     );
        //     echo json_encode($output);
        //     exit();
        // }
        $search = $search['value'];
        $result = $this->CodeType->getAll($start ,$length, $search);
        $output = array(
            'status' => 200,
            "recordsTotal" => $result['length'],
            "recordsFiltered" =>$result['length'],
            "data" => $result['codes'],
        );
        echo json_encode($output);
        exit();
    }

    public function get(){
        $hash = $this->input->post('hash');
        // check number
        if(!$hash){
            $output = array(
                "status" => 400,
                "message" => "الرجاء ادخال رقم الكود",
            );
            echo json_encode($output);
            exit();
        }
        $result = $this->CodeType->get($hash);
        $output = array(
            "status" => 200,
            "message" => "تم الحصول على الكود بنجاح",
            "data" => $result,
        );
        echo json_encode($output);
        exit();
    }

    public function create(){
        // all post data
        $name = $this->input->post('name');
        $dur = $this->input->post('dur');
        // check data number,type, hash
        if(!$name || !$dur){
            $output = array(
                "status" => 400,
                "message" => "الرجاء ادخال جميع البيانات",
            );
            echo json_encode($output);
            exit();
        }
        $codes = $this->CodeType->create($name, $dur);
        $output = array(
            "status" => 201,
            "message" => "تم انشاء الكود بنجاح",
            "data" => $codes,
        );
        echo json_encode($output);
        exit();
    }

    public function update(){
        $hash = $this->input->post('hash');
        $name = $this->input->post('name');
        $dur = $this->input->post('dur');
        // decode data
        if(!$hash || !$name || !$dur){
            $output = array(
                "status" => 400,
                "message" => "الرجاء ادخال جميع البيانات",
            );
            echo json_encode($output);
            exit();
        }
        $code = $this->CodeType->update($hash, array(
            "name" => $name,
            "dur" => $dur,
        ));
        $output = array(
            "status" => 200,
            "message" => "تم تعديل الكود بنجاح",
            "data" => $code,
        );
        echo json_encode($output);
        exit();
    }

    public function delete(){
        $hash = $this->input->post('hash');
        // check number
        if(!$hash){
            $output = array(
                "status" => 400,
                "message" => "الرجاء ادخال رقم الكود",
            );
            echo json_encode($output);
            exit();
        }
        $message = '';
        $code = $this->CodeType->delete($hash);
        switch ($code) {
            case 0:
                $message = "الكود غير موجود";
                break;
            case -1:
                $message = "لا يمكن حذف الكود لوجود كرتات مرتبطة به";
                break;
            default:
                $message = "تم حذف الكود بنجاح";
                break;
        }
        $output = array(
            "status" => 200,
            "message" => $message,
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
