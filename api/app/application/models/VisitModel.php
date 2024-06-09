<?php
class VisitModel extends CI_Model
{
    private $table = 'lab_visits';
    private $main_column = 'hash';

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->helper('db');
        $this->load->helper('visit');
        $this->load->helper('test');
        $this->load->helper('json');
        $this->load->model('TubeModel');
    }

    public function visit_count($params)
    {
        try {
            $this->db->trans_start();

            $searchText = $params['search']['value'] ?? '';
            $today = $params['today'] ?? 0;
            $operation = $today == 1 ? "=" : "<";
            $this->db->from($this->table)
                ->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id')
                ->like(array('lab_patient.name' => $searchText))
                ->where(array('lab_visits.isdeleted' => '0', 'visit_date ' . $operation => date('Y-m-d')));

            $query = $this->db->count_all_results();

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query !== false ? $query : 0;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Error in visit_count: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function get_visits($params)
    {
        try {
            $this->db->trans_start();

            $start = $params['start'] ?? 0;
            $rowsPerPage = $params['length'] ?? 10;
            $page = $start / $rowsPerPage;
            $orderBy = $params['order'][0]['column'] ?? 0;
            $orderBy = $params['columns'][$orderBy]['data'] ?? 'visit_date';
            $searchText = $params['search']['value'] ?? '';
            $today = $params['today'] ?? 0;
            $operation = $today == 1 ? "=" : "<=";
            $this->db
                ->select('lab_visits.hash as hash ,visits_patient_id as patient_hash,ispayed,visits_status_id as status')
                ->select("lab_patient.name as name,visit_date")
                ->select("(select name from lab_visit_status where hash=visits_status_id) as visit_type")
                ->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id')
                ->like(array('lab_patient.name' => $searchText))
                ->where(array('lab_visits.isdeleted' => '0', 'visit_date ' . $operation => date('Y-m-d')))
                ->order_by("lab_visits.id", "DESC");

            $query = $this->db->get($this->table, $rowsPerPage, $page * $rowsPerPage);

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query !== FALSE ? $query->result_array() : [];
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Error in get_visits: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function get_visits_report($params)
    {
        try {
            $this->db->trans_start();

            $start = $params['start'] ?? 0;
            $rowsPerPage = $params['length'] ?? 10;
            $page = $start / $rowsPerPage;
            $orderBy = $params['order'][0]['column'] ?? 0;
            $orderBy = $params['columns'][$orderBy]['data'] ?? 'visit_date';
            $order = $params['order'][0]['dir'] ?? 'DESC';
            $searchText = $params['search']['value'] ?? '';
            $startDate = $params['startDate'] ?? date('Y-m-d', strtotime('-1 month'));
            $endDate = $params['endDate'] ?? date('Y-m-d');
            $this->db
                ->select('lab_visits.hash as hash ,visits_patient_id as patient_hash,ispayed')
                ->select("lab_patient.name as name,visit_date")
                ->select("(select name from lab_visit_status where hash=visits_status_id) as visit_type")
                ->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id')
                ->like(array('lab_patient.name' => $searchText))
                ->where(array('lab_visits.isdeleted' => '0', 'visit_date >=' => $startDate, 'visit_date <=' => $endDate))
                ->order_by($orderBy, $order);

            $query = $this->db->get($this->table, $rowsPerPage, $page * $rowsPerPage);

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query !== FALSE ? $query->result_array() : [];
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Error in get_visits_report: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function visit_count_report($params)
    {
        try {
            $this->db->trans_start();

            $searchText = $params['search']['value'] ?? '';
            $startDate = $params['startDate'] ?? date('Y-m-d', strtotime('-1 month'));
            $endDate = $params['endDate'] ?? date('Y-m-d');
            $this->db
                ->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id')
                ->where(array('lab_patient.isdeleted' => 0, 'visit_date >=' => $startDate, 'visit_date <=' => $endDate))
                ->like("lab_patient.name", $searchText);

            $query = $this->db->count_all_results($this->table);

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query !== false ? $query : 0;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Error in visit_count_report: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function create_visit($data)
    {
        if (!isset($data['visit_data']) || !isset($data['patient_data']) || !isset($data['tests'])) {
            return "Invalid data provided";
        }

        $visit_data = $data['visit_data'];
        $visit_hash = $visit_data['hash'] ?? create_hash();
        $tests = $data['tests'];

        try {
            $this->db->trans_start();

            $patient_data = $data['patient_data'];
            $this->update_or_create_patient($patient_data);
            $this->update_or_create_visit($visit_data);
            $this->create_visit_package_and_tests($visit_hash, $tests);

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $this->get_visit($visit_hash);
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in create_visit: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function update_visit($data)
    {
        if (!isset($data['visit_data']) || !isset($data['patient_data']) || !isset($data['tests'])) {
            return "Invalid data provided";
        }

        try {
            $this->db->trans_start();

            $visit_data = $data['visit_data'];
            $patient_data = $data['patient_data'];
            $tests = $data['tests'];
            $this->update_or_create_patient($patient_data);
            $this->update_or_create_visit($visit_data);
            $visit_hash = $visit_data['hash'];
            $this->delete_old_visit_package_and_tests($visit_hash, $tests);
            $this->create_visit_package_and_tests($visit_hash, $tests);

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $this->get_visit($visit_hash);
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in update_visit: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function delete_visit($hash)
    {
        if (empty($hash)) {
            return "Invalid hash provided";
        }

        try {
            $this->db->trans_start();

            $this->db->where('hash', $hash);
            $query = $this->db->update('lab_visits', array('isdeleted' => '1'));

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query ? true : false;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in delete_visit: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function update_invoice($data, $lab_hash)
    {
        if (empty($lab_hash)) {
            return "Invalid lab_hash provided";
        }

        try {
            $this->db->trans_start();

            $this->db->where('lab_hash', $lab_hash);
            $query = $this->db->update('lab_invoice', $data);

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query ? true : false;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in update_invoice: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function get_visit($hash)
    {
        if (empty($hash)) {
            return "Invalid hash provided";
        }

        try {
            $this->db->trans_start();

            $this->load->helper('json');
            $font = $this->db->select('font_size')->from('lab_invoice')->get()->row();
            $font = $font->font_size;

            $this->db->select("lab_visits.id as id,age,gender,doctor_hash,phone,lab_patient.name,DATE(visit_date) as date,age_year,age_month,age_day,address,note")
                ->select("TIME(visit_date) as time,visits_patient_id as patient,lab_visits.hash")
                ->select("(select name from lab_doctor where hash=lab_visits.doctor_hash) as doctor")
                ->select("lab_patient.hash as patient_hash, gender,age,dicount,total_price,net_price")
                ->from("lab_visits")
                ->join("lab_patient", "lab_patient.hash=lab_visits.visits_patient_id")
                ->where("lab_visits.hash", $hash);

            $visit = $this->db->get()->row_array();

            if ($visit === NULL) {
                throw new Exception('Visit not found');
            }

            $this->db->select("option_test, lab_test.test_name as name, kit_id")
                ->select(" (select name from devices where devices.id=lab_device_id limit 1) as device_name")
                ->select("(select name from kits where kits.id =kit_id limit 1) as kit_name")
                ->select("(select name from lab_test_units where hash=lab_pakage_tests.unit limit 1) as unit_name")
                ->select("ifnull(lab_test_catigory.name,'Tests') as category")
                ->select("unit, result_test as result,lab_visits_tests.hash as hash, test_id")
                ->from("lab_visits_tests")
                ->join("lab_pakage_tests", "lab_pakage_tests.test_id = lab_visits_tests.tests_id and lab_pakage_tests.package_id = lab_visits_tests.package_id", "left")
                ->join("lab_test", "lab_test.hash = lab_visits_tests.tests_id")
                ->join("lab_test_catigory", "lab_test_catigory.hash = lab_test.category_hash", "left")
                ->where("visit_id", $hash)
                ->group_by("test_id,kit_id,unit,lab_pakage_tests.package_id")
                ->order_by("sort");

            $tests = $this->db->get()->result_array();

            $packages = $this->get_visit_packages($hash);
            $visit['packages'] = $packages;

            if (isset($visit) && isset($tests)) {
                $tests = array_map(function ($test) use ($visit, $font) {
                    $json = new Json($test['option_test']);
                    $filterFeilds = array(
                        "kit" => $test['kit_id'] ?? "",
                        "unit" => $test['unit'] ?? "",
                        "gender" => $visit['gender'],
                        "age" => $visit['age'],
                    );
                    $test['option_test'] = $json->filter($filterFeilds)->setHeight($font)->row();
                    $test['result'] = json_decode($test['result'], true);
                    if ($test['result'] == null) {
                        $test['result'] = array(
                            "checked" => true,
                            $test['name'] => ""
                        );
                    }

                    return $test;
                }, $tests);
            }

            usort($tests, function ($a, $b) {
                return $a['category'] <=> $b['category'];
            });

            $tests_hashes = array_map(function ($test) {
                return $test['test_id'];
            }, $tests);
            $tubes = $this->TubeModel->get_tube_by_tests($tests_hashes);
            $visit["tests"] = $tests;
            $visit["tubes"] = $tubes;

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $visit;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in get_visit: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function is_exist($id)
    {
        if (empty($id)) {
            return false;
        }

        try {
            $this->db->trans_start();

            $this->db->select('id')->where('id', $id);
            $query = $this->db->get('lab_visits')->row_array();

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query ? true : false;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in is_exist: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function get_id_by_hash($hash)
    {
        if (empty($hash)) {
            return null;
        }

        try {
            $this->db->trans_start();

            $this->db->select('id')->where('hash', $hash);
            $query = $this->db->get('lab_visits')->row_array();

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query !== FALSE ? $query['id'] ?? null : null;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in get_id_by_hash: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function get_hash_by_id($id)
    {
        if (empty($id)) {
            return null;
        }

        try {
            $this->db->trans_start();

            $this->db->select('hash')->where('id', $id);
            $query = $this->db->get('lab_visits')->row_array();

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query !== FALSE ? $query['hash'] ?? null : null;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in get_hash_by_id: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function get_visit_form_data()
    {
        try {
            $this->db->trans_start();

            $this->db->select('hash,name')->where("isdeleted", "0");
            $patients_query = $this->db->get('lab_patient');
            $patients = $patients_query->result_array();

            if ($patients === FALSE) {
                throw new Exception('Error fetching patients');
            }

            $this->db->select('hash,name')->where("isdeleted", "0");
            $doctors_query = $this->db->get('lab_doctor');
            $doctors = $doctors_query->result_array();

            if ($doctors === FALSE) {
                throw new Exception('Error fetching doctors');
            }

            $this->db->select('hash,name');
            $units_query = $this->db->get('lab_test_units');
            $units = $units_query->result_array();

            if ($units === FALSE) {
                throw new Exception('Error fetching units');
            }

            $data = $this->get_tests_and_packages();
            $categories = $this->get_categories();

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return array(
                "patients" => $patients,
                "doctors" => $doctors,
                "tests" => $data['tests'],
                "packages" => $data['packages'],
                "categories" => $categories,
                "units" => $units
            );
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in get_visit_form_data: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function get_tests_and_packages()
    {
        try {
            $this->db->trans_start();

            $packages_query = $this->db->select('hash,name,price,"package" as type,"false" as checked')
                ->where(array('isdeleted' => '0', 'catigory_id' => '8'))
                ->get('lab_package');

            if ($packages_query === FALSE) {
                throw new Exception('Error fetching packages');
            }
            $packages = $packages_query->result_array();

            $tests_query = $this->db
                ->select('lab_package.hash,lab_package.name,price')
                ->select('kits.name as kit')
                ->select('devices.name as device')
                ->select('lab_test_units.name as unit')
                ->select('lab_test.category_hash as catigory')
                ->where(array('lab_package.isdeleted' => '0', 'lab_package.catigory_id' => '9'))
                ->join('lab_pakage_tests', 'lab_pakage_tests.package_id=lab_package.hash', "left")
                ->join('kits', 'lab_pakage_tests.kit_id=kits.id', "left")
                ->join("devices", "lab_pakage_tests.lab_device_id=devices.id", "left")
                ->join("lab_test_units", "lab_pakage_tests.unit=lab_test_units.hash", "left")
                ->join("lab_test", "lab_test.hash=lab_pakage_tests.test_id", "left")
                ->group_by('test_id,kit_id,unit,lab_pakage_tests.package_id')
                ->get('lab_package');

            if ($tests_query === FALSE) {
                throw new Exception('Error fetching tests');
            }
            $tests = $tests_query->result_array();

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return array("packages" => $packages, "tests" => $tests);
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in get_tests_and_packages: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function get_categories()
    {
        try {
            $this->db->trans_start();

            $query = $this->db->select('hash,name')->get('lab_test_catigory');

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query !== FALSE ? $query->result_array() : [];
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in get_categories: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function update_or_create_visit($data)
    {
        try {
            $this->db->trans_start();

            $hash = $data['hash'];
            $visit_query = $this->db->get_where('lab_visits', array('hash' => $hash));

            if ($visit_query === FALSE) {
                throw new Exception('Error fetching visit');
            }
            $visit = $visit_query->row_array();

            if (isset($visit)) {
                $update_query = $this->db->where('hash', $hash)->update('lab_visits', $data);
            } else {
                $update_query = $this->db->insert('lab_visits', $data);
            }

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $update_query ? true : false;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in update_or_create_visit: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function update_or_create_patient($data)
    {
        try {
            $this->db->trans_start();

            $hash = $data['hash'];
            $patient_query = $this->db->get_where('lab_patient', array('hash' => $hash));

            if ($patient_query === FALSE) {
                throw new Exception('Error fetching patient');
            }
            $patient = $patient_query->row_array();

            if (isset($patient)) {
                $update_query = $this->db->where('hash', $hash)->update('lab_patient', $data);
            } else {
                $update_query = $this->db->insert('lab_patient', $data);
            }

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $update_query ? true : false;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in update_or_create_patient: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function create_visit_package_and_tests($visit_hash = "", $tests)
    {
        try {
            $this->db->trans_start();

            $this->create_calc_tests($tests, $visit_hash);

            $old_packages_query = $this->db->select("package_id")->where('visit_id', $visit_hash)->get('lab_visits_package');
            if ($old_packages_query === FALSE) {
                throw new Exception('Error fetching old packages');
            }
            $old_packages = $old_packages_query->result_array();
            $old_packages = array_column($old_packages, 'package_id');

            if (isset($old_packages[0])) {
                $tests = array_diff($tests, $old_packages);
            }
            $tests = array_values($tests);
            if (!isset($tests[0])) {
                return [];
            }

            $packages_query = $this->db->select("price,hash")->where_in('hash', $tests)->get('lab_package');
            if ($packages_query === FALSE) {
                throw new Exception('Error fetching packages');
            }
            $packages = $packages_query->result_array();

            $tests_query = $this->db->select("test_id,package_id, test_name as name")->where_in('package_id', $tests)
                ->join('lab_test', 'lab_test.hash=lab_pakage_tests.test_id')
                ->get('lab_pakage_tests');
            if ($tests_query === FALSE) {
                throw new Exception('Error fetching tests');
            }
            $tests = $tests_query->result_array();

            $packages = array_map(function ($package) use ($visit_hash) {
                return array(
                    "visit_id" => $visit_hash,
                    "package_id" => $package['hash'],
                    "price" => $package['price'],
                    "hash" => create_hash()
                );
            }, $packages);

            $tests = array_map(function ($test) use ($visit_hash) {
                return array(
                    "visit_id" => $visit_hash,
                    "tests_id" => $test['test_id'],
                    "package_id" => $test['package_id'],
                    "hash" => create_hash(),
                    "result_test" => json_encode(array("checked" => true, $test['name'] => ""))
                );
            }, $tests);

            $insert_packages_query = $this->db->insert_batch('lab_visits_package', $packages);
            $insert_tests_query = $this->db->insert_batch('lab_visits_tests', $tests);

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return ($insert_packages_query && $insert_tests_query) ? $tests : false;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in create_visit_package_and_tests: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function create_calc_tests($tests = [], $visit_hash)
    {
        try {
            $this->db->trans_start();

            $package_tests_query = $this->db->select("test_id")->where_in('package_id', $tests)->get('lab_pakage_tests');
            if ($package_tests_query === FALSE) {
                throw new Exception('Error fetching package tests');
            }
            $package_tests = $package_tests_query->result_array();

            $calc_tests_query = $this->db->select('hash,option_test, test_name as name')->where('test_type', '3')->get('lab_test');
            if ($calc_tests_query === FALSE) {
                throw new Exception('Error fetching calc tests');
            }
            $calc_tests = $calc_tests_query->result_array();

            $calc_tests = array_map(function ($test) {
                $option = str_replace('\\', '', $test['option_test']);
                $option = json_decode($option, true);
                $tests = isset($option['tests']) ? $option['tests'] : [];
                $test['tests'] = $tests;
                unset($test['option_test']);
                return $test;
            }, $calc_tests);

            $package_tests = array_map(function ($test) {
                return $test['test_id'];
            }, $package_tests);

            $calc_tests = array_filter($calc_tests, function ($test) use ($package_tests) {
                $tests = $test['tests'];
                if (count($tests) == 0) {
                    return false;
                }
                $result = array_diff($tests, $package_tests);
                return count($result) == 0;
            });

            $calc_tests = array_map(function ($test) use ($visit_hash) {
                return array(
                    "tests_id" => $test['hash'],
                    "package_id" => "",
                    "visit_id" => $visit_hash,
                    "hash" => create_hash(),
                    "result_test" => json_encode(array("checked" => true, $test['name'] => ""))
                );
            }, $calc_tests);

            if (count($calc_tests) > 0) {
                $insert_query = $this->db->insert_batch('lab_visits_tests', $calc_tests);
                $this->db->trans_complete();

                if ($this->db->trans_status() === FALSE) {
                    throw new Exception('Transaction failed');
                }

                return $insert_query ? true : false;
            }

            $this->db->trans_complete();

            return true;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in create_calc_tests: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function delete_old_visit_package_and_tests($visit_hash = "", $tests)
    {
        try {
            $this->db->trans_start();

            $delete_packages_query = $this->db->where('visit_id', $visit_hash)->where_not_in('package_id', $tests)->delete('lab_visits_package');
            $delete_tests_query = $this->db->where('visit_id', $visit_hash)->where_not_in('package_id', $tests)->delete('lab_visits_tests');

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return ($delete_packages_query && $delete_tests_query) ? true : false;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in delete_old_visit_package_and_tests: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function get_visit_tests($hash)
    {
        try {
            $this->db->trans_start();

            $query = $this->db->query("
            SELECT
                kit_id as kit, unit,
                lab_test_units.name as unit_name,
                option_test as options,
                lab_test_catigory.name as category,
                result_test as result,
                (select devices.name from devices where devices.id=lab_pakage_tests.lab_device_id) as device,
                lab_visits_tests.hash as hash,
                lab_test.test_name as name
            FROM
                lab_visits_tests
                left join lab_pakage_tests on lab_pakage_tests.package_id=lab_visits_tests.package_id
                left join lab_test on lab_visits_tests.tests_id = lab_test.hash
                left join lab_test_catigory on lab_test_catigory.hash = lab_test.category_hash
                left join lab_test_units on lab_test_units.hash = lab_pakage_tests.unit
            WHERE
                visit_id='$hash'
            order by sort
        ");

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query !== FALSE ? $query->result_array() : [];
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in get_visit_tests: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function getPatientDetail($visit_id)
    {
        try {
            $this->db->trans_start();

            $query = $this->db->query("
            select lab_patient.id,gender,age,lab_patient.name,lab_visits.hash as visit_hash,visit_date as date from lab_visits
            inner join lab_patient on lab_patient.hash=lab_visits.visits_patient_id
            where lab_visits.hash='$visit_id'
        ");

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            $result = $query->result_array();
            return isset($result[0]) ? $result[0] : $visit_id;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in getPatientDetail: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function getScreenDetail()
    {
        try {
            $this->db->trans_start();

            $query = $this->db
                ->select('lab_visits.name as name, lab_visit_status.name as status,visits_status_id as status_id')
                ->from('lab_visits')
                ->where('visit_date', date('Y-m-d'))
                ->join('lab_visit_status', 'lab_visit_status.hash = lab_visits.visits_status_id', "left")
                ->order_by('lab_visits.id', 'DESC')
                ->get();

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query !== FALSE ? $query->result_array() : [];
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in getScreenDetail: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function saveTestResult($data)
    {
        try {
            $this->db->trans_start();

            $query = $this->db->update('lab_visits_tests', $data, array('hash' => $data['hash']));

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query ? true : false;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in saveTestResult: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function get_visit_status()
    {
        try {
            $this->db->trans_start();

            $query = $this->db->select('name,id')->from('lab_visit_status')->get();

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query !== FALSE ? $query->result_array() : [];
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in get_visit_status: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function update_visit_status($hash, $status)
    {
        try {
            $this->db->trans_start();

            $query = $this->db->update('lab_visits', array('visits_status_id' => $status), array('hash' => $hash));

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query ? true : false;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in update_visit_status: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function saveTestsResult($data, $visit_hash)
    {
        try {
            $this->db->trans_start();

            $this->update_visit_status($visit_hash, 3);
            $query = $this->db->update_batch('lab_visits_tests', $data, 'hash');

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query ? true : false;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in saveTestsResult: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function get_visit_packages($hash)
    {
        try {
            $this->db->trans_start();

            $query = $this->db
                ->select('lab_pakage_tests.package_id as hash,lab_package.name as name,lab_visits_package.price')
                ->select('GROUP_CONCAT(lab_test.test_name) as tests')
                ->from('lab_visits_package')
                ->where('visit_id', $hash)
                ->join('lab_pakage_tests', 'lab_visits_package.package_id=lab_pakage_tests.package_id')
                ->join('lab_test', 'lab_test.hash=lab_pakage_tests.test_id')
                ->join('lab_package', 'lab_package.hash=lab_visits_package.package_id')
                ->group_by('lab_visits_package.hash')
                ->get();

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return $query !== FALSE ? $query->result_array() : [];
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in get_visit_packages: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function get_visits_mobile($page, $search, $status_val)
    {
        try {
            $this->db->trans_start();

            if ($status_val == "1") {
                $status = "=3";
            } elseif ($status_val == "0") {
                $status = "!=3";
            } else {
                $status = "is not null";
            }

            $query = $this->db
                ->select("age,gender,doctor_hash,phone,lab_patient.name,DATE(visit_date) as date,age_year,age_month,age_day,address,note")
                ->select("TIME(visit_date) as time,visits_patient_id as patient,lab_visits.hash")
                ->select("(select name from lab_doctor where hash=lab_visits.doctor_hash) as doctor")
                ->select("lab_patient.hash as patient_hash, gender,age,dicount,total_price,net_price")
                ->select("(select name from lab_visit_status where hash=lab_visits.visits_status_id) as status")
                ->join("lab_patient", "lab_patient.hash=lab_visits.visits_patient_id")
                ->like("lab_patient.name", $search)
                ->where('lab_visits.isdeleted', '0')
                ->where('visits_status_id ' . $status)
                ->order_by("visit_date", "DESC")
                ->get($this->table, 10, $page * 10);

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            $visits = $query->result_array();
            $visits = array_map(function ($visit) {
                $packages = $this->get_visit_packages($visit['hash']);
                $visit['packages'] = $packages;
                return $visit;
            }, $visits);

            return $visits;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in get_visits_mobile: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }

    public function insert_batch($data)
    {
        if (empty($data)) {
            return;
        }

        try {
            $this->db->trans_start();

            $data_chunks = array_chunk($data, 1000);
            foreach ($data_chunks as $chunk) {
                $query = $this->db->insert_batch($this->table, $chunk);

                if ($query === FALSE) {
                    throw new Exception('Error inserting batch');
                }
            }

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Transaction failed');
            }

            return true;
        } catch (Exception $e) {
            $this->db->trans_rollback();
            $db_error = $this->db->error();
            $msg = $db_error['message'];
            $num = $db_error['code'];
            log_message('error', 'Exception in insert_batch: ' . $msg . ' (Error number: ' . $num . ')');
            return false;
        }
    }
}
