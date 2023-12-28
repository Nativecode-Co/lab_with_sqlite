<?php
defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Calc extends CI_Controller
{

    function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->library('session');
        $this->load->model('Menu_db');
        $this->load->library('pagination');
        header('Content-Type: application/json; charset=utf-8');
        $token = $this->input->post('token');
        if (!$token) {
            echo json_encode(
                array(
                    'status' => true,
                    'message' => 'انتهت صلاحية الدخول',
                    'data' => array(),
                    'isAuth' => false
                ),
                JSON_UNESCAPED_UNICODE
            );
        }
        $this->decoded_array = deCodeToken($token);
    }


    public function index()
    {
        echo json_encode(
            array(
                'status' => true,
                'message' => 'مرحبا بك في عالم البيانات',
                'data' => array(),
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function add_calc_tests_to_visit()
    {
        $tests = $this->input->post('tests');
        $tests = json_decode($tests);
        $visit_hash = $this->input->post('visit_hash');
        $action = $this->input->post('action');

        $lab_id = $this->db->query("SELECT labId FROM lab_visits WHERE hash = '$visit_hash'")->row()->labId;
        if ($action == 'update') {
            $this->db->query("DELETE FROM lab_visits_tests WHERE visit_id = '$visit_hash' AND tests_id IN (SELECT hash FROM lab_test WHERE test_type = 3)");
        }
        $calc_tests = $this->db->query("SELECT option_test,hash FROM lab_test WHERE test_type = 3 and isdeleted =0")->result_array();
        $calc_tests = array_map(function ($calc_test) use ($tests) {
            $calc_test = array(
                'hash' => $calc_test['hash'],
                'tests' => json_decode($calc_test['option_test'], true)['tests']
            );
            // check if calc_test['tests'] is greater then 0
            if (count($calc_test['tests']) == 0) {
                $calc_test['isPart'] = false;
                return $calc_test;
            }
            // check if calc_test['tests'] is part of $tests
            $calc_test['isPart'] = array_intersect($calc_test['tests'], $tests) == $calc_test['tests'];
            if ($calc_test['isPart']) {
                return $calc_test;
            }
        }, $calc_tests);
        // check if calc_test length > 0
        if (count($calc_tests) > 0) {
            foreach ($calc_tests as $calc_test) {
                // random hash is number between 1000000000000000 and 9999999999999999
                if ($calc_test['hash']) {
                    $inserted_hash = rand(1000000000000000, 9999999999999999);
                    $this->db->query("INSERT INTO lab_visits_tests(hash, visit_id, tests_id, lab_id) VALUES ('$inserted_hash','$visit_hash', '" . $calc_test['hash'] . "', '$lab_id')");
                }
            }
        }
        echo json_encode(
            array(
                'tests' => $calc_tests,
            ),
            JSON_UNESCAPED_UNICODE
        );
    }
}

function deCodeJwt($token, $type = "normal")
{
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

// function to decode jwt
function deCodeToken($token)
{
    $decoded_array = deCodeJwt($token);
    if ($decoded_array == 0) {
        echo json_encode(
            array(
                'status' => true,
                'message' => 'انتهت صلاحية الدخول',
                'data' => array(),
                'isAuth' => false
            ),
            JSON_UNESCAPED_UNICODE
        );
        die();
    } else {
        return $decoded_array;
    }
}
