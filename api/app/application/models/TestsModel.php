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
        $this->load->model('VisitModel');
        $this->load->model('TestAliasModel');
        $this->load->model('TestNotModal');
    }

    public function get_all($params)
    {
        $catigory_id = $params['catigory'];
        if ($catigory_id == 9) {
            return $this->getPackagesForLAb($params);
        } else {
            return $this->getOffersForLAb($params);
        }
    }

    public function get($hash)
    {
        $data = $this->db
            ->select('category_hash, lab_pakage_tests.*, lab_package.*')
            ->where('lab_pakage_tests.isdeleted', 0)
            ->where('lab_package.isdeleted', 0)
            ->join('lab_pakage_tests', 'lab_pakage_tests.package_id = lab_package.hash', 'inner')
            ->join("lab_test", "lab_test.hash = lab_pakage_tests.test_id", "left")
            ->where('lab_package.hash', $hash)
            ->get($this->table)
            ->row();
        if (isset($data)) {
            $data->tests = $this->get_package_tests($hash);
            return $data;
        } else {
            return array(
                "error" => "can't find the package"
            );
        }
    }

    public function insert($data, $tests = [])
    {
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
                'unit' => isset($test['unit']) ? $test['unit'] : null,
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

    function getPackagesForLAb($params)
    {
        $start = $params['start'];
        $rowsPerPage = $params['length'];
        $page = $start / $rowsPerPage;
        $orderBy = $params['order'][0]['column'];
        $orderBy = $params['columns'][$orderBy]['data'];
        $order = $params['order'][0]['dir'];
        $searchText = $params['search']['value'];
        $data = $this->db
            ->select('lab_package.hash as hash, lab_device_id, kit_id, test_id, unit, lab_package.name as name, lab_package.price as price, lab_package.cost as cost')
            ->select('(select name from kits where id=lab_pakage_tests.kit_id limit 1) as kit_name')
            ->select('(select name from devices where id=lab_pakage_tests.lab_device_id limit 1) as device_name')
            ->select('(select name from lab_test_units where hash = lab_pakage_tests.unit limit 1) as unit_name')
            ->join('lab_pakage_tests', 'lab_pakage_tests.package_id = lab_package.hash', 'inner')
            ->where('catigory_id', 9)
            ->where('lab_package.isdeleted', 0)
            ->like('lab_package.name', $searchText)
            ->order_by($orderBy, $order)
            ->group_by('lab_package.hash')
            ->get($this->table, $rowsPerPage, $page * $rowsPerPage)->result_array();
        $total = $this->db
            ->select('lab_package.hash as hash')
            ->join('lab_pakage_tests', 'lab_pakage_tests.package_id = lab_package.hash', 'inner')
            ->where('catigory_id', 9)
            ->where('lab_package.isdeleted', 0)
            ->like('lab_package.name', $searchText)
            ->group_by('lab_package.hash')
            ->count_all_results($this->table);
        return array(
            "recordsTotal" => $total,
            "recordsFiltered" => $total,
            "data" => $data
        );
    }

    function getOffersForLAb($params)
    {
        $start = $params['start'];
        $rowsPerPage = $params['length'];
        // page = 0 / 10  = 1
        $page = $start / $rowsPerPage;
        $orderBy = $params['order'][0]['column'];
        $orderBy = $params['columns'][$orderBy]['data'];
        $order = $params['order'][0]['dir'];
        $searchText = $params['search']['value'];
        $data = $this->db
            ->select("hash,name,price,cost")
            ->where('catigory_id', 8)
            ->where('lab_package.isdeleted', 0)
            ->like('lab_package.name', $searchText)
            ->order_by($orderBy, $order)
            ->get($this->table, $rowsPerPage, $page * $rowsPerPage)->result_array();

        $total = $this->db
            ->where('catigory_id', 8)
            ->where('lab_package.isdeleted', 0)
            ->like('lab_package.name', $searchText)
            ->count_all_results($this->table);
        return array(
            "recordsTotal" => $total,
            "recordsFiltered" => $total,
            "data" => $data
        );
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

    public function get_packages_test()
    {
        $data = $this->db
            ->select('test_id as hash, name, test_id, unit, lab_device_id, kit_id')
            ->select('(SELECT IFNULL((SELECT DISTINCT name FROM devices WHERE id=lab_pakage_tests.lab_device_id), "No Device")) AS device_name')
            ->select('(SELECT IFNULL((SELECT DISTINCT name FROM lab_test_units WHERE hash=lab_pakage_tests.unit), "No Unit")) AS unit_name')
            ->select('(SELECT IFNULL((SELECT DISTINCT name FROM kits WHERE id=lab_pakage_tests.kit_id), "No Kit")) AS kit_name')
            ->where(
                array(
                    'lab_package.isdeleted' => 0,
                    'catigory_id' => 9
                )
            )
            ->from('lab_package')
            ->join('lab_pakage_tests', 'lab_package.hash = lab_pakage_tests.package_id', 'inner')
            ->get()
            ->result();
        return $data;
    }

    public function test_is_exist($test_id)
    {
        $data = $this->db
            ->where('test_id', $test_id)
            ->get('lab_pakage_tests')
            ->row();
        return array(
            "isExist" => isset($data),
            "data" => $data
        );
    }

    public function get_tests_data()
    {
        $kits = $this->db
            ->select('id as hash, name as text')
            ->get('kits')
            ->result();
        $devices = $this->db
            ->select('id as hash, name as text')
            ->get('devices')
            ->result();
        $units = $this->db
            ->select('hash, name as text')
            ->get('lab_test_units')
            ->result();
        return array(
            "kits" => $kits,
            "devices" => $devices,
            "units" => $units
        );
    }

    public function insert_sync_packages($hashes)
    {
        if ($hashes) {
            // check if hashes is array
            if (!is_array($hashes)) {
                $hashes = json_decode($hashes, true);
            }
            $data = $this->db
                ->select('option_test,test_name as name,hash')
                ->where_in('hash', $hashes)
                ->get("lab_test")
                ->result_array();

            foreach ($data as $key => $value) {
                $json = new Json($value['option_test']);
                $references = $json->filterToArray(array());
                foreach ($references as $reference) {
                    $test_is_exist = $this->db
                        ->where('test_id', $value['hash'])
                        ->where('kit_id', $reference['kit'])
                        ->where('unit', $reference['unit'])
                        ->get('lab_pakage_tests')
                        ->row_array();
                    if (!$test_is_exist) {
                        $hash = create_hash();
                        // create package
                        $package = array(
                            'hash' => $hash,
                            'name' => $value['name'],
                            'price' => 0,
                            'cost' => 0,
                            'catigory_id' => 9
                        );
                        $this->insert($package, array(
                            array(
                                'test_id' => $value['hash'],
                                'kit_id' => $reference['kit'],
                                'lab_device_id' => "",
                                'unit' => $reference['unit'],
                            )
                        ));
                    }
                }
            }
            return true;
        } else {
            return null;
        }
    }

    public function set_result_by_alias($alias, $visit_id, $result)
    {
        $test_hash = $this->TestAliasModel->get_test_hash_by_alias($alias);
        $visit = $this->VisitModel->get_visit($visit_id);
        if (isset($visit) && isset($test_hash)) {
            // test name from lab_test
            $test_name = $this->db
                ->select('test_name as name')
                ->where('hash', $test_hash)
                ->get('lab_test')
                ->row()->name;
            if (!$test_name) {
                return false;
            }
            $this->TestNotModal->insert(array(
                "message" => "تم اكمال ونقل نتيجة تحليل " . $test_name . " من الجهاز الي النظام"
            ));
            $result = json_encode(
                array(
                    $test_name => $result,
                    'checked' => true
                )
            );
            $this->db
                ->where('visit_id', $visit_id)
                ->where('tests_id', $test_hash)
                ->update('lab_visits_tests', [
                    'result_test' => $result
                ]);
            return true;
        }
        return false;
    }

    public function insert_batch($data)
    {
        $data = array_chunk($data, 1000);
        foreach ($data as $key => $value) {
            $this->db->insert_batch($this->table, $value);
        }
    }

    public function insert_batch_tests($data)
    {
        $data = array_chunk($data, 1000);
        foreach ($data as $key => $value) {
            $this->db->insert_batch('lab_pakage_tests', $value);
        }
    }
}
