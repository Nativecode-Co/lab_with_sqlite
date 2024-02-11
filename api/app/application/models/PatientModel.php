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
        $order = $params['order'];
        $orderBy = $params['orderBy'];
        $searchText = $params['searchText'];
        return $this->db
            ->where('isdeleted', 0)
            ->like("name", $searchText)
            ->order_by($orderBy, $order)
            ->count_all_results($this->table);
    }

    public function get_all($params)
    {
        $page = $params['page'];
        $rowsPerPage = $params['rowsPerPage'];
        $order = $params['order'];
        $orderBy = $params['orderBy'];
        $searchText = $params['searchText'];
        return $this->db
            ->where('isdeleted', 0)
            ->like("name", $searchText)
            ->order_by($orderBy, $order)
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

}