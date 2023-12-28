<?php
class Visit_model extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
        $this->load->library('migration');
    }

    public function record_count($search, $current = 0)
    {
        if ($this->migration->latest() === FALSE) {
        }
        $this->db->select('count(*) as count');
        $this->db->from('lab_visits');
        $this->db->like('lab_visits.name', $search);
        $lab_id = $this->input->post('lab_id');
        // inner join
        $this->db->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id');
        // where
        $this->db->where('lab_patient.lab_id', $lab_id);
        $this->db->where('lab_visits.isdeleted', '0');
        if ($current == 1) {
            $this->db->where('lab_visits.visit_date >=', date('Y-m-d'));
        }
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
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
        // get
        $query = $this->db->get();
        return $query->result_array();
    }


    public function patient_history($patient_id, $visit_date)
    {
        // $visits = $this->get_patient_visits($patient_id, $visit_date);
        // if (!isset($visits[0]))
        //     return [];
        // $last_visit_tests = $this->last_patient_visit_tests($patient_id);
        // if (!isset($last_visit_tests[0]))
        //     return [];
        $tests = $this->get_tests($patient_id, $visit_date);
        if (!isset($tests[0]))
            return [];
        // map tests
        $tests = array_map(function ($test) {
            // decode result
            $result = json_decode($test['result'], true);
            if (isset($result[$test['name']])) {
                $result = $result[$test['name']];
                if (!isset($result) || $result == "") {
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
            visit_id = (SELECT 
                    hash
                FROM
                    lab_visits
                WHERE
                    visits_patient_id = '$patient_id'
                        AND isdeleted = 0
                        AND visit_date < '$visit_date'
                ORDER BY id DESC
                LIMIT 1)
                AND tests_id != 0;
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
}