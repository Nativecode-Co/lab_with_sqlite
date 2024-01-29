<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Invoice extends CI_Controller
{

    function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->library('session');
        $this->load->model('Menu_db');
        $this->load->model('InvoiceModel');
        $this->load->library('pagination');
    }


    public function index()
    {
    }

    public function detail()
    {
        header('Content-Type: application/json; charset=utf-8');
        $hash = $this->input->get('pk');
        $labId = $this->input->get('number');

        $visit = $this->db->query(
            "select 
                age,
                (select gender from lab_patient where hash=lab_visits.visits_patient_id limit 1) as gender,
                name,
                DATE(visit_date) as date,
                TIME(visit_date) as time,
                (select name from lab_doctor where hash=lab_visits.doctor_hash) as doctor,
                hash
            from lab_visits where hash = '$hash' and isdeleted='0';"
        )->row_array();
        $visitTests = $this->db->query(
            "select 
                option_test as options,
                test_name as name,
                kit_id,
                (select name from lab_test_units where hash=lab_pakage_tests.unit) as unit_name,
                (select name from lab_test_catigory where hash=lab_test.category_hash) as category,
                unit,
                result_test,
                lab_visits_tests.hash as hash
            from 
                lab_visits_tests 
            inner join
                lab_pakage_tests
            on 
                lab_pakage_tests.test_id = lab_visits_tests.tests_id and lab_pakage_tests.package_id = lab_visits_tests.package_id
            inner join
                lab_test
            on
                lab_test.hash = lab_visits_tests.tests_id
            where 
                visit_id = '${hash}';"
        )->result_array();
        $workers = $this->db->query(
            "SELECT name,jop, jop_en from lab_invoice_worker where lab_hash='$labId' and isdeleted='0' and is_available=1 limit 2;"
        )->result_array();
        $invoices = $this->db->query(
            "select * from lab_invoice where lab_hash='$labId';"
        )->result_array();
        if ($hash) {
            echo json_encode(
                array(
                    'status' => true,
                    'message' => 'success',
                    'data' => array(
                        "visit" => $visit,
                        "visitTests" => $visitTests,
                        "workers" => $workers,
                        "invoices" => $invoices
                    ),
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
        } else {
            echo json_encode(
                array(
                    'status' => false,
                    'message' => 'يجب عليك ادخال رقم الفاتورة',
                    'data' => null,
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
        }
    }

    public function get_or_create()
    {
        $lab_hash = $this->input->get('hash');
        $result = $this->InvoiceModel->get_or_create($lab_hash);
        echo json_encode(
            array(
                'status' => true,
                'message' => 'success',
                'data' => $result,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function update()
    {
        $data = $this->input->post();
        $lab_hash = $data['lab_hash'];
        unset($data['lab_hash']);
        $result = $this->InvoiceModel->update($lab_hash, $data);
        echo json_encode(
            array(
                'status' => true,
                'message' => 'success',
                'data' => $result,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function getLabName()
    {
        $result = $this->InvoiceModel->getLabName();
        echo json_encode(
            array(
                'status' => true,
                'message' => 'success',
                'data' => $result,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }
}