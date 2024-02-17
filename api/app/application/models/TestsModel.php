<?php
class TestsModel extends CI_Model
{
    private $table = 'lab_package';
    private $main_column = 'hash';

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->helper('db');
    }

    public function count_all($params, $catigory_id = 9)
    {
        $order = $params['order'];
        $orderBy = $params['orderBy'];
        $searchText = $params['searchText'];
        return $this->db

            ->where('isdeleted', 0)
            ->where('catigory_id', $catigory_id)
            ->like("name", $searchText)
            ->order_by($orderBy, $order)
            ->count_all_results($this->table);
    }

    public function get_all($params, $catigory_id = 9)
    {
        $page = $params['page'];
        $rowsPerPage = $params['rowsPerPage'];
        $order = $params['order'];
        $orderBy = $params['orderBy'];
        $searchText = $params['searchText'];

        $data = $this->db
            ->where('isdeleted', 0)
            ->where('catigory_id', $catigory_id)
            ->like("name", $searchText)
            ->order_by($orderBy, $order)
            ->get($this->table, $rowsPerPage, $page * $rowsPerPage)
            ->result();

        $total = $this->count_all($params, $catigory_id);
        return array("total" => $total, "data" => $data);
    }

    public function get($hash)
    {
        $data = $this->db
            ->where('isdeleted', 0)
            ->where($this->main_column, $hash)
            ->get($this->table)
            ->row();
        $data->tests = $this->get_package_tests($hash);
        return $data;
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

    public function get_package_tests($hash)
    {
        $data = $this->db
            ->select('test_id')
            ->where('isdeleted', 0)
            ->where('package_id', $hash)
            ->get('lab_pakage_tests')
            ->result();
        $data = array_map(function ($item) {
            return $item->test_id;
        }, $data);
        return $data;
    }

}