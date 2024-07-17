<?php
class MainTestsModel extends CI_Model
{
    private $table = 'lab_test';
    private $main_column = 'hash';

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->helper('db');
        /**
         * Test Type
         * 0 => Normal Test
         * 1 => Structural Test
         * 2 => culture Test
         * 3 => calculation Test
         */
        $data = array(
            array(
                'hash' => '1',
                'test_type' => 1
            ),
            array(
                'hash' => '358',
                'test_type' => 1
            ),
            array(
                'hash' => '359',
                'test_type' => 1
            ),
            array(
                'hash' => '280',
                'test_type' => 1
            ),
            array(
                'hash' => '360',
                'test_type' => 1
            ),
            array(
                'hash' => '16708623707062301',
                'test_type' => 1
            ),
            array(
                'hash' => '17191507390750354',
                'test_type' => 1
            ),
            array(
                'hash' => '17108532252804844',
                'test_type' => 2
            ),
            array(
                'hash' => '17108532939902565',
                'test_type' => 2
            ),
            array(
                'hash' => '16524696230008382',
                'test_type' => 2
            ),
            array(
                'hash' => '17108532346344814',
                'test_type' => 2
            ),
            array(
                'hash' => '17108532846945133',
                'test_type' => 2
            ),
            array(
                'hash' => '17108532747457977',
                'test_type' => 2
            ),
            array(
                'hash' => '',
                'test_type' => 2
            ),
            array(
                'hash' => '17108532460875163',
                'test_type' => 2
            ),
            array(
                'hash' => '17108532150683442',
                'test_type' => 2
            ),
            array(
                'hash' => '17108532563553306',
                'test_type' => 2
            ),
            array(
                'hash' => '1710853195433550',
                'test_type' => 2
            )
        );

        $this->db->update_batch($this->table, $data, 'hash');
        // add updated_at col if not already
        if (!$this->db->field_exists('updated_at', $this->table)) {
            $this->db->query("ALTER TABLE $this->table ADD updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        }
    }

    public function count_all($params)
    {
        $searchText = $params['search']['value'];
        return $this->db
            ->where('lab_test.isdeleted', 0)
            // ->where('lab_test.test_type <>', 3)
            ->like("test_name", $searchText)
            ->join('lab_test_catigory', 'lab_test_catigory.hash = lab_test.category_hash', 'left')
            ->count_all_results($this->table);
    }

    public function get_all($params)
    {
        $start = $params['start'];
        $rowsPerPage = $params['length'];
        $page = $start / $rowsPerPage;
        $orderBy = $params['order'][0]['column'];
        $orderBy = $params['columns'][$orderBy]['data'];
        $order = $params['order'][0]['dir'];
        $searchText = $params['search']['value'];
        $tests = $this->db
            ->select('lab_test.hash,test_name,option_test')
            // category_name
            ->select('lab_test_catigory.name as category_name')
            ->join('lab_test_catigory', 'lab_test_catigory.hash = lab_test.category_hash', 'left')
            ->where('lab_test.isdeleted', 0)
            // ->where('lab_test.test_type <>', 3)
            ->like("test_name", $searchText)
            // order by id
            ->order_by("lab_test.id", "desc")
            ->order_by($orderBy, $order)

            ->get($this->table, $rowsPerPage, $page * $rowsPerPage)
            ->result();
        // print query 
        // echo $this->db->last_query();
        // add refrence to the output
        $this->load->helper('json');

        foreach ($tests as $test) {
            $option_test = $test->option_test;
            $json = new Json($option_test);
            $option_test = $json->filterToArray(array());
            $test->refrence = $option_test;
            unset($test->option_test);
        }
        die($tests);
        return $tests;
    }

    public function get_tests_options()
    {
        $tests = $this->db
            ->select('hash,test_name as text')
            ->where('isdeleted', 0)
            // ->where('test_type <>', 3)
            ->order_by('test_name', 'asc')
            ->get($this->table)
            ->result();
        return $tests;
    }

    public function get($hash, $fields)
    {
        $this->load->helper('json');
        $output = $this->db
            ->where('isdeleted', 0)
            ->where($this->main_column, $hash)
            ->get($this->table)
            ->row();
        $output = json_decode(json_encode($output), true);
        $option_test = $output["option_test"];

        $json = new Json($option_test);
        $output["option_test"] = $json->get();
        $option_test = $json->filterToArray($fields);
        $output["refrence"] = $option_test;
        return $output;
    }

    public function get_by_patient_and_test($hash, $visit_hash)
    {
        $this->load->helper('json');
        $output = $this->db
            ->where('isdeleted', 0)
            ->where($this->main_column, $hash)
            ->get($this->table)
            ->row();
        $output = json_decode(json_encode($output), true);
        $option_test = $output["option_test"];

        $visit = $this->db
            ->select("age,gender")
            ->from("lab_visits")
            ->join("lab_patient", "lab_patient.hash=lab_visits.visits_patient_id")
            ->where("lab_visits.hash", $visit_hash)
            ->get()->row_array();
        $test = $this->db
            ->select("kit_id as kit,unit")
            ->from("lab_visits_tests")
            ->join("lab_test", "lab_test.hash = lab_visits_tests.tests_id")
            ->join("lab_pakage_tests", "lab_pakage_tests.test_id = lab_visits_tests.tests_id", "left")
            // where lab_test.hash = hash and visit_hash = visit_hash
            // or lab_test.id = hash and visit_hash = visit_hash
            ->where(array("lab_test.hash" => $hash, "visit_id" => $visit_hash))

            ->get()->row_array();
        //die last query
        $fields = array_merge($test, $visit);

        $json = new Json($option_test);
        $option_test = $json->filter($fields)->row();
        $output["refrence"] = $option_test;
        unset($output["option_test"]);
        return $output;
    }

    public function get_calc($hash)
    {
        return $this->db
            ->where('isdeleted', 0)
            ->where($this->main_column, $hash)
            ->get($this->table)
            ->row();
    }

    public function get_structural_tests()
    {
        $tests = $this->db
            ->select('hash, option_test,test_name as name')
            ->where('isdeleted', 0)
            ->where('test_type', 1)
            ->get($this->table)
            ->result_array();
        $tests = array_map(function ($test) {
            $option_test = $test['option_test'];
            $test['option_test'] = json_decode($option_test, true);
            return $test;
        }, $tests);
        return $tests;
    }


    public function insert($data)
    {
        $data['hash'] = create_hash();
        $option_test = $data['option_test'];
        // replace backslashes with empty string to avoid SQL injection
        $option_test = str_replace('\\', '', $option_test);
        $this->db->insert($this->table, $data);
        return $this->get($data['hash'], array());
    }

    public function update($hash, $data)
    {
        if (isset($data['option_test'])) {
            $option_test = $data['option_test'];
            // replace backslashes with empty string to avoid SQL injection
            $option_test = str_replace('\\', '', $option_test);
        }
        $this->db
            ->where($this->main_column, $hash)
            ->update($this->table, $data);
        return $this->get($hash, array());
    }

    public function delete($hash)
    {
        $this->db
            ->where($this->main_column, $hash)
            ->update($this->table, ['isdeleted' => 1]);
    }

    public function get_calc_tests($params)
    {
        $start = $params['start'];
        $rowsPerPage = $params['length'];
        $page = $start / $rowsPerPage;
        $orderBy = $params['order'][0]['column'];
        $orderBy = $params['columns'][$orderBy]['data'];
        $order = $params['order'][0]['dir'];
        $searchText = $params['search']['value'];
        $count = $this->db
            ->where('isdeleted', 0)
            ->where('test_type', 3)
            ->like("test_name", $searchText)
            ->count_all_results($this->table);
        $tests = $this->db
            ->select('hash,test_name')
            ->where('isdeleted', 0)
            ->where('test_type', 3)
            ->like("test_name", $searchText)
            ->order_by($orderBy, $order)
            ->get($this->table, $rowsPerPage, $page * $rowsPerPage)
            ->result();
        return array(
            "recordsTotal" => $count,
            "recordsFiltered" => $count,
            "data" => $tests
        );
    }

    public function get_main_tests_data()
    {

        $categories = $this->db
            ->select('name as text,hash')
            ->where('isdeleted', 0)
            ->get('lab_test_catigory')
            ->result();
        $tests = $this->db
            ->select('test_name as text, hash')
            ->where('isdeleted', 0)
            // ->where('test_type <>', 3)
            ->get('lab_test')
            ->result();
        $units = $this->db
            ->select('name as text, hash')
            ->get('lab_test_units')
            ->result();
        // SELECT distinct kits.id, kits.name FROM kits;
        $kits = $this->db
            ->select('name, id')
            ->get('kits')
            ->result();
        return array(
            "categories" => $categories,
            "tests" => $tests,
            "units" => $units,
            "kits" => $kits
        );
    }

    public function insert_batch($data)
    {
        if (empty($data)) {
            return;
        }
        $data = array_map(function ($test) {
            $option_test = $test['option_test'];
            $test['option_test'] = json_decode(json_encode($option_test), true);
            return $test;
        }, $data);
        $this->db->insert_batch($this->table, $data);
    }

    public function update_batch($data)
    {
        if (empty($data)) {
            return;
        }
        $data = array_map(function ($test) {
            $option_test = $test['option_test'];
            $test['option_test'] = json_decode(json_encode($option_test), true);
            return $test;
        }, $data);
        $this->db->update_batch($this->table, $data, 'hash');
    }

    public function get_main_tests_by_updated_at($data)
    {
        $result = [];
        if (is_array($data)) {
            foreach ($data as $item) {
                $hash = $item['hash'];
                $updated_at = $item['updated_at'];
                $test = $this->db->select('hash')
                    ->where('isdeleted', 0)
                    ->where('updated_at <', $updated_at)
                    ->where($this->main_column, $hash)
                    ->get($this->table)
                    ->row();
                if ($test) {
                    $result[] = $test;
                }
            }
        }
        $result = array_map(function ($test) {
            return $test->hash;
        }, $result);
        return $result;
    }
}
