<?php
defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Visit extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('Menu_db');
        $this->load->model('Visit_model');
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

    public function getVisits()
    {
        $search = $this->input->post('search');
        $search = $search['value'];
        $draw = intval($this->input->post("draw"));
        $start = intval($this->input->post("start"));
        $length = intval($this->input->post("length"));
        $current = $this->input->post('current') ?? 0;
        $Visits = $this->Visit_model->getVisits($this->input->post('lab_id'), $length, $start, $search, $current);
        $total_rows = $this->Visit_model->record_count($search, $current);
        $output = array(
            "draw" => $draw,
            "recordsTotal" => $total_rows,
            "recordsFiltered" => $total_rows,
            "data" => $Visits,
            "search" => $search
        );

        echo json_encode($output);
        exit();
    }

    public function history()
    {
        $patient = $this->input->post('patient');
        $visit_date = $this->input->post('date') ?? date("Y-m-d");
        // check patient
        if (!isset($patient) && $patient == "") {
            $output = array(
                "status" => 400,
                "data" => [],
                "message" => "تاكد من ادخال ID المريض"
            );
        } else {
            $tests = $this->Visit_model->patient_history($patient, $visit_date);
            $output = array(
                "status" => 200,
                "data" => $tests,
                "message" => "تم الحصول على البيانات بنجاح"
            );
        }

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

    public function getVisitTests()
    {
        $visit_id = $this->input->post('visitHash');
        $tests = $this->Visit_model->getVisitTests($visit_id);
        $patient = $this->Visit_model->getPatientDetail($visit_id);
        $invoice = $this->Visit_model->getInvoice();
        $workers = $this->Visit_model->getWorkers();
        $output = array(
            "status" => 200,
            "workers" => $workers,
            "patient" => $patient,
            "invoice" => $invoice,
            "tests" => $tests,
            "message" => "تم الحصول على البيانات بنجاح"
        );
        echo json_encode($output);
        exit();
    }

    public function getInvoice()
    {
        $invoice = $this->Visit_model->getInvoice();
        $output = array(
            "status" => 200,
            "invoice" => $invoice,
            "message" => "تم الحصول على البيانات بنجاح"
        );
        echo json_encode($output);
        exit();
    }

    public function setOrderOfHeader()
    {
        $order = $this->input->post('order');
        $this->Visit_model->setOrderOfHeader($order);
        $output = array(
            "status" => 200,
            "message" => "تم تحديث البيانات بنجاح"
        );
        echo json_encode($output);
        exit();
    }

    public function getInvoiceHeader()
    {
        $invoice = $this->Visit_model->getInvoiceHeader();
        $output = array(
            "status" => 200,
            "invoice" => $invoice,
            "message" => "تم الحصول على البيانات بنجاح"
        );
        echo json_encode($output);
        exit();
    }

    public function getUnusedWorkers()
    {
        $workers = $this->Visit_model->getUnusedWorkers();
        $output = array(
            "status" => 200,
            "workers" => $workers,
            "message" => "تم الحصول على البيانات بنجاح"
        );
        echo json_encode($output);
        exit();
    }
}
