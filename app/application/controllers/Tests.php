<?php
defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Tests extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('Menu_db');
        $this->load->model('Tests_model');
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

    public function getTests()
    {
        $search = $this->input->post('search');
        $search = $search['value'];
        $draw = intval($this->input->post("draw"));
        $start = intval($this->input->post("start"));
        $length = intval($this->input->post("length"));
        $packages = $this->Tests_model->getTests($length, $start, $search);
        $total_rows = $this->Tests_model->record_count($search);
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

    public function getTestsForLab()
    {
        $lab_id = $this->input->post('lab_id');
        $search = $this->input->post('search');
        $search = $search['value'];
        $draw = intval($this->input->post("draw"));
        $start = intval($this->input->post("start"));
        $length = intval($this->input->post("length"));
        $packages = $this->Tests_model->getTestsForLab($length, $start, $search, $lab_id);
        $total_rows = $this->Tests_model->record_count_for_lab($search, $lab_id);
        $output = array(
            "draw" => $draw,
            "recordsTotal" => $total_rows,
            "recordsFiltered" => $total_rows,
            "data" => $packages,
            "search" => $search,
        );

        echo json_encode($output);
        exit();
    }

    public function getCalcTests()
    {
        $search = $this->input->post('search');
        $search = $search['value'];
        $draw = intval($this->input->post("draw"));
        $start = intval($this->input->post("start"));
        $length = intval($this->input->post("length"));
        $packages = $this->Tests_model->getCalcTests($length, $start, $search);
        $total_rows = $this->Tests_model->record_count_calc($search);
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

    public function getVistsByTest()
    {
        $test = $this->input->post('test_id');
        $lab = $this->input->post('lab_id');
        $search = $this->input->post('search');
        $search = $search['value'];
        $draw = intval($this->input->post("draw"));
        $start = intval($this->input->post("start")) ?? 0;
        $length = intval($this->input->post("length")) ?? 10;
        $doctor = $this->input->post("doctor") ?? "";
        $from = $this->input->post("startDate") == "" ? date("Y-m-d") : $this->input->post("startDate");
        $to = $this->input->post("endDate") == "" ? date("Y-m-d") : $this->input->post("endDate");
        // Tests_model->getVistsByTest return data and count
        $array = $this->Tests_model->getVistsByTest($lab, $test, $start, $length, $search, $doctor, $from, $to);
        $total_rows = $array["count"] ?? 0;
        $price = $array["price"] ?? 0;
        $cost = $array["cost"] ?? 0;
        $packages = $array["data"];
        $output = array(
            "draw" => $draw,
            "recordsTotal" => $total_rows,
            "recordsFiltered" => $total_rows,
            "data" => $packages,
            "search" => $search,
            "price" => $price,
            "cost" => $cost
        );
        echo json_encode($output);
        exit();
    }

    public function getVisitsByTests()
    {
        $tests = $this->input->post('tests');
        $lab = $this->input->post('lab_id');
        $doctor = $this->input->post("doctor") ?? "";
        $from = $this->input->post("startDate") == "" ? date("Y-m-d") : $this->input->post("startDate");
        $to = $this->input->post("endDate") == "" ? date("Y-m-d") : $this->input->post("endDate");
        // Tests_model->getVistsByTest return data and count
        $data = $this->Tests_model->getVisitsByTests($lab, $tests, $doctor, $from, $to);
        $output = array(
            "data" => $data,
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