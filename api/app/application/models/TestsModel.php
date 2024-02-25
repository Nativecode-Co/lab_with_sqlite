<?php
class TestsModel extends CI_Model
{
    private $table = 'lab_package';
    private $main_column = 'hash';

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->helper('db');
    }

    public function count_all($params, $catigory_id = 9)
    {
        $searchText = $params['search']['value'];
        return $this->db

            ->where('isdeleted', 0)
            ->where('catigory_id', $catigory_id)
            ->like("name", $searchText)
            ->count_all_results($this->table);
    }

    public function get_all($params, $catigory_id = 9)
    {
        $start = $params['start'];
        $rowsPerPage = $params['length'];
        $page = $start / $rowsPerPage + 1;
        $orderBy = $params['order'][0]['column'];
        $orderBy = $params['columns'][$orderBy]['data'];
        $order = $params['order'][0]['dir'];
        $searchText = $params['search']['value'];

        $data = $this->db
            ->where('isdeleted', 0)
            ->where('catigory_id', $catigory_id)
            ->like("name", $searchText)
            ->order_by($orderBy, $order)
            ->get($this->table, $rowsPerPage, $page * $rowsPerPage)
            ->result();

        $total = $this->count_all($params, $catigory_id);
        return array("total" => $total, "data" => $data);
    }

    public function get($hash)
    {
        $data = $this->db
            ->where('isdeleted', 0)
            ->where($this->main_column, $hash)
            ->get($this->table)
            ->row();
        if (isset($data)) {
            $data->tests = $this->get_package_tests($hash);
            return $data;
        } else {
            return null;
        }
    }

    public function insert($data, $tests = [])
    {
        // for every tests in the package we need [test_id, kit_id, lab_device_id, unit, hash] addition to the package_id 
        $hash = create_hash();
        $data['hash'] = $hash;
        $this->db->insert($this->table, $data);
        $this->insert_tests($hash, $tests);
        return $this->get($hash);
    }

    // bulk insert for the tests in the package
    public function insert_tests($package_id, $tests)
    {
        $data = array_map(function ($test) use ($package_id) {
            return [
                'package_id' => $package_id,
                'test_id' => $test['test_id'],
                'kit_id' => $test['kit_id'],
                'lab_device_id' => $test['lab_device_id'],
                'unit' => $test['unit'],
                'hash' => create_hash()
            ];
        }, $tests);
        $this->db->insert_batch('lab_pakage_tests', $data);
    }

    public function update($hash, $data, $tests = [])
    {
        $this->db
            ->where($this->main_column, $hash)
            ->update($this->table, $data);
        $this->update_tests($hash, $tests);
        return $this->get($hash);
    }

    public function update_tests($package_id, $tests)
    {
        $tests_ids = array_map(function ($test) {
            return $test['test_id'];
        }, $tests);
        $this->db
            ->where('package_id', $package_id)
            ->where_not_in('test_id', $tests_ids)
            ->update('lab_pakage_tests', ['isdeleted' => 1]);

        // if the test is already in the package we will update it, if not we will insert it
        foreach ($tests as $test) {
            $test_exit = $this->db
                ->where('package_id', $package_id)
                ->where('test_id', $test['test_id'])
                ->get('lab_pakage_tests')
                ->row();
            if (isset($test_exit)) {
                $this->db
                    ->where('package_id', $package_id)
                    ->where('test_id', $test['test_id'])
                    ->update('lab_pakage_tests', $test);
            } else {
                $test['package_id'] = $package_id;
                $test['hash'] = create_hash();
                $this->db->insert('lab_pakage_tests', $test);
            }
        }
    }

    public function delete($hash)
    {
        $this->db
            ->where($this->main_column, $hash)
            ->update($this->table, ['isdeleted' => 1]);

        $this->db
            ->where('package_id', $hash)
            ->update('lab_pakage_tests', ['isdeleted' => 1]);
    }

    public function get_package_tests($hash)
    {
        $data = $this->db
            ->select('test_id')
            ->where('isdeleted', 0)
            ->where('package_id', $hash)
            ->get('lab_pakage_tests')
            ->result();
        $data = array_map(function ($item) {
            return $item->test_id;
        }, $data);
        return $data;
    }

    public function get_tests_report_data()
    {
        $tests = $this->db
            ->select('test_id,(select name from lab_package where package_id=lab_package.hash) as name')
            ->group_by('name')
            ->get('lab_pakage_tests')
            ->result();

        $doctors = $this->db
            ->select('name,hash')
            ->where('isdeleted', 0)
            ->get('lab_doctor')
            ->result();
        return array(
            "tests" => $tests,
            "doctors" => $doctors
        );
    }

}