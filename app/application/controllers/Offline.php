<?php

defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Offline extends CI_Controller
{

    function __construct()
    {
        parent::__construct();
        $this->load->model('User_model');
        $this->load->model('Menu_db');
        // access control api 
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description, Authorization');
        header('Content-Type: application/x-www-form-urlencoded');
        header('Content-Type: application/json');
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

    public function auth()
    {
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

    public function login()
    {
        $username = $this->input->post('username');
        $password = $this->input->post('password');
        $type = $this->input->post('type');
        $user = $this->User_model->verify_user($username, $password);
        if (!$user) {
            echo json_encode(
                array(
                    'status' => false,
                    'message' => 'اسم المستخدم او كلمة المرور غير صحيحة',
                    'data' => array(
                        'username' => $username,
                        'password' => $password,
                        'user' => $user
                    ),
                    'isAuth' => false
                ),
                JSON_UNESCAPED_UNICODE
            );
        } else if ($type == "user") {
            echo json_encode(
                array(
                    'status' => true,
                    'message' => 'تم تسجيل الدخول بنجاح',
                    "data" => $user,
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
        } else {
            $lab_id = $user->lab_id;
            $queries = "";
            switch ($type) {
                case 'doctors':
                    $doctors = $this->db->query("select * from lab_doctor where lab_id='$lab_id'")->result();
                    if (count($doctors) > 0) {
                        $doctors_query = "insert into lab_doctor(" . implode(",", array_keys((array) $doctors[0])) . ") values ";
                        $doctors_values = array_map(function ($doctor) {
                            return "('" . implode("','", array_values((array) $doctor)) . "')";
                        }, $doctors);
                        $doctors_query .= implode(",", $doctors_values);
                        $queries .= $doctors_query;
                    } else {
                        $doctors_query = '';
                    }
                    break;
                case 'patients':
                    $patients = $this->db->query("select * from lab_patient where lab_id='$lab_id'")->result();
                    if (count($patients) > 0) {
                        $patients_query = "insert into lab_patient(" . implode(",", array_keys((array) $patients[0])) . ") values ";
                        $patients_values = array_map(function ($patient) {
                            return "('" . implode("','", array_values((array) $patient)) . "')";
                        }, $patients);
                        $patients_query .= implode(",", $patients_values);
                        $queries .= $patients_query;
                    } else {
                        $patients_query = '';
                    }
                    break;
                case 'package_tests':
                    $package_tests = $this->db->query("select * from lab_pakage_tests where lab_id='$lab_id'")->result();
                    if (count($package_tests) > 0) {
                        $package_tests_query = "insert into lab_pakage_tests(" . implode(",", array_keys((array) $package_tests[0])) . ") values ";
                        $package_tests_values = array_map(function ($package_test) {
                            return "('" . implode("','", array_values((array) $package_test)) . "')";
                        }, $package_tests);
                        $package_tests_query .= implode(",", $package_tests_values);
                        $queries .= $package_tests_query;
                    } else {
                        $package_tests_query = '';
                    }
                    break;
                case 'packages':
                    $packages = $this->db->query("select * from lab_package where lab_id='$lab_id'")->result();
                    if (count($packages) > 0) {
                        $packages_query = "insert into lab_package(" . implode(",", array_keys((array) $packages[0])) . ") values ";
                        $packages_values = array_map(function ($package) {
                            return "('" . implode("','", array_values((array) $package)) . "')";
                        }, $packages);
                        $packages_query .= implode(",", $packages_values);
                        $queries .= $packages_query;
                    } else {
                        $packages_query = '';
                    }
                    break;
                case 'visits':
                    $visits = $this->db->query("select * from lab_visits where labId='$lab_id'")->result();
                    if (count($visits) > 0) {
                        $visits_query = "insert into lab_visits(" . implode(",", array_keys((array) $visits[0])) . ") values ";
                        $visits_values = array_map(function ($visit) {
                            return "('" . implode("','", array_values((array) $visit)) . "')";
                        }, $visits);
                        $visits_query .= implode(",", $visits_values);
                        $queries .= $visits_query;
                    } else {
                        $visits_query = '';
                    }
                    break;
                case 'visits_packages':
                    $visits_packages = $this->db->query("select * from lab_visits_package where lab_id='$lab_id'")->result();
                    if (count($visits_packages) > 0) {
                        $visits_packages_query = "insert into lab_visits_package(" . implode(",", array_keys((array) $visits_packages[0])) . ") values ";
                        $visits_packages_values = array_map(function ($visits_package) {
                            return "('" . implode("','", array_values((array) $visits_package)) . "')";
                        }, $visits_packages);
                        $visits_packages_query .= implode(",", $visits_packages_values);
                        $queries .= $visits_packages_query;
                    } else {
                        $visits_packages_query = '';
                    }
                    break;
                case 'visits_tests':
                    $visits_tests = $this->db->query("select * from lab_visits_tests where lab_id='$lab_id'")->result();
                    if (count($visits_tests) > 0) {
                        $visits_tests_query = "insert into lab_visits_tests(" . implode(",", array_keys((array) $visits_tests[0])) . ") values ";
                        $visits_tests_values = array_map(function ($visits_test) {
                            return "('" . implode("','", array_values((array) $visits_test)) . "')";
                        }, $visits_tests);
                        $visits_tests_query .= implode(",", $visits_tests_values);
                        $queries .= $visits_tests_query;
                    } else {
                        $visits_tests_query = '';
                    }
                    break;
                case 'workers':
                    $workers = $this->db->query("select * from lab_invoice_worker where lab_hash='$lab_id'")->result();
                    if (count($workers) > 0) {
                        $workers_query = "insert into lab_invoice_worker(" . implode(",", array_keys((array) $workers[0])) . ") values ";
                        $workers_values = array_map(function ($worker) {
                            return "('" . implode("','", array_values((array) $worker)) . "')";
                        }, $workers);
                        $workers_query .= implode(",", $workers_values);
                        $queries .= $workers_query;
                    } else {
                        $workers_query = '';
                    }
                    break;
                case 'invoice':
                    $invoice = $this->db->query("select * from lab_invoice where lab_hash='$lab_id'")->result();
                    if (count($invoice) > 0) {
                        $invoice_query = "insert into lab_invoice(" . implode(",", array_keys((array) $invoice[0])) . ") values ";
                        $invoice_values = array_map(function ($invoice) {
                            return "('" . implode("','", array_values((array) $invoice)) . "')";
                        }, $invoice);
                        $invoice_query .= implode(",", $invoice_values);
                        $queries .= $invoice_query;
                    } else {
                        $invoice_query = '';
                    }
                    break;
                case 'lab':
                    $lab = $this->db->query("select id, region_id, class_id, type, certification_id, hash, name, phone, owner, email, user_id, attachment, checked, is_blackList, is_active, is_deleted, date, updated_at from lab where id='$lab_id'")->result();
                    if (count($lab) > 0) {
                        $lab_query = "insert into lab(" . implode(",", array_keys((array) $lab[0])) . ") values ";
                        $lab_values = array_map(function ($lab) {
                            return "('" . implode("','", array_values((array) $lab)) . "')";
                        }, $lab);
                        $lab_query .= implode(",", $lab_values);
                        $queries .= $lab_query;
                    } else {
                        $lab_query = '';
                    }
                    break;


                default:

                    break;
            }
            echo json_encode(
                array(
                    'status' => true,
                    'message' => 'تم تسجيل الدخول بنجاح',
                    "queries" => array($queries),
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );


        }
    }

    public function getUserCount()
    {
        $userCount = $this->User_model->get_user_count();
        echo json_encode(
            array(
                'status' => true,
                'message' => 'عدد المستخدمين',
                'data' => $userCount,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function getAsyncData()
    {
        $this->db->query(
            "SET SESSION group_concat_max_len = 100000;"
        );
        $date = $this->input->post('date');
        $queries = $this->db->query("select * from offline_sync where lab_id='0' and date_time>='$date' and operation != 'update' and table_name not in ('lab')")->result();
        $updatQueries = $this->db->query("select * from offline_sync where lab_id='0' and table_name  in ('lab_test') and operation = 'update';")->result();
        $inserts = array();
        $deletes = array();
        $updates = array();
        array_map(function ($query) use (&$inserts, &$deletes) {
            if ($query->operation == 'insert') {
                array_push($inserts, $query);
            } else {
                array_push($deletes, $query);
            }
        }, $queries);
        array_map(function ($query) use (&$updates) {
            $pattern = '/\bhash=([0-9]+)/';
            preg_match($pattern, $query->query, $matches);
            if (count($matches) > 0) {
                $hash = $matches[1];
            } else {
                $pattern = "/\bhash='([0-9]+)/";
                preg_match($pattern, $query->query, $matches);
                if (count($matches) > 0) {
                    $hash = $matches[1];
                } else {
                    $pattern = "/`id`\s*=\s*'(\d+)'/i";
                    preg_match($pattern, $query->query, $matches);
                    if (count($matches) > 0) {
                        $hash = $matches[1];
                    } else {
                        $hash = 0;
                    }
                }
            }
            $query->hash = $hash;
            array_push($updates, $query);
        }, $updatQueries);
        echo json_encode(
            array(
                'status' => true,
                'message' => 'عرض البيانات',
                'data' => $queries,
                'isAuth' => true,
                'inserts' => $inserts,
                'updates' => $updates,
                'deletes' => $deletes
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function getLastVersion()
    {
        $version = $this->db->query("select version from lab_version order by id desc limit 1")->row();
        $version = $version->version;
        echo $version;
    }

    public function setVersion()
    {
        // auth 
        $this->auth();
        // get last version
        $version = $this->db->query("select version from lab_version where isdeleted=0 order by id desc limit 1")->row();
        // check if version is null
        if (!$version) {
            $version = 0;
        } else {
            $version = $version->version;
        }
        $version = $version + 1;
        $this->db->query("update lab_version set isdeleted=1 where isdeleted=0");
        // insert new version
        $this->db->query("insert into lab_version(version) values('$version')");
        echo json_encode(
            array(
                'status' => true,
                'message' => 'تم تحديث النسخة',
                'data' => $version,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function insertIntoLab_test()
    {
        // auth 
        $this->auth();
        $result = false;
        $lab_id = $this->input->post('lab_id');
        // start transaction
        $this->db->trans_start();
        $this->db->query("SET SQL_SAFE_UPDATES = 0");
        $this->db->query("delete from lab_test where lab_hash='$lab_id'");
        // get all lab_test
        $query = $this->input->post('query');
        $this->db->query($query);
        $this->db->query("SET SQL_SAFE_UPDATES = 1");

        // end transaction
        if ($this->db->trans_status() === FALSE) {
            // حدثت مشكلة خلال الـtransaction
            $result = false;
            $this->db->trans_rollback();
        } else {
            // تمت العمليات بنجاح
            $result = true;
            $this->db->trans_commit();
        }

        $this->db->trans_complete();
        if ($result) {
            echo json_encode(
                array(
                    'status' => true,
                    'message' => 'تمت العملية بنجاح',
                    'data' => $query,
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
        } else {
            echo json_encode(
                array(
                    'status' => false,
                    'message' => 'حدث خطأ أثناء العملية',
                    'data' => $query,
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
        }
    }

    public function installTests()
    {
        $queries = "";
        $lab_hash = $this->input->post('lab_id');
        $tests = $this->db->query("select test_name, test_type, option_test, hash, insert_record_date, isdeleted, short_name, sample_type, category_hash, sort from lab_test where lab_hash='$lab_hash'")->result();

        if (count($tests) > 0) {
            $tests_query = "insert into lab_test(" . implode(",", array_keys((array) $tests[0])) . ") values ";
            $tests_values = array_map(function ($test) use ($lab_hash) {
                $option_test = $test->option_test;
                $option_test = str_replace('"', '\"', $option_test);
                $test->option_test = $option_test;
                $name = $test->test_name;
                $name = str_replace("'", "", $name);
                $test->test_name = $name;
                return "('" . implode("','", array_values((array) $test)) . "')";
            }, $tests);
            $tests_query .= implode(",", $tests_values);
            $queries .= $tests_query;
        } else {
            $tests_query = '';
        }

        echo $queries;
    }

    public function installTestsOrDefaults()
    {
        $queries = "";
        $lab_hash = $this->input->post('lab_id');
        $tests = $this->db->query("select test_name, test_type, option_test, hash, insert_record_date, isdeleted, short_name, sample_type, category_hash, sort from lab_test where lab_hash='$lab_hash'")->result();

        if (count($tests) == 0) {
            $tests = $this->db->query("select test_name, test_type, option_test, hash, insert_record_date, isdeleted, short_name, sample_type, category_hash, sort from lab_test where lab_hash is null")->result();
        }
        $tests_query = "insert into lab_test(" . implode(",", array_keys((array) $tests[0])) . ") values ";
        $tests_values = array_map(function ($test) use ($lab_hash) {
            $option_test = $test->option_test;
            $option_test = str_replace('"', '\"', $option_test);
            $test->option_test = $option_test;
            $name = $test->test_name;
            $name = str_replace("'", "", $name);
            $test->test_name = $name;
            return "('" . implode("','", array_values((array) $test)) . "')";
        }, $tests);
        $tests_query .= implode(",", $tests_values);
        $queries .= $tests_query;
        echo $queries;
    }

    public function run_sync()
    {
        $queries = $this->input->post("queries");
        $queries = explode(";", $queries);
        $result = array();
        foreach ($queries as $query) {
            if ($query != "") {
                $this->db->query($query);
                array_push($result, $query);
            }
        }
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode("re"));
    }
}