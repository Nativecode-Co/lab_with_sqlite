<?php
class WorkersModel extends CI_Model
{
    private $table = 'lab_invoice_worker';
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
            ->where('isdeleted', 0)
            ->like("name", $searchText)
            ->order_by($orderBy, $order)
            ->get($this->table, $rowsPerPage, $page * $rowsPerPage)
            ->result();
    }

    public function getVisibleWorkers()
    {
        $defaultworkers = array(
            array(
                "hash" => "logo"
            ),
            array(
                "hash" => "name"
            ),
        );
        $workers = $this->db->select('name, jop, jop_en,hash')
            ->from('lab_invoice_worker')
            ->where('isdeleted', '0')
            ->where('is_available', '1')
            ->get()
            ->result_array();
        return array_merge($defaultworkers, $workers);
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
        return $this->get($data['hash']);
    }

    public function update($hash, $data)
    {
        $this->db
            ->where($this->main_column, $hash)
            ->update($this->table, $data);
        return $this->get($hash);
    }

    public function delete($hash)
    {
        $this->db
            ->where($this->main_column, $hash)
            ->update($this->table, ['isdeleted' => 1]);
    }

    public function insert_batch($data)
    {
        $this->db->insert_batch($this->table, $data);
    }
}
