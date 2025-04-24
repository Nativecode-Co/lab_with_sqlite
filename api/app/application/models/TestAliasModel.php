<?php
class TestAliasModel extends CI_Model
{
    private $table = 'test_alias';
    private $main_column = 'id';

    function __construct()
    {
        parent::__construct();
        $this->load->database();
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
        $searchText = $params['search']['value'];

        return $this->db
            ->select('test_alias.id, test_name as test,devices.name as device, alias, test_alias.type, device_id')
            ->join('lab_test', 'lab_test.hash = test_alias.test_hash and lab_test.lab_hash is null', 'left')
            ->join('devices', 'devices.id = test_alias.device_id', 'left')
            ->where('test_alias.isdeleted', 0)
            ->like("alias", $searchText)
            ->order_by('id', 'desc')
            ->get($this->table, $rowsPerPage, $page * $rowsPerPage)
            ->result();
    }

    public function get_all_alias()
    {
        return $this->db
            ->where('isdeleted', 0)
            ->get($this->table)
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

    public function insert_all($data)
    {
        $this->truncate();
        $this->db->insert_batch($this->table, $data);
    }


    public function update($hash, $data)
    {
        $this->db
            ->where($this->main_column, $hash)
            ->update($this->table, $data);
        return $this->get($hash);
    }

    // trancate table 
    public function truncate()
    {
        $this->db->truncate($this->table);
    }

    public function delete($hash)
    {
        $this->db
            ->where($this->main_column, $hash)
            ->update($this->table, ['isdeleted' => 1]);
    }

    public function get_test_hash_by_alias($alias)
    {
        $test = $this->db
            ->select('test_hash')
            ->where('isdeleted', 0)
            ->where('alias', $alias)
            ->get($this->table)
            ->row();
        if ($test) {
            return $test->test_hash;
        } else {
            return null;
        }
    }

    public function get_tests()
    {
        $tests = $this->db
            ->select('hash,test_name as text')
            ->where('isdeleted', 0)
            ->where('lab_hash', null)
            ->order_by('test_name', 'asc')
            ->get('lab_test')
            ->result();
        return $tests;
    }

    public function get_devices()
    {
        $devices = $this->db
            ->select('id as hash, name as text')
            ->get('devices')
            ->result();
        return $devices;
    }

    public function get_all_ids()
    {
        $ids =  $this->db
            ->select('id')
            ->get($this->table)
            ->result();
        return array_map(function ($id) {
            return $id->id;
        }, $ids);
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
        
        $this->db->insert_batch($this->table, $filtered_data);
    }
}
