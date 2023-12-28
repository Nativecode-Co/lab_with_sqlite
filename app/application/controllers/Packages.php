<?php
defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Packages extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('Menu_db');
        $this->load->model('Package_model');
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

    public function getPackagesForLab()
    {
        $search = $this->input->post('search');
        $search = $search['value'];
        $draw = intval($this->input->post("draw"));
        $start = intval($this->input->post("start"));
        $length = intval($this->input->post("length"));
        $packages = $this->Package_model->getPackagesForLAb($this->input->post('lab_id'), $length, $start, $search);
        $total_rows = $this->Package_model->record_count_packages($search);
        $output = array(
            "draw" => $draw,
            "recordsTotal" => $total_rows,
            "recordsFiltered" => $total_rows,
            "data" => $packages,
            "search" => $search
        );

        echo json_encode($output);
        exit();
    }

    public function getOffersForLab()
    {
        $search = $this->input->post('search');
        $search = $search['value'];
        $draw = intval($this->input->post("draw"));
        $start = intval($this->input->post("start"));
        $length = intval($this->input->post("length"));
        $packages = $this->Package_model->getOffersForLAb($this->input->post('lab_id'), $length, $start, $search);
        $total_rows = $this->Package_model->record_count_offers($search);
        $output = array(
            "draw" => $draw,
            "recordsTotal" => $total_rows,
            "recordsFiltered" => $total_rows,
            "data" => $packages,
            "search" => $search
        );

        echo json_encode($output);
        exit();
    }

    public function createPackageNoKits()
    {
        $labId = $this->input->post('lab_id');
        $data = $this->Package_model->CreatePackageNoKits($labId);
        $this->Package_model->addDefaultPackage($labId);
        echo json_encode(
            array(
                "status" => true,
                "message" => "Success",
                "isAuth" => true,
                "data" => $data,
                "token" => null
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function updateCostAndPrice()
    {
        $cost = $this->input->post('cost');
        $price = $this->input->post('price');
        $hash = $this->input->post('hash');
        $data = $this->Package_model->updateCostAndPrice($cost, $price, $hash);
        echo json_encode(
            array(
                "status" => true,
                "message" => "Success",
                "isAuth" => true,
                "data" => $data,
                "token" => null
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function getKitsAndUnitsByTestName()
    {
        $name = $this->input->post('name');
        $hash = $this->input->post('hash');
        $kits = $this->Package_model->getKitsByTestName($name, $hash);
        $units = $this->Package_model->getUnitsByTestName($name, $hash);
        echo json_encode(
            array(
                "status" => true,
                "message" => "Success",
                "isAuth" => true,
                "data" => array(
                    "kits" => $kits,
                    "units" => $units
                ),
                "token" => null
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function createNewTest()
    {
        $data = $this->input->post();
        // return data
        $result = $this->Package_model->createNewTest($data);
        if ($result === false) {
            echo json_encode(
                array(
                    "status" => false,
                    "message" => "هذا التحليل موجود بالفعل",
                    "isAuth" => true,
                    "data" => null,
                    "token" => null
                ),
                JSON_UNESCAPED_UNICODE
            );
            exit();
        }
        echo json_encode(
            array(
                "status" => true,
                "message" => "Success",
                "isAuth" => true,
                "data" => $result,
                "token" => null
            ),
            JSON_UNESCAPED_UNICODE
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