<?php
class VisitTestModal extends CI_Model
{
    private $table = 'lab_visits_tests';

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->helper('db');
    }

    public function count_all($params)
    {
        $searchText = $params['search']['value'];
        $tests = $params['tests'] == '' ? 0 : $params['tests'];
        $doctor = $params['doctor'] ? "AND `lab_doctor`.`hash` = '$params[doctor]'" : "";
        $start_date = $params['start_date'] ? "AND `visit_date` >= '$params[start_date]'" : "";
        $end_date = $params['end_date'] ? "AND `visit_date` <= '$params[end_date]'" : "";
        // get count 
        $result = $this->db->query("SELECT count(*) as count
            FROM `lab_visits_tests`
            INNER JOIN `lab_visits` ON `lab_visits`.`hash` = `lab_visits_tests`.`visit_id`
            LEFT JOIN `lab_doctor` ON `lab_doctor`.`hash` = `lab_visits`.`doctor_hash`
            LEFT JOIN `lab_patient` ON `lab_patient`.`hash` = `lab_visits`.`visits_patient_id`
            LEFT JOIN `lab_package` ON `lab_package`.`hash` = `lab_visits_tests`.`package_id`
            where tests_id in ($tests) 
        $start_date $end_date $doctor
        and lab_visits.isdeleted = 0
        group by tests_id,doctor_hash
        order by lab_visits.id desc");
        return $result->num_rows();
    }

    public function get_all($params)
    {
        $start = $params['start'];
        $rowsPerPage = $params['length'];
        $orderBy = $params['order'][0]['column'];
        $orderBy = $params['columns'][$orderBy]['data'];
        $order = $params['order'][0]['dir'];
        $searchText = $params['search']['value'];
        $tests = $params['tests'] == '' ? 0 : $params['tests'];
        $doctor = $params['doctor'] ? "AND `lab_doctor`.`hash` = '$params[doctor]'" : "";
        $start_date = $params['start_date'] ? "AND `visit_date` >= '$params[start_date]'" : "";
        $end_date = $params['end_date'] ? "AND `visit_date` <= '$params[end_date]'" : "";
        $result =  $this->db->query("
        SELECT 
            (select test_name from lab_test where lab_test.hash = tests_id) as test_name,
            count(*) as count,
            lab_doctor.name as doctor_name,
            sum(lab_package.price) as price,
            sum(lab_package.cost) as cost
        FROM lab_visits_tests
        inner join lab_visits on lab_visits.hash = lab_visits_tests.visit_id
        left join lab_doctor on lab_doctor.hash = lab_visits.doctor_hash
        left join lab_patient on lab_patient.hash = lab_visits.visits_patient_id
        left join lab_package on lab_package.hash = lab_visits_tests.package_id

        where tests_id in ($tests) 
        $start_date $end_date $doctor
        and lab_visits.isdeleted = 0
        group by tests_id,doctor_hash
        order by lab_visits.id desc
        limit $start, $rowsPerPage
        ");

        return $result->result();
    }

    public function insert_batch_package($data)
    {
        // chunk data
        $data = array_chunk($data, 1000);
        foreach ($data as $key => $value) {
            $this->db->insert_batch('lab_visits_package', $value);
        }
    }

    public function insert_batch($data)
    {
        if (empty($data)) {
            return;
        }
        // chunk data
        $data = array_chunk($data, 1000);
        foreach ($data as $key => $value) {
            $this->db->insert_batch($this->table, $value);
        }
    }
}
