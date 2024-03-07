<?php
class Visit_model extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        // $this->load->database('unimedica', TRUE);
        $this->load->library('session');
        $this->load->library('migration');
        // check if lab_invoice have col named border
        if (!$this->db->field_exists('history', 'lab_invoice')) {
            $this->db->query("ALTER TABLE lab_invoice ADD COLUMN history INTEGER NOT NULL DEFAULT 0;");
        }
        if (!$this->db->field_exists('show_name', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `show_name` INTEGER NOT NULL DEFAULT 0 ;");
        }
        if (!$this->db->field_exists('show_logo', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `show_logo` INTEGER NOT NULL DEFAULT 1 ;");
        }
    }

    public function bothIsset($var1, $var2)
    {
        if ((isset($var1) && isset($var2)) && (!empty($var1) && !empty($var2))) {
            return true;
        } else {
            return false;
        }
    }

    public function checkGender($gender1, $gender2)
    {
        // replace ى with ي
        $gender1 = str_replace('ى', 'ي', $gender1);
        $gender2 = str_replace('ى', 'ي', $gender2);
        if (($gender1 == $gender2) || ($gender1 == 'كلاهما') || ($gender2 == 'كلاهما')) {
            return true;
        } else {
            return false;
        }
    }

    public function checkAge($age, $low, $high)
    {
        if ($age >= $low && $age <= $high) {
            return true;
        } else {
            return false;
        }
    }

    public function issetOrValue($var, $value = '')
    {
        if (isset($var)) {
            return $var;
        } else {
            return $value;
        }
    }

    public function get($hash, $fields)
    {
        $this->load->helper('json');
        $visit = $this->db
            ->select("lab_visits.hash as hash, lab_patient.name as name, visit_date as date")
            ->select("lab_patient.hash as patient_hash, gender,age")
            ->from("lab_visits")
            ->join("lab_patient", "lab_patient.hash=lab_visits.visits_patient_id")
            ->where("lab_visits.hash", $hash)
            ->get()->row();
        $tests = $this->db
            ->select("option_test, test_name as name,sort, result_test as result, ifnull(lab_test_catigory.name, 'Tests') as category")
            ->select("unit, kit_id as kit")
            ->from("lab_visits_tests")
            ->join("lab_test", "lab_test.hash=lab_visits_tests.tests_id")
            ->join("lab_test_catigory", "lab_test_catigory.hash=lab_test.category_hash", "left")
            ->join("lab_pakage_tests", "lab_pakage_tests.package_id=lab_visits_tests.package_id and lab_pakage_tests.test_id=lab_visits_tests.tests_id")
            ->where("visit_id", $hash)
            ->get()->result_array();
        if (isset($visit) && isset($tests)) {
            $tests = array_map(function ($test) use ($visit) {
                $json = new Json($test['option_test']);
                $filterFeilds = array_merge((array) $test, (array) $visit);
                $test['option_test'] = $json->filter($filterFeilds)->setHeight()->row();
                $test['result'] = json_decode($test['result'], true);
                return $test;
            }, $tests);
        }
        // sort array by category then by sort
        usort($tests, function ($a, $b) {
            if ($a['category'] == $b['category']) {
                return $a['sort'] <=> $b['sort'];
            }
            return $a['category'] <=> $b['category'];
        });
        $visit->tests = $tests;
        return $visit;
    }

    public function record_count($search, $current = 0)
    {
        /// delete duplicate visits has same hash only one of them is not deleted but id is different
        $lab_id = $this->input->post('lab_id');
        $date_opration = $current == 1 ? '>=' : '<';
        $count = $this->db
            ->like('lab_visits.name', $search)
            ->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id')
            ->where('lab_patient.lab_id', $lab_id)
            ->where('lab_visits.isdeleted', '0')
            ->where('lab_visits.visit_date ' . $date_opration, date('Y-m-d'))
            ->group_by('lab_visits.hash')
            ->get('lab_visits')

            ->num_rows();
        return $count;
    }



    function getVisits($lab_id, $start, $length, $search, $current = 0)
    {
        // like
        $this->db->select('lab_visits.hash as hash ,ispayed ,visits_patient_id as patient_hash,lab_visits.name as name,visit_date,lab_patient.name as patient_name,(select name from lab_visit_status where hash=visits_status_id) as visit_type');
        // inner join 
        $this->db->from('lab_visits');
        $this->db->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id');
        // where
        $this->db->where('lab_patient.lab_id', $lab_id);
        $this->db->where('lab_visits.isdeleted', '0');

        $this->db->like('lab_visits.name', $search);
        if ($current == 1) {
            $this->db->where('lab_visits.visit_date >=', date('Y-m-d'));
        }

        // order by
        $this->db->order_by('lab_visits.id', 'DESC');
        // limit
        $this->db->limit($start, $length);
        // group by 
        $this->db->group_by('lab_visits.hash');
        // get
        $query = $this->db->get();
        return $query->result_array();
    }


    public function patient_history($patient_id, $visit_date)
    {
        $tests = $this->get_tests($patient_id, $visit_date);
        if (!isset($tests[0]))
            return [];
        // map tests
        $tests = array_map(function ($test) {
            // decode result
            $result = json_decode($test['result'], true);
            if (isset ($result[$test['name']])) {
                $result = $result[$test['name']];
                if (!isset ($result) || $result == "") {
                    $result = "";
                } else {
                    $result = " - Last Result dated " . $test['date'] . "  was : " . $result;
                }
            } else {
                $result = $test['result'];
            }

            $test['result'] = $result;
            return $test;
        }, $tests);
        return $tests;
    }

    public function get_patient_visits($patient_id, $visit_date)
    {
        $this->db->select('hash');
        $this->db->from('lab_visits');
        $this->db->where('visits_patient_id', $patient_id);
        $this->db->where('isdeleted', '0');
        $this->db->where('visit_date <', $visit_date);
        // order by
        $this->db->order_by('id', 'DESC');
        // limit not first visit
        $this->db->limit(15, 0);
        $query = $this->db->get();
        $visits = $query->result_array();
        $visits = array_column($visits, 'hash');
        return $visits;
    }

    public function get_tests($patient_id, $visit_date)
    {
        $query = $this->db->query("
        SELECT 
            tests_id AS id,
            result_test AS result,
            (SELECT 
                    test_name
                FROM
                    lab_test
                WHERE
                    hash = tests_id) AS name,
            (SELECT 
                    visit_date
                FROM
                    lab_visits
                WHERE
                    hash = visit_id) AS date
        FROM
            lab_visits_tests
        WHERE
            visit_id in (SELECT 
                    hash
                FROM
                    lab_visits
                WHERE
                    visits_patient_id = '$patient_id'
                        AND isdeleted = 0
                        AND visit_date < '$visit_date'
                ORDER BY visit_date DESC)
                AND tests_id != 0 ORDER BY date DESC;
        ");
        $tests = $query->result_array();
        return $tests;
    }

    public function last_patient_visit_tests($patient_id)
    {
        // get last visit
        $this->db->select('hash');
        $this->db->from('lab_visits');
        $this->db->where('visits_patient_id', $patient_id);
        $this->db->where('isdeleted', '0');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        $result = $query->result_array();
        $visit = $result[0]['hash'];
        // get tests
        $this->db->select('tests_id');
        $this->db->from('lab_visits_tests');
        $this->db->where('visit_id', $visit);
        $query = $this->db->get();
        $tests = $query->result_array();
        $tests = array_column($tests, 'tests_id');
        return $tests;
    }

    public function getVisitTests($hash)
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
            $tests = $query->result_array();
            $tests = array_map(function ($test) {
                $option = str_replace('\\', '', $test['options']);
                $option = json_decode($option, true);
                $test['options'] = $option;
                return $test;
            }, $tests);
            $tests = $this->split_tests($tests);
            $tests['normal'] = $this->manageNormalTests($tests['normal'], $hash);
            return $tests;
        } catch (Exception $e) {
            return [];
        }
    }

    public function split_tests($tests)
    {
        $normal = [];
        $special = [];
        foreach ($tests as $test) {
            $options = $test['options'];
            if (isset($options['type'])) {
                if ($options['type'] == 'type') {
                    $special[] = $test;
                } else {
                    $normal[] = $test;
                }
            } else {
                $normal[] = $test;
            }
        }
        return [
            'normal' => $normal,
            'special' => $special
        ];
    }

    public function manageNormalTests($tests, $visit_id)
    {
        $patient = $this->getPatientDetail($visit_id);
        $tests = array_map(function ($test) use ($patient) {
            try {
                $options = $test['options'];
                $component = $options["component"][0];
                $options = $options["component"][0]["reference"];
                $options = array_filter($options, function ($item) use ($patient, $test) {
                    $lowAge = $this->issetOrValue(isset ($item['age low']), 0);
                    $highAge = $this->issetOrValue($item['age high'], 1000);
                    $gender = $this->issetOrValue($item['gender'], "كلاهما");
                    if (
                        ($item['kit'] == $test['kit'] || !$this->bothIsset($item['kit'], $test['kit'])) &&
                        ($item['unit'] == $test['unit'] || !$this->bothIsset($item['unit'], $test['unit'])) &&
                        $this->checkGender($patient["gender"], $gender) &&
                        $this->checkAge($patient["age"], $lowAge, $highAge)
                    ) {
                        return true;
                    } else {
                        return false;
                    }

                });
                $options = array_map(function ($item) use ($component, $test) {
                    if (isset ($component['name'])) {
                        $item['name'] = $component['name'];
                    }
                    if (isset ($component['unit'])) {
                        $item['unit'] = $component['unit'];
                    }
                    if (isset ($component['result'])) {
                        $item['result'] = $component['result'];
                    }
                    if (isset ($test['result'])) {
                        $item['result'] = $this->getResult($test['result']);
                    } else if ($component['name']) {
                        $item['result'] = array (
                            "checked" => true,
                            $component['name'] => ""
                        );
                    }
                    if (isset ($test['category'])) {
                        $item['category'] = $test['category'];
                    } else {
                        $item['category'] = "Tests";
                    }
                    return $item;
                }, $options);
                $test = $options;

            } catch (Exception $e) {
                $test = [];
            }
            return $test;
        }, $tests);
        $tests = array_merge(...$tests);
        // sort array by category
        usort($tests, function ($a, $b) {
            return $a['category'] <=> $b['category'];
        });

        return $tests;
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

    public function getResult($result)
    {
        $result = json_decode($result, true);
        // delete options from result
        unset($result['options']);
        return $result;
    }

    public function getInvoice()
    {
        $this->db->select('color, phone_1,show_name,show_logo, phone_2 as size, address, facebook, header, center, footer, logo, water_mark, footer_header_show, invoice_about_ar, invoice_about_en, font_size, zoom, doing_by, name_in_invoice, font_color, setting');
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
}
