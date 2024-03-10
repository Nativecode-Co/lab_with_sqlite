<?php
class TestAliasModel extends CI_Model
{
    private $table = 'test_alias';
    private $main_column = 'id';

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->helper('db');
        if (!$this->db->table_exists($this->table)) {
            $this->db->query("CREATE TABLE `test_alias` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `test_hash` varchar(255) NOT NULL,
                `alias` varchar(255) NOT NULL,
                `type` varchar(255) NOT NULL,
                `device_id` varchar(255) NOT NULL,
                `isdeleted` tinyint(1) NOT NULL DEFAULT '0',
                PRIMARY KEY (`id`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");
        }
    }

    public function count_all($params)
    {
        $searchText = $params['search']['value'];
        return $this->db
            ->where('isdeleted', 0)
            ->like("alias", $searchText)
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
            ->select('test_alias.id, test_name as test, alias, type, device_id')
            ->join('lab_test', 'lab_test.hash = test_alias.test_hash')
            ->where('test_alias.isdeleted', 0)
            ->like("alias", $searchText)
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
        $this->db->insert($this->table, $data);
        $id = $this->db->insert_id();
        return $this->get($id);
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

    public function get_test_hash_by_alias($alias)
    {
        return $this->db
            ->select('test_hash')
            ->where('isdeleted', 0)
            ->where('alias', $alias)
            ->get($this->table)
            ->row()->test_hash;
    }

}