<?php
class VisitTestModal extends CI_Model
{
    private $table = 'lab_visits_tests';
    private $main_column = 'hash';

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->helper('db');
    }

    public function count_all($params)
    {
        // get count 
        $this->db
            ->select('(select test_name from lab_test where lab_test.hash = tests_id) as test_name')
            ->select('count(*) as count')
            ->select('sum(lab_package.price) as price')
            ->select('sum(lab_package.cost) as cost')
            ->from($this->table)
            ->join('lab_visits', 'lab_visits.hash = lab_visits_tests.visit_id', 'inner')
            ->join('lab_doctor', 'lab_doctor.hash = lab_visits.doctor_hash', 'left')
            ->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id', 'left')
            ->join('lab_package', 'lab_package.hash = lab_visits_tests.package_id', 'left')
            ->where('tests_id in', $params['tests'])
            ->where('lab_visits.isdeleted', 0)
            ->like('lab_patient.name', $searchText)
            ->or_like('visit_date', $searchText)
            ->or_like('lab_doctor.name', $searchText)
            ->group_by('tests_id')
            ->order_by('lab_visits.id', 'desc')
            // get count
            ->get();
            
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
        return $this->db
            ->select('(select test_name from lab_test where lab_test.hash = tests_id) as test_name')
            ->select('count(*) as count')
            ->select('sum(lab_package.price) as price')
            ->select('sum(lab_package.cost) as cost')
            ->from($this->table)
            ->join('lab_visits', 'lab_visits.hash = lab_visits_tests.visit_id', 'inner')
            ->join('lab_doctor', 'lab_doctor.hash = lab_visits.doctor_hash', 'left')
            ->join('lab_patient', 'lab_patient.hash = lab_visits.visits_patient_id', 'left')
            ->join('lab_package', 'lab_package.hash = lab_visits_tests.package_id', 'left')
            ->where('tests_id in', $params['tests'])
            ->where('lab_visits.isdeleted', 0)
            ->like('lab_patient.name', $searchText)
            ->or_like('visit_date', $searchText)
            ->or_like('lab_doctor.name', $searchText)
            ->group_by('tests_id')
            ->order_by('lab_visits.id', 'desc')
            ->limit($rowsPerPage, $page)
            ->get()
            ->result_array();
    }
}


