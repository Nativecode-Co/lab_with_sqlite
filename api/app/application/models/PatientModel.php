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
        return $this->db
            ->where('isdeleted', 0)
            ->like("name", $searchText)
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
        return $this->db
            ->select('lab_patient.*, visit_date')
            ->join('lab_visits', 'lab_patient.hash = lab_visits.visits_patient_id', 'left')
            ->where('lab_patient.isdeleted', 0)
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

}