<?php
class Package_model extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }

    public function record_count_packages($search)
    {
        $this->db->select('count(*) as count');
        $this->db->from('lab_package');
        $this->db->where('lab_id', $this->input->post('lab_id'));
        $this->db->where('catigory_id', 9);
        $this->db->where('isdeleted', 0);
        $this->db->like('name', $search);
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
    }

    public function record_count_offers($search)
    {
        $this->db->select('count(*) as count');
        $this->db->from('lab_package');
        $this->db->where('lab_id', $this->input->post('lab_id'));
        $this->db->where('catigory_id', 8);
        $this->db->where('isdeleted', 0);
        $this->db->like('name', $search);
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
    }

    function getPackagesForLAb($labID, $start, $length, $search)
    {
        // like
        $this->db->select(
            'lab_package.hash as hash, lab_device_id,
            kit_id,
            test_id,
            unit,
            lab_package.name as name,
            lab_package.price as price,
            lab_package.cost as cost,
            (select name from kits where id=lab_pakage_tests.kit_id) as kit_name,
            (select name from devices where id=lab_pakage_tests.lab_device_id) as device_name,
            (select name from lab_test_units where hash = lab_pakage_tests.unit) as unit_name'
        );
        // inner join 
        $this->db->from('lab_package');
        $this->db->join('lab_pakage_tests', 'lab_pakage_tests.package_id = lab_package.hash');
        // where
        $this->db->where('lab_package.lab_id', $labID);
        // and
        $this->db->where('catigory_id', 9);
        // and
        $this->db->where('lab_package.isdeleted', 0);
        // like
        $this->db->like('lab_package.name', $search);
        // order by
        $this->db->order_by('lab_package.id', 'DESC');
        // limit
        $this->db->limit($start, $length);
        // get
        $query = $this->db->get();
        return $query->result_array();
    }

    function getOffersForLAb($labID = "", $start = 0, $length = 10, $search = "")
    {
        // like
        $this->db->select(
            "hash,name,price,cost "
        );
        // inner join 
        $this->db->from('lab_package');
        // where
        $this->db->where('lab_package.lab_id', $labID);
        // and
        $this->db->where('catigory_id', 8);
        // and
        $this->db->where('lab_package.isdeleted', 0);
        // like
        $this->db->like('lab_package.name', $search);
        // order by
        $this->db->order_by('lab_package.id', 'DESC');
        // limit
        $this->db->limit($start, $length);
        // get
        $query = $this->db->get();
        return $query->result_array();
    }

    function CreatePackageNoKits($labId)
    {
        $packages = $this->db->query('SELECT hash,test_name,option_test->"$.component[0].reference[*].kit" as kit,option_test->"$.component[0].reference[*].unit" as unit FROM lab_test');
        $packages = $packages->result_array();

        // filter out the tests that have no kits
        $packages = array_filter($packages, function ($package) {
            if ($package['kit'] != null) {
                $kit = json_decode($package['kit']);
                // check length of kit or kit[0]==''
                if (count($kit) == 0 || in_array('', $kit) || in_array("", $kit)) {
                    return true;
                }
            }
            return false;
        });
        $packages = array_map(function ($package) {
            $kit = json_decode($package['kit']);
            $unit = json_decode($package['unit']);
            $index = array_search('', $kit);
            $package['kit'] = $kit[$index];
            $package['unit'] = $unit[$index];
            return $package;
        }, $packages);

        // forEach Packages create a package
        foreach ($packages as $package) {
            // RANDOM HASH
            $hash = round(microtime(true) * 10000) . rand(0, 1000);
            $package_name = $package['test_name'];
            $package_hash = $package['hash'];
            $package_data = array(
                'name' => $package_name,
                'catigory_id' => 9,
                'lab_id' => $labId,
                'hash' => $hash,
            );
            $this->db->insert('lab_package', $package_data);

            // Create a package test
            $package_tests_data = array(
                'package_id' => $hash,
                'test_id' => $package_hash,
                'unit' => $package['unit'],
                'lab_id' => $labId,
            );
            $this->db->insert('lab_pakage_tests', $package_tests_data);
        }
        return $packages;
    }

    function updateCostAndPrice($cost, $price, $hash)
    {
        $lastCost = $this->db->query("SELECT cost FROM lab_package WHERE hash='$hash'");
        $lastCost = $lastCost->result_array();
        $this->db->set('cost', $cost);
        $this->db->set('price', $price);
        $this->db->where('hash', $hash);
        $this->db->update('lab_package');
    }

    function getKitsByTestName($testName, $testHash)
    {
        // $kits = $this->db->query(
        //     "SELECT  
        //         CASE
        //             WHEN JSON_UNQUOTE(JSON_EXTRACT(x.value, '$.kit'))='' THEN 'No Kit'
        //             ELSE name
        //         END AS name,
        //         CASE
        //             WHEN JSON_UNQUOTE(JSON_EXTRACT(x.value, '$.kit'))='' THEN ''
        //             ELSE kits.id
        //         END AS kit_id
        //     FROM lab_test
        //     JOIN JSON_TABLE(option_test,'$.component[*].reference[*]' COLUMNS (value JSON PATH '$')) x
        //     left JOIN kits ON JSON_UNQUOTE(JSON_EXTRACT(x.value, '$.kit')) = kits.id
        //     WHERE test_name = '$testName' or lab_test.hash='$testHash';"
        // );
        $kits = $this->db->query(
            "select name,id as kit_id from kits"
        );
        return $kits->result_array();
    }

    function getUnitsByTestName($testName, $testHash)
    {
        // $units = $this->db->query(
        //     "SELECT  
        //     CASE
        //         WHEN JSON_UNQUOTE(JSON_EXTRACT(x.value, '$.unit')) is null or JSON_UNQUOTE(JSON_EXTRACT(x.value, '$.unit'))='' THEN 'No Unit'
        //         ELSE name
        //     END AS name,
        //     CASE
        //         WHEN JSON_UNQUOTE(JSON_EXTRACT(x.value, '$.unit')) is null or JSON_UNQUOTE(JSON_EXTRACT(x.value, '$.unit'))='' THEN '0'
        //         ELSE lab_test_units.hash
        //     END AS unit_id
        // FROM lab_test
        // JOIN JSON_TABLE(option_test,'$.component[*].reference[*]' COLUMNS (value JSON PATH '$')) x
        // left JOIN lab_test_units ON JSON_UNQUOTE(JSON_EXTRACT(x.value, '$.unit')) = lab_test_units.hash
        //     WHERE test_name = '$testName' or lab_test.hash='$testHash';"
        // );
        // return $units->result_array();
        $units = $this->db->query(
            "select name,hash as unit_id from lab_test_units"
        );
        return $units->result_array();
    }

    function addDefaultPackage($lab_hash)
    {
        $this->db->query(
            "SET SESSION group_concat_max_len = 100000;"
        );
        $defaultPackage = $this->db->select('CONCAT(\'{"cost":"\', lab_package.cost,  \'","price":"\', lab_package.price,,  \'","name":"\', lab_package.name,  \'", "tests": [\', GROUP_CONCAT(JSON_OBJECT(\'unit\', lab_pakage_tests.unit,\'test_id\',lab_pakage_tests.test_id,\'kit_id\',lab_pakage_tests.kit_id,\'lab_device_id\',lab_pakage_tests.lab_device_id)), \']}\' ) AS data')
            ->from('lab_package')
            ->join('lab_pakage_tests', 'lab_package.hash = lab_pakage_tests.package_id')
            ->where('lab_package.lab_id', '7290')
            ->where('lab_package.catigory_id', '8')
            ->group_by('lab_package.hash')
            ->get()
            ->result_array();
        // decode every row in the array and add it to the query
        foreach ($defaultPackage as $row) {
            $row = json_decode($row['data']);
            $hash = round(microtime(true) * 10000) . rand(0, 1000);
            $this->db->query("INSERT INTO lab_package(name, catigory_id, lab_id, hash, cost, price)VALUES ('$row->name', '8', '$lab_hash', '$hash', '$row->cost', '$row->price');");
            foreach ($row->tests as $test) {
                $this->db->query("INSERT INTO lab_pakage_tests(package_id, test_id, unit, kit_id, lab_device_id,lab_id)VALUES ('$hash', '$test->test_id', '$test->unit', '$test->kit_id', '$test->lab_device_id','$lab_hash');");
            }
        }
        return "تم اضافة الباكج الافتراضي بنجاح";
    }

    function createNewTest($data)
    {
        $test_id = $data['test_id'];
        $lab_id = $data['lab_id'];
        $kit_id = $data['kit_id'];
        $unit = $data['unit'];
        $lab_device_id = $data['lab_device_id'];
        $name = $data['name'];
        $cost = $data['cost'];
        $price = $data['price'];

        // check if test is already exists
        $test = $this->db->query("SELECT * FROM lab_pakage_tests WHERE test_id='$test_id' AND lab_device_id='$lab_device_id' AND kit_id='$kit_id' AND unit='$unit'");
        $test = $test->result_array();
        if (count($test) > 0) {
            return false;
        } else {
            // crerate new package 
            $hash = round(microtime(true) * 10000) . rand(0, 1000);
            $this->db->query("INSERT INTO lab_package(name, catigory_id, lab_id, hash, cost, price)VALUES ('$name', '9', '$lab_id', '$hash', '$cost', '$price');");
            // create new test
            $this->db->query("INSERT INTO lab_pakage_tests(package_id, test_id, unit, kit_id, lab_device_id,lab_id)VALUES ('$hash', '$test_id', '$unit', '$kit_id', '$lab_device_id','$lab_id');");

            // return last inserted row
            $package = $this->db->query("SELECT * FROM lab_package WHERE hash='$hash'");
            $package = $package->result_array();
            return $hash;
        }

    }
}