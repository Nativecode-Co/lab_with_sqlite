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
    }

    public function visit_count($params)
    {
        $order = $params['order'];
        $orderBy = $params['orderBy'];
        $searchText = $params['searchText'];
        $today = $params['today'];
        $opration = $today == 1 ? "=" : "<";
        $data = $this->db->from($this->table)
            ->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id')
            ->like(array('lab_patient.name' => $searchText))
            ->where(array('lab_visits.isdeleted' => '0', 'visit_date ' . $opration => date('Y-m-d')))
            ->order_by($orderBy, $order)
            ->count_all_results();
        return $data;
    }

    public function get_visits($params)
    {
        // params {page: 1,rowsPerPage: 5,order: "asc",orderBy: "",selected: [],filterList: [],searchText: ""}
        $page = $params['page'];
        $rowsPerPage = $params['rowsPerPage'];
        $order = $params['order'];
        $orderBy = $params['orderBy'];
        $searchText = $params['searchText'];
        $today = $params['today'];
        $opration = $today == 1 ? "=" : "<";
        $data = $this->db
            ->select('lab_visits.hash as hash ,visits_patient_id as patient_hash,')
            ->select("lab_patient.name as name,visit_date")
            ->select("(select name from lab_visit_status where hash=visits_status_id) as visit_type")
            ->from($this->table)
            ->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id')
            ->like(array('lab_patient.name' => $searchText))
            ->where(array('lab_visits.isdeleted' => '0', 'visit_date ' . $opration => date('Y-m-d')))
            ->order_by($orderBy, $order)
            ->limit($rowsPerPage, ($page - 1) * $rowsPerPage)
            ->get()->result_array();
        return $data;
    }

    public function create_visit($data)
    {
        $visit_data = $data['visit_data'];
        $visit_hash = $visit_data['hash'];
        $tests = $data['tests'];
        $this->db->trans_start();
        $visit_data = $data['visit_data'];
        $patient_data = $data['patient_data'];
        $tests = $data['tests'];
        $this->update_or_create_patient($patient_data);
        $this->update_or_create_visit($visit_data);
        $visit_hash = $visit_data['hash'];
        $this->create_visit_package_and_tests($visit_hash, $tests);
        $this->db->trans_complete();
        return $visit_hash;
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
        return $visit_hash;
    }

    public function get_visit($hash)
    {
        $visit = $this->db->get('lab_visits', array('hash' => $hash))->row_array();
        $patient = $this->db->get('lab_patient', array('hash' => $visit['visits_patient_id']))->row_array();
        $tests = $this->get_visit_tests($hash);
        $invoice = $this->getInvoice();
        return array(
            "visit" => $visit,
            "patient" => $patient,
            "invoice" => $invoice,
            "tests" => $tests
        );
    }

    public function get_visit_form_data()
    {
        // get all patients
        $patients = $this->db->select('hash,name')->get('lab_patient')->result_array();
        // get all doctors
        $doctors = $this->db->select('hash,name')->get('lab_doctor')->result_array();
        // return all data
        return array(
            "patients" => $patients,
            "doctors" => $doctors,
        );
    }

    public function get_tests_and_packages()
    {
        $categories = $this->db->select('hash,name')->get('lab_test_catigory')->result_array();
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
            ->select('lab_package.hash,lab_package.name,price,"test" as type,"false" as checked')
            ->select('kits.name as kit')
            ->select('devices.name as device')
            ->select('lab_test_units.name as unit')
            ->select('category_hash as catigory')
            ->where(
                array(
                    'lab_package.isdeleted' => '0',
                    'lab_package.catigory_id' => '9'
                )
            )
            ->join('lab_pakage_tests', 'lab_pakage_tests.package_id=lab_package.hash')
            ->join('kits', 'lab_pakage_tests.kit_id=kits.id', "left")
            ->join("devices", "lab_pakage_tests.lab_device_id=devices.id", "left")
            ->join("lab_test_units", "lab_pakage_tests.unit=lab_test_units.hash", "left")
            ->join("lab_test", "lab_test.id=lab_pakage_tests.test_id", "left")
            ->get('lab_package')->result_array();
        // return all data
        return array(
            "packages" => $packages,
            "tests" => $tests,
            "categories" => $categories
        );
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
        $tests = $this->db->select("test_id,package_id")->where_in('package_id', $tests)->get('lab_pakage_tests')->result_array();

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
                        "result" => "",
                    )
                )
            );
        }, $tests);
        $this->db->insert_batch('lab_visits_package', $packages);
        $this->db->insert_batch('lab_visits_tests', $tests);

        return $tests;
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
        try {
            $query = $this->db->query("
                SELECT
                    kit_id as kit, unit,
                   option_test as options,
                    lab_test_catigory.name as category,
                    result_test as result
                FROM
                    lab_visits_tests
                    inner join lab_pakage_tests on lab_pakage_tests.package_id=lab_visits_tests.package_id
                    inner join lab_test on lab_pakage_tests.test_id = lab_test.hash
                    left join lab_test_catigory on lab_test_catigory.hash = lab_test.category_hash
                WHERE
                    visit_id='$hash'
                order by sort
            ");
            $patient = $this->getPatientDetail($hash);
            $tests = $query->result_array();
            $tests = array_map(function ($test) {
                $option = str_replace('\\', '', $test['options']);
                $option = json_decode($option, true);
                $test['options'] = $option;
                return $test;
            }, $tests);
            $tests = split_tests($tests);
            $tests['normal'] = manageNormalTests($tests['normal'], $patient);
            return $tests;
        } catch (Exception $e) {
            return [];
        }
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

    public function getInvoice()
    {
        $this->db->select('color, phone_1,show_name, phone_2 as size, address, facebook, header, center, footer, logo, water_mark, footer_header_show, invoice_about_ar, invoice_about_en, font_size, zoom, doing_by, name_in_invoice, font_color, setting');
        $this->db->from('lab_invoice');
        $query = $this->db->get();
        $result = $query->result_array();
        $result = $result[0];
        $workers = $this->getWorkers();
        $newWorkers = array();
        if (isset($result['setting']) && $result['setting'] != "null" && $result['setting'] != "") {
            $setting = json_decode($result['setting'], true);
            if (isset($setting['orderOfHeader'])) {
                if ($setting['orderOfHeader'] == "null") {
                    $newWorkers = $workers;
                    // append logo to first 
                    array_unshift(
                        $newWorkers,
                        array(
                            "hash" => "logo",
                        )
                    );
                    $newWorkers[] = array(
                        "hash" => "name",
                    );
                } else {
                    $orderOfHeader = $setting['orderOfHeader'];
                    $orderOfHeader = json_decode($orderOfHeader, true);
                    $isFounded = in_array("name", $orderOfHeader);
                    if (!$isFounded) {
                        $orderOfHeader[] = "name";
                    }
                    foreach ($orderOfHeader as $key => $value) {
                        if ($value == 'logo') {
                            $newWorkers[] = array(
                                "hash" => "logo",
                            );
                            continue;
                        }
                        if ($value == 'name') {
                            $newWorkers[] = array(
                                "hash" => "name",
                            );
                            continue;
                        }
                        // loop on workers
                        foreach ($workers as $worker) {
                            if ($worker['hash'] == $value) {
                                $newWorkers[] = $worker;
                                // delete worker from workers
                                unset($workers[array_search($worker, $workers)]);
                            }
                        }
                    }
                }
            } else {
                $newWorkers = $workers;
                // append logo to first 
                array_unshift(
                    $newWorkers,
                    array(
                        "hash" => "logo",
                    )
                );
                $newWorkers[] = array(
                    "hash" => "name",
                );
            }
            $result['setting'] = $setting;
            $result['workers'] = $newWorkers;
            $result["unUsedWorkers"] = $workers;
        } else {
            $result['setting'] = array(
                "orderOfHeader" => array()
            );
            array_unshift(
                $workers,
                array(
                    "hash" => "logo",
                )
            );
            $workers[] = array(
                "hash" => "name",
            );
            $result['workers'] = $workers;
        }
        if (isset($result['width'])) {
            $result['width'] = (int) $result['width'];
        } else {
            $result['width'] = 4;
        }
        return $result;
    }

    public function getWorkers()
    {
        $this->db->select('name, jop, jop_en,hash');
        $this->db->from('lab_invoice_worker');
        $this->db->where('isdeleted', '0');
        $this->db->where('is_available', '1');
        $query = $this->db->get();
        $result = $query->result_array();
        return $result;
    }

    public function getInvoiceHeader()
    {
        $invoice = $this->getInvoice();

        $result = array(
            "orderOfHeader" => isset($invoice['setting']['orderOfHeader']) ? $invoice['setting']['orderOfHeader'] : array(),
            "workers" => $invoice['workers']
        );
        return $result;
    }

    public function getUnusedWorkers()
    {
        $invoice = $this->getInvoice();
        $workers = $invoice['unUsedWorkers'];
        // make Workers array
        $result = array();
        foreach ($workers as $worker) {
            $result[] = array(
                "hash" => $worker['hash'],
                "name" => $worker['name'],
                "jop" => $worker['jop'],
                "jop_en" => $worker['jop_en'],
            );
        }
        return $result;
    }

    public function setOrderOfHeader()
    {
        $setting = $this->db->query("select setting from lab_invoice");
        $setting = $setting->result_array();
        $setting = $setting[0]['setting'];
        $setting = json_decode($setting, true);
        $orderOfHeader = $this->input->post('orderOfHeader');
        $setting['orderOfHeader'] = json_encode($orderOfHeader);
        $setting = json_encode($setting);
        $query = $this->db->set('setting', $setting);
        $query = $this->db->update('lab_invoice');
        return $query;
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

    public function saveTestsResult($data)
    {
        // $data is array of tests
        $result = $this
            ->db
            ->update_batch('lab_visits_tests', $data, 'hash')
            ->affected_rows();
        return $result;

    }
}