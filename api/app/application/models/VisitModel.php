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
        $searchText = $params['search']['value'];
        $today = $params['today'];
        $opration = $today == 1 ? "=" : "<";
        $data = $this->db->from($this->table)
            ->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id')
            ->like(array('lab_patient.name' => $searchText))
            ->where(array('lab_visits.isdeleted' => '0', 'visit_date ' . $opration => date('Y-m-d')))
            ->count_all_results();
        return $data;
    }

    public function get_visits($params)
    {
        // get data table params
        $start = $params['start'];
        $rowsPerPage = $params['length'];
        $page = $start / $rowsPerPage;
        $orderBy = $params['order'][0]['column'];
        $orderBy = $params['columns'][$orderBy]['data'];
        $searchText = $params['search']['value'];
        $today = $params['today'];
        $opration = $today == 1 ? "=" : "<=";
        $data = $this->db
            ->select('lab_visits.hash as hash ,visits_patient_id as patient_hash,ispayed,visits_status_id as status')
            ->select("lab_patient.name as name,visit_date")
            ->select("(select name from lab_visit_status where hash=visits_status_id) as visit_type")
            ->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id')
            ->like(array('lab_patient.name' => $searchText))
            ->where(array('lab_visits.isdeleted' => '0', 'visit_date ' . $opration => date('Y-m-d')))
            ->order_by("lab_visits.id", "DESC")
            ->get($this->table, $rowsPerPage, $page * $rowsPerPage)
            ->result_array();
        return $data;
    }

    public function get_visits_report($params)
    {
        // get data table params
        $start = $params['start'];
        $rowsPerPage = $params['length'];
        $page = $start / $rowsPerPage;
        $orderBy = $params['order'][0]['column'];
        $orderBy = $params['columns'][$orderBy]['data'];
        $order = $params['order'][0]['dir'];
        $searchText = $params['search']['value'];
        $startDate = $params['startDate'] ?? date('Y-m-d', strtotime('-1 month'));
        $endDate = $params['endDate'] ?? date('Y-m-d');
        $data = $this->db
            ->select('lab_visits.hash as hash ,visits_patient_id as patient_hash,ispayed')
            ->select("lab_patient.name as name,visit_date")
            ->select("(select name from lab_visit_status where hash=visits_status_id) as visit_type")
            ->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id')
            ->like(array('lab_patient.name' => $searchText))
            ->where(array('lab_visits.isdeleted' => '0', 'visit_date >=' => $startDate, 'visit_date <=' => $endDate))
            ->order_by($orderBy, $order)
            ->get($this->table, $rowsPerPage, $page * $rowsPerPage)
            ->result_array();
        return $data;
    }

    public function visit_count_report($params)
    {
        $searchText = $params['search']['value'];
        $startDate = $params['startDate'] ?? date('Y-m-d', strtotime('-1 month'));
        $endDate = $params['endDate'] ?? date('Y-m-d');
        return $this->db
            ->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id')
            ->where(array('lab_patient.isdeleted' => 0, 'visit_date >=' => $startDate, 'visit_date <=' => $endDate))
            ->like("lab_patient.name", $searchText)
            ->count_all_results($this->table);
    }

    public function create_visit($data)
    {
        $visit_data = $data['visit_data'];
        $visit_hash = $visit_data['hash'];
        $tests = $data['tests'];
        $this->db->trans_start();
        $patient_data = $data['patient_data'];
        $tests = $data['tests'];
        $this->update_or_create_patient($patient_data);
        $this->update_or_create_visit($visit_data);
        $visit_hash = $visit_data['hash'];
        $this->create_visit_package_and_tests($visit_hash, $tests);
        $this->db->trans_complete();
        return $this->get_visit($visit_hash);
    }

    public function update_visit($data)
    {
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
        return $this->get_visit($visit_hash);
    }

    public function delete_visit($hash)
    {
        $this->db->where('hash', $hash);
        $this->db->update('lab_visits', array('isdeleted' => '1'));
    }

    public function update_invoice($data, $lab_hash)
    {
        $this->db->where('lab_hash', $lab_hash);
        $this->db->update('lab_invoice', $data);
    }

    public function get_visit($hash)
    {
        $this->load->helper('json');
        $font = $this->db->select('font_size')->from('lab_invoice')->get()->row();
        $font = $font["font_size"];

        $visit = $this->db
            ->select("lab_visits.id as id,age,gender,doctor_hash,phone,lab_patient.name,DATE(visit_date) as date,age_year,age_month,age_day,address,note")
            ->select("TIME(visit_date) as time,visits_patient_id as patient,lab_visits.hash")
            ->select("(select name from lab_doctor where hash=lab_visits.doctor_hash) as doctor")
            ->select("lab_patient.hash as patient_hash, gender,age,dicount,total_price,net_price")
            ->from("lab_visits")
            ->join("lab_patient", "lab_patient.hash=lab_visits.visits_patient_id")
            ->where("lab_visits.hash", $hash)
            ->get()->row_array();

        $tests = $this->db
            ->select("option_test, lab_test.test_name as name, kit_id")
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
            ->order_by("sort")
            ->get()->result_array();
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
        // sort array by category 
        usort($tests, function ($a, $b) {
            return $a['category'] <=> $b['category'];
        });
        $tests_hashes = array_map(function ($test) {
            return $test['test_id'];
        }, $tests);
        $tubes = $this->TubeModel->get_tube_by_tests($tests_hashes);
        $visit["tests"] = $tests;
        $visit["tubes"] = $tubes;

        return $visit;
    }

    public function get_visit_form_data()
    {
        $patients = $this->db->select('hash,name')
            ->where("isdeleted", "0")
            ->get('lab_patient')->result_array();
        $doctors = $this->db->select('hash,name')->where("isdeleted", "0")->get('lab_doctor')->result_array();
        $units = $this->db->select('hash,name')->get('lab_test_units')->result_array();
        $data = $this->get_tests_and_packages();
        $categories = $this->get_categories();
        return array(
            "patients" => $patients,
            "doctors" => $doctors,
            "tests" => $data['tests'],
            "packages" => $data['packages'],
            "categories" => $categories,
            "units" => $units
        );
    }

    public function get_tests_and_packages()
    {
        // get all packages
        $packages = $this->db->select('hash,name,price,"package" as type,"false" as checked')
            ->where(
                array(
                    'isdeleted' => '0',
                    'catigory_id' => '8'
                )
            )
            ->get('lab_package')->result_array();
        // get all tests
        $tests = $this->db
            ->select('lab_package.hash,lab_package.name,price')
            ->select('kits.name as kit')
            ->select('devices.name as device')
            ->select('lab_test_units.name as unit')
            ->select('lab_test.category_hash as catigory')
            ->where(
                array(
                    'lab_package.isdeleted' => '0',
                    'lab_package.catigory_id' => '9'
                )
            )
            ->join('lab_pakage_tests', 'lab_pakage_tests.package_id=lab_package.hash', "left")
            ->join('kits', 'lab_pakage_tests.kit_id=kits.id', "left")
            ->join("devices", "lab_pakage_tests.lab_device_id=devices.id", "left")
            ->join("lab_test_units", "lab_pakage_tests.unit=lab_test_units.hash", "left")
            ->join("lab_test", "lab_test.hash=lab_pakage_tests.test_id", "left")
            ->group_by('test_id,kit_id,unit,lab_pakage_tests.package_id')
            ->get('lab_package')->result_array();
        // return all data
        return array(
            "packages" => $packages,
            "tests" => $tests
        );
    }

    public function get_categories()
    {
        return $this->db->select('hash,name')->get('lab_test_catigory')->result_array();
    }



    public function update_or_create_visit($data)
    {
        $hash = $data['hash'];
        $visit = $this->db->get_where('lab_visits', array('hash' => $hash))->row_array();
        if (isset($visit)) {
            $this->db->where('hash', $hash);
            $this->db->update('lab_visits', $data);
        } else {
            $this->db->insert('lab_visits', $data);
        }
    }

    public function update_or_create_patient($data)
    {
        $hash = $data['hash'];
        $patient = $this->db->get_where('lab_patient', array('hash' => $hash))->row_array();
        if (isset($patient)) {
            $this->db->where('hash', $hash);
            $this->db->update('lab_patient', $data);
        } else {
            $this->db->insert('lab_patient', $data);
        }
    }

    public function create_visit_package_and_tests($visit_hash = "", $tests)
    {
        $this->create_calc_tests($tests, $visit_hash);
        $old_packages = $this->db->select("package_id")->where('visit_id', $visit_hash)->get('lab_visits_package')->result_array();
        $old_packages = array_column($old_packages, 'package_id');
        if (isset($old_packages[0])) {
            $tests = array_diff($tests, $old_packages);
        }
        $tests = array_values($tests);
        if (!isset($tests[0])) {
            return [];
        }

        $packages = $this->db->select("price,hash")->where_in('hash', $tests)->get('lab_package')->result_array();
        $tests = $this->db->select("test_id,package_id, test_name as name")->where_in('package_id', $tests)
            ->join('lab_test', 'lab_test.hash=lab_pakage_tests.test_id')
            ->get('lab_pakage_tests')->result_array();

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
                "result_test" => json_encode(
                    array(
                        "checked" => true,
                        $test['name'] => ""
                    )
                )
            );
        }, $tests);
        $this->db->insert_batch('lab_visits_package', $packages);
        $this->db->insert_batch('lab_visits_tests', $tests);

        return $tests;
    }

    public function create_calc_tests($tests = [], $visit_hash)
    {
        $package_tests = $this->db->select("test_id")->where_in('package_id', $tests)
            ->get('lab_pakage_tests')->result_array();
        $calc_tests = $this->db
            ->select('hash,option_test, test_name as name')
            ->where('test_type', '3')
            ->get('lab_test')
            ->result_array();

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
            // check if all tests in package
            $result = array_diff($tests, $package_tests);
            if (count($result) == 0) {
                return true;
            } else {
                return false;
            }
        });


        $calc_tests = array_map(function ($test) use ($visit_hash) {
            return array(
                "tests_id" => $test['hash'],
                "package_id" => "",
                "visit_id" => $visit_hash,
                "hash" => create_hash(),
                "result_test" => json_encode(
                    array(
                        "checked" => true,
                        $test['name'] => ""
                    )
                )
            );
        }, $calc_tests);
        if (count($calc_tests) > 0) {
            $this->db->insert_batch('lab_visits_tests', $calc_tests);
        }
    }

    public function delete_old_visit_package_and_tests($visit_hash = "", $tests)
    {
        $this->db->where('visit_id', $visit_hash)
            ->where_not_in('package_id', $tests)
            ->delete('lab_visits_package');
        $this->db->where('visit_id', $visit_hash)
            ->where_not_in('package_id', $tests)
            ->delete('lab_visits_tests');
    }

    public function get_visit_tests($hash)
    {
        return $this->db->query("
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
            ")->result_array();
    }

    public function getPatientDetail($visit_id)
    {
        $query = $this->db->query("
            select lab_patient.id,gender,age,lab_patient.name,lab_visits.hash as visit_hash,visit_date as date from lab_visits
            inner join lab_patient on lab_patient.hash=lab_visits.visits_patient_id
            where lab_visits.hash='$visit_id'
        ");
        $result = $query->result_array();
        if (isset($result[0])) {
            $result = $result[0];
            return $result;
        } else {
            return $visit_id;
        }
    }

    public function getScreenDetail()
    {
        $result = $this->db
            ->select('lab_visits.name as name, lab_visit_status.name as status,visits_status_id as status_id')
            ->from('lab_visits')
            ->where('visit_date', date('Y-m-d'))
            ->join('lab_visit_status', 'lab_visit_status.hash = lab_visits.visits_status_id', "left")
            ->order_by('lab_visits.id', 'DESC')
            ->get()->result_array();
        return $result;
    }

    public function saveTestResult($data)
    {
        $result = $this->db->update('lab_visits_tests', $data, array('hash' => $data['hash']));
        return $result;
    }

    public function get_visit_status()
    {
        $result = $this->db
            ->select('name,id')
            ->from('lab_visit_status')
            ->get()->result_array();
        return $result;
    }

    public function update_visit_status($hash, $status)
    {
        $result = $this->db
            ->update('lab_visits', array('visits_status_id' => $status), array('hash' => $hash));
        return $result;
    }

    public function saveTestsResult($data, $visit_hash)
    {
        $this->update_visit_status(5, $visit_hash);
        $result = $this
            ->db
            ->update_batch('lab_visits_tests', $data, 'hash');
        return $result;
    }

    public function get_visit_packages($hash)
    {
        $result = $this->db
            ->select('lab_pakage_tests.package_id as hash,lab_package.name as name,lab_visits_package.price')
            ->select('GROUP_CONCAT(lab_test.test_name) as tests')
            ->from('lab_visits_package')
            ->where('visit_id', $hash)
            ->join('lab_pakage_tests', 'lab_visits_package.package_id=lab_pakage_tests.package_id')
            ->join('lab_test', 'lab_test.hash=lab_pakage_tests.test_id')
            ->join('lab_package', 'lab_package.hash=lab_visits_package.package_id')
            ->group_by('lab_visits_package.hash')
            ->get()->result_array();
        return $result;
    }

    public function get_visits_mobile($page, $search, $status_val)
    {

        if ($status_val == "1") {
            $status = "=3";
        } elseif ($status_val == "0") {
            $status = "!=3";
        } else {
            $status = "is not null";
        }
        $visits = $this->db
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
            ->get($this->table, 10, $page * 10)
            ->result_array();

        $visits = array_map(function ($visit) {
            $packages = $this->get_visit_packages($visit['hash']);
            $visit['packages'] = $packages;
            return $visit;
        }, $visits);

        return $visits;
    }
}
