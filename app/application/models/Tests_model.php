<?php
class Tests_model extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }

    public function record_count($search)
    {
        $this->db->select('count(*) as count');
        $this->db->from('lab_test');
        $this->db->where('isdeleted', 0);
        $this->db->like('test_name', $search);
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
    }

    public function record_count_for_lab($search, $lab_id)
    {
        $devices = $this->getDevicesForLab($lab_id);
        $kits = $this->getKitsForLab($devices);
        $kits = implode(',', $kits);
        $query = $this->db->query("
        SELECT 
        lab_test.id
        FROM 
            lab_pakage_tests
        LEFT JOIN lab_test ON lab_test.hash = lab_pakage_tests.test_id
        WHERE 
            test_name LIKE '%$search%' AND
            lab_pakage_tests.isdeleted = 0
        GROUP BY
            lab_test.hash
        ");
        $result = $query->result_array();
        return count($result);
    }

    public function record_count_calc($search)
    {
        $this->db->select('count(*) as count');
        $this->db->from('lab_test');
        $this->db->where('isdeleted', 0);
        $this->db->where('test_type', 3);
        $this->db->like('test_name', $search);
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
    }

    function getTests($start, $length, $search)
    {
        // like
        $this->db->select(
            'test_name,category_hash,(select name from lab_test_catigory where hash=lab_test.category_hash) as category_name,hash,option_test'
        );
        // inner join 
        $this->db->from('lab_test');
        // and
        $this->db->where('isdeleted', 0);
        // like
        $this->db->like('test_name', $search);
        // order by
        $this->db->order_by('id', 'DESC');
        // limit
        $this->db->limit($start, $length);
        // get
        $query = $this->db->get();
        return $query->result_array();
    }

    function getTestsForLab($start, $length, $search, $lab_id)
    {
        $devices = $this->getDevicesForLab($lab_id);
        $kits = $this->getKitsForLab($devices);
        $kits = implode(',', $kits);
        $set_full = $this->db->query("SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));");
        $query = $this->db->query(
            "
            SELECT
                lab_test.hash,
                lab_test.test_name,
                category_hash,
                (SELECT name FROM lab_test_catigory WHERE hash = lab_test.category_hash) AS category_name,
                lab_test.option_test
            FROM 
                lab_pakage_tests
            LEFT JOIN lab_test ON lab_test.hash = lab_pakage_tests.test_id
            WHERE 
                test_name LIKE '%$search%' AND
                lab_pakage_tests.isdeleted = 0 
            GROUP BY
                lab_test.hash
            ORDER BY
                lab_test.id DESC
            LIMIT $length , $start
        "
        );
        return $query->result_array();
        // AND
        // (
        //     lab_pakage_tests.lab_id = $lab_id 
        // ) 
    }

    public function getDevicesForLab($lab_id)
    {
        $this->db->select('devices_id');
        $this->db->from('lab_device');
        $this->db->where('is_deleted', 0);
        $this->db->where('lab_id', $lab_id);
        $query = $this->db->get();
        // get array of devices
        $devices = $query->result_array();
        // map devices to array
        $devices = array_map(function ($device) {
            return $device['devices_id'];
        }, $devices);
        return $devices;
    }

    public function getKitsForLab($devices)
    {
        $this->db->select('kit_id');
        $this->db->from('device_kit');
        $this->db->where('is_deleted', 0);
        // check if devices is not empty
        if (count($devices) > 0) {
            $this->db->where_in('device_id', $devices);
        }
        $query = $this->db->get();
        // get array of devices
        $kits = $query->result_array();
        // map devices to array
        $kits = array_map(function ($kit) {
            return $kit['kit_id'];
        }, $kits);
        return $kits;
    }


    function getCalcTests($start, $length, $search)
    {
        $this->db->select('hash,test_name,category_hash,');
        $this->db->from('lab_test');
        $this->db->where('isdeleted', 0);
        $this->db->where('test_type', 3);
        // like
        $this->db->like('test_name', $search);
        // order by
        $this->db->order_by('id', 'DESC');
        // limit
        $this->db->limit($start, $length);
        // get
        $query = $this->db->get();
        return $query->result_array();
    }

    function getVistsByTest($lab, $test, $start, $length, $search, $dector, $start_date, $end_date)
    {
        if ($dector == '') {
            $doctor = '';
        } else {
            $doctor = "and lab_doctor.hash = '$dector'";
        }
        if ($start_date == '') {
            $start_date = '';
        } else {
            $start_date = "and visit_date >= '$start_date'";
        }
        if ($end_date == '') {
            $end_date = '';
        } else {
            $end_date = "and visit_date <= '$end_date'";
        }
        $query = $this->db->query("
        SELECT 
            lab_patient.name as name,
            lab_doctor.name as doctor,
            lab_visits.hash,
            visit_date,
            tests_id,
            lab_package.price,
            lab_package.cost
        FROM lab_visits_tests
        inner join lab_visits on lab_visits.hash = lab_visits_tests.visit_id
        left join lab_doctor on lab_doctor.hash = lab_visits.doctor_hash
        left join lab_patient on lab_patient.hash = lab_visits.visits_patient_id
        left join lab_package on lab_package.hash = lab_visits_tests.package_id
        where tests_id='$test' and lab_visits_tests.lab_id='$lab'
        and (lab_patient.name like '%$search%' or visit_date like '%$search%' or lab_doctor.name like '%$search%')
        $start_date $end_date $doctor
        and lab_visits.isdeleted = 0
        group by lab_visits.hash,tests_id
        order by lab_visits.id desc
        limit $start,$length
        ");
        $count = $this->db->query("
        SELECT 
            count(*) as count,
            sum(lab_package.price) as price,
            sum(lab_package.cost) as cost
        FROM lab_visits_tests
        inner join lab_visits on lab_visits.hash = lab_visits_tests.visit_id
        left join lab_doctor on lab_doctor.hash = lab_visits.doctor_hash
        left join lab_patient on lab_patient.hash = lab_visits.visits_patient_id
        left join lab_package on lab_package.hash = lab_visits_tests.package_id

        where tests_id='$test' and lab_visits_tests.lab_id='$lab'
        and (lab_patient.name like '%$search%' or visit_date like '%$search%' or lab_doctor.name like '%$search%')
        $start_date $end_date $doctor

        and lab_visits.isdeleted = 0
        
        order by lab_visits.id desc
        ");
        // get only one row
        $count = $count->result_array();
        if (count($count) > 0) {
            return array(
                'count' => $count[0]['count'],
                'data' => $query->result_array(),
                'price' => $count[0]['price'],
                'cost' => $count[0]['cost']
            );
        } else {
            return array(
                'count' => 0,
                'data' => []
            );
        }
    }

    public function getVisitsByTests($lab, $tests, $doctor, $start_date, $end_date)
    {
        if ($doctor == '') {
            $doctor = '';
        } else {
            $doctor = "and lab_doctor.hash = '$doctor'";
        }
        if ($lab == '') {
            $lab = '';
        } else {
            $lab = "and lab_visits_tests.lab_id = '$lab'";
        }

        if ($start_date == '') {
            $start_date = '';
        } else {
            $start_date = "and visit_date >= '$start_date'";
        }
        if ($end_date == '') {
            $end_date = '';
        } else {
            $end_date = "and visit_date <= '$end_date'";
        }
        $query = $this->db->query("
        SELECT 
            (select test_name from lab_test where lab_test.hash = tests_id) as test_name,
            count(*) as count,
            sum(lab_package.price) as price,
            sum(lab_package.cost) as cost
        FROM lab_visits_tests
        inner join lab_visits on lab_visits.hash = lab_visits_tests.visit_id
        left join lab_doctor on lab_doctor.hash = lab_visits.doctor_hash
        left join lab_patient on lab_patient.hash = lab_visits.visits_patient_id
        left join lab_package on lab_package.hash = lab_visits_tests.package_id

        where tests_id in ($tests) $lab
        $start_date $end_date $doctor
        and lab_visits.isdeleted = 0
        group by tests_id
        order by lab_visits.id desc");
        // get all rows
        $result = $query->result_array();
        return $result;
    }
}