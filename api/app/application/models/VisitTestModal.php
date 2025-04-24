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

    /**
     * Filter array to include only columns that exist in the table
     * 
     * @param array $data Data to be filtered
     * @param string $table Table name
     * @return array Filtered data
     */
    private function filter_columns($data, $table)
    {
        // Get table fields
        $fields = $this->db->list_fields($table);
        
        // If data is a batch of rows
        if (isset($data[0]) && is_array($data[0])) {
            $filtered_data = [];
            foreach ($data as $row) {
                $filtered_row = [];
                foreach ($row as $key => $value) {
                    if (in_array($key, $fields)) {
                        $filtered_row[$key] = $value;
                    }
                }
                $filtered_data[] = $filtered_row;
            }
            return $filtered_data;
        } else {
            // If data is a single record
            $filtered_data = [];
            foreach ($data as $key => $value) {
                if (in_array($key, $fields)) {
                    $filtered_data[$key] = $value;
                }
            }
            return $filtered_data;
        }
    }

    public function insert_batch_package($data)
    {
        // Filter out columns that don't exist in the table
        $filtered_data = $this->filter_columns($data, 'lab_visits_package');
        
        // chunk data
        $data = array_chunk($filtered_data, 1000);
        foreach ($data as $key => $value) {
            $this->db->insert_batch('lab_visits_package', $value);
        }
    }

    public function insert_batch($data)
    {
        if (empty($data)) {
            return;
        }
        
        // Filter out columns that don't exist in the table
        $filtered_data = $this->filter_columns($data, 'lab_visits_tests');
        
        $this->db->insert_batch('lab_visits_tests', $filtered_data);
    }
}
