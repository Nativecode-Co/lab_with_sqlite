<?php
class PatientModel extends CI_Model
{
    private $table = 'lab_patient';
    private $main_column = 'hash';

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->helper('db');
    }

    public function count_all($params)
    {
        $searchText = $params['search']['value'];
        $startDate = $params['startDate'] ?? date('Y-m-d', strtotime('-1 month'));
        $endDate = $params['endDate'] ?? date('Y-m-d');
        return $this->db
            ->join('lab_visits', 'lab_patient.hash = lab_visits.visits_patient_id', 'left')
            ->where('lab_patient.isdeleted', 0)
            ->where('visit_date >=', $startDate)
            ->where('visit_date <=', $endDate)
            ->like("lab_patient.name", $searchText)
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
        $startDate = $params['startDate'] ?? date('Y-m-d', strtotime('-1 month'));
        $endDate = $params['endDate'] ?? date('Y-m-d');
        return $this->db
            ->select('lab_patient.*, visit_date')
            ->join('lab_visits', 'lab_patient.hash = lab_visits.visits_patient_id', 'left')
            ->where('lab_patient.isdeleted', 0)
            // filter with start date and end date
            ->where('visit_date >=', $startDate)
            ->where('visit_date <=', $endDate)
            ->like("lab_patient.name", $searchText)

            ->order_by($orderBy, $order)
            ->group_by('lab_patient.hash')
            ->get($this->table, $rowsPerPage, $page * $rowsPerPage)
            ->result();
    }

    public function get($hash)
    {
        return $this->db
            ->where('isdeleted', 0)
            ->where($this->main_column, $hash)
            ->get($this->table)
            ->row();
    }

    public function insert($data)
    {
        $data['hash'] = create_hash();
        $this->db->insert($this->table, $data);
        return $data['hash'];
    }

    public function update($hash, $data)
    {
        $this->db
            ->where($this->main_column, $hash)
            ->update($this->table, $data);
    }

    public function delete($hash)
    {
        $this->db
            ->where($this->main_column, $hash)
            ->update($this->table, ['isdeleted' => 1]);
    }

    public function patientIsExist($data)
    {
        $patient = $this->db
            ->select('name,hash')
            ->where('isdeleted', 0)
            ->where($data)
            ->get($this->table)
            ->row();
        return array(
            "isExist" => $patient != null,
            "hash" => $patient != null ? $patient->hash : null
        );
    }

    public function get_patient_visits($hash)
    {
        return $this->db
            ->select('
                (select name from lab_doctor where hash=lab_visits.doctor_hash) as doctor_name,
                net_price, visit_date, dicount,hash
            ')
            ->where('visits_patient_id', $hash)
            ->where('isdeleted', 0)
            ->order_by('visit_date', 'desc')
            ->get('lab_visits')
            ->result();
    }

    /**
     * Filter array to include only columns that exist in the table
     * 
     * @param array $data Data to be filtered
     * @return array Filtered data
     */
    private function filter_columns($data)
    {
        // Get table fields
        $fields = $this->db->list_fields($this->table);
        
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

    public function insert_batch($data)
    {
        if (empty($data)) {
            return;
        }
        
        // Filter out columns that don't exist in the table
        $filtered_data = $this->filter_columns($data);
        
        $data = array_chunk($filtered_data, 1000);
        foreach ($data as $key => $value) {
            $this->db->insert_batch($this->table, $value);
        }
    }
}
