<?php
class Offline extends CI_Controller
{

    function __construct()
    {
        parent::__construct();
        $this->load->model('User_model');
        // access control api 
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description, Authorization');
        // json response
        header('Content-Type: application/json');
    }

    public function login()
    {
        $username = $this->input->post('username');
        $password = $this->input->post('password');
        $data = array(
            'username' => $username,
            'password' => $password,
            'user' => $this->User_model->verify_user($username, $password)
        );
        $user = $this->User_model->verify_user($username, $password);
        if (!$user) {
            echo json_encode(
                array(
                    'status' => false,
                    'message' => 'اسم المستخدم او كلمة المرور غير صحيحة',
                    'data' => $data,
                    'isAuth' => false
                ),
                JSON_UNESCAPED_UNICODE
            );
        } else {
            $lab_id = $user->lab_id;
            // $queries = $this->db->query("select query from offline_sync where lab_id='$lab_id'")->result();
            $doctors = $this->db->query("select * from lab_doctor where lab_id='$lab_id'")->result();
            $patients = $this->db->query("select * from lab_patient where lab_id='$lab_id'")->result();
            $package_tests = $this->db->query("select * from lab_pakage_tests where lab_id='$lab_id'")->result();
            $packages = $this->db->query("select * from lab_package where lab_id='$lab_id'")->result();
            $visits = $this->db->query("select * from lab_visits where labId='$lab_id'")->result();
            $visits_packages = $this->db->query("select * from lab_visits_package where lab_id='$lab_id'")->result();
            $visits_tests = $this->db->query("select * from lab_visits_tests where lab_id='$lab_id'")->result();
            $workers = $this->db->query("select * from lab_invoice_worker where lab_hash='$lab_id'")->result();
            $invoice = $this->db->query("select * from lab_invoice where lab_hash='$lab_id'")->result();
            // map doctor to be like that {query: "insert into lab_doctor() values()"}
            // check length of doctors array
            if (count($doctors) > 0) {
                $doctors_query = "insert into lab_doctor(" . implode(",", array_keys((array) $doctors[0])) . ") values ";
                $doctors_values = array_map(function ($doctor) {
                    return "('" . implode("','", array_values((array) $doctor)) . "')";
                }, $doctors);
                $doctors_query .= implode(",", $doctors_values);
            } else {
                $doctors_query = '';
            }
            // check length of patients array
            if (count($patients) > 0) {
                $patients_query = "insert into lab_patient(" . implode(",", array_keys((array) $patients[0])) . ") values ";
                $patients_values = array_map(function ($patient) {
                    return "('" . implode("','", array_values((array) $patient)) . "')";
                }, $patients);
                $patients_query .= implode(",", $patients_values);
            } else {
                $patients_query = '';
            }
            // check length of package_tests array
            if (count($package_tests) > 0) {
                $package_tests_query = "insert into lab_pakage_tests(" . implode(",", array_keys((array) $package_tests[0])) . ") values ";
                $package_tests_values = array_map(function ($package_test) {
                    return "('" . implode("','", array_values((array) $package_test)) . "')";
                }, $package_tests);
                $package_tests_query .= implode(",", $package_tests_values);
            } else {
                $package_tests_query = '';
            }
            // check length of packages array
            if (count($packages) > 0) {
                $packages_query = "insert into lab_package(" . implode(",", array_keys((array) $packages[0])) . ") values ";
                $packages_values = array_map(function ($package) {
                    return "('" . implode("','", array_values((array) $package)) . "')";
                }, $packages);
                $packages_query .= implode(",", $packages_values);
            } else {
                $packages_query = '';
            }
            // check length of visits array
            if (count($visits) > 0) {
                $visits_query = "insert into lab_visits(" . implode(",", array_keys((array) $visits[0])) . ") values ";
                $visits_values = array_map(function ($visit) {
                    return "('" . implode("','", array_values((array) $visit)) . "')";
                }, $visits);
                $visits_query .= implode(",", $visits_values);
            } else {
                $visits_query = '';
            }
            // check length of visits_packages array
            if (count($visits_packages) > 0) {
                $visits_packages_query = "insert into lab_visits_package(" . implode(",", array_keys((array) $visits_packages[0])) . ") values ";
                $visits_packages_values = array_map(function ($visits_package) {
                    return "('" . implode("','", array_values((array) $visits_package)) . "')";
                }, $visits_packages);
                $visits_packages_query .= implode(",", $visits_packages_values);
            } else {
                $visits_packages_query = '';
            }
            // check length of visits_tests array
            if (count($visits_tests) > 0) {
                $visits_tests_query = "insert into lab_visits_tests(" . implode(",", array_keys((array) $visits_tests[0])) . ") values ";
                $visits_tests_values = array_map(function ($visits_test) {
                    if ($visits_test->result_test == '' || $visits_test->result_test == null || $visits_test->result_test == 'null') {
                        $visits_test->result_test = '{}';
                    }
                    return "('" . implode("','", array_values((array) $visits_test)) . "')";
                }, $visits_tests);
                $visits_tests_query .= implode(",", $visits_tests_values);
            } else {
                $visits_tests_query = '';
            }
            // check length of workers array
            if (count($workers) > 0) {
                $workers_query = "insert into lab_invoice_worker(" . implode(",", array_keys((array) $workers[0])) . ") values ";
                $workers_values = array_map(function ($worker) {
                    return "('" . implode("','", array_values((array) $worker)) . "')";
                }, $workers);
                $workers_query .= implode(",", $workers_values);
            } else {
                $workers_query = '';
            }
            // check length of invoice array
            if (count($invoice) > 0) {
                $invoice_query = "insert into lab_invoice(" . implode(",", array_keys((array) $invoice[0])) . ") values ";
                $invoice_values = array_map(function ($invoice) {
                    return "('" . implode("','", array_values((array) $invoice)) . "')";
                }, $invoice);
                $invoice_query .= implode(",", $invoice_values);
            } else {
                $invoice_query = '';
            }
            $queries = array(
                $doctors_query,
                $patients_query,
                $package_tests_query,
                $packages_query,
                $visits_query,
                $visits_packages_query,
                $visits_tests_query,
                $workers_query,
                $invoice_query

            );
            echo json_encode(
                array(
                    'status' => true,
                    'message' => 'تم تسجيل الدخول بنجاح',
                    'data' => $user,
                    "queries" => $queries,
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
}