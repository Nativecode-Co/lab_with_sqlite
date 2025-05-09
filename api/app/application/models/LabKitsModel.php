<?php
defined('BASEPATH') or exit('No direct script access allowed');

class LabKitsModel extends CI_Model
{
    private $table = 'lab_kits';
    private $main_column = 'hash';

    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->helper('db');


        $this->create_table();
    }

    private function create_table()
    {
        if (!$this->db->table_exists($this->table)) {
            $this->db->query("
                CREATE TABLE `lab_kits` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `kit` INT(11) NOT NULL,
                    `quantity` int(11) NOT NULL,
                    `purchase_price` decimal(10,2) NOT NULL,
                    `total_price` decimal(10,2) NOT NULL,
                    `note` text,
                    `lab_id` int(11) NOT NULL,
                    `date` date NOT NULL,
                    `status` varchar(50) NOT NULL,
                    `expiry_date` date,
                    `hash` bigint(20) NOT NULL,
                    `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
                    `created_at` datetime DEFAULT NULL,
                    `updated_at` datetime DEFAULT NULL,
                    PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
            ");
        }
    }

    public function count_all($params)
    {
        $searchText = $params['search']['value'];
        return $this->db
            ->select("$this->table.id")
            ->join('kits', 'kits.id = lab_kits.kit')
            ->where("$this->table.is_deleted", 0)
            ->like("kits.name", $searchText)
            ->count_all_results($this->table);
    }

    public function get_all($params)
    {
        $start = $params['start'];
        $rowsPerPage = $params['length'];
        $page = $start / $rowsPerPage;
        $searchText = $params['search']['value'];

        return $this->db
            ->select("$this->table.id, kits.name, $this->table.quantity, $this->table.purchase_price, $this->table.total_price, $this->table.note, $this->table.date, $this->table.status, $this->table.expiry_date, $this->table.hash")
            ->join('kits', 'kits.id = lab_kits.kit')
            ->where("$this->table.is_deleted", 0)
            ->like("kits.name", $searchText)
            ->order_by("$this->table.id", 'asc')
            ->get($this->table, $rowsPerPage, $page * $rowsPerPage)
            ->result();
    }

    public function get($hash)
    {
        $kit = $this->db
            ->select("$this->table.id,kit, $this->table.quantity, $this->table.purchase_price, $this->table.total_price, $this->table.note, $this->table.date, $this->table.status, $this->table.expiry_date, $this->table.hash")
            ->join('kits', 'kits.id = lab_kits.kit')
            ->where("$this->table.is_deleted", 0)
            ->where("$this->table.hash", $hash)
            ->get($this->table)
            ->row();
        return isset($kit->id) ? $kit : null;
    }

    public function insert($data)
    {
        $data['hash'] = create_hash();
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['updated_at'] = date('Y-m-d H:i:s');
        $this->db->insert($this->table, $data);
        return $this->get($data['hash']);
    }

    public function update($hash, $data)
    {
        $data['updated_at'] = date('Y-m-d H:i:s');
        $this->db
            ->where($this->main_column, $hash)
            ->update($this->table, $data);
        return $this->get($hash);
    }

    public function truncate()
    {
        $this->db->truncate($this->table);
    }

    public function delete($hash)
    {
        $this->db
            ->where($this->main_column, $hash)
            ->update($this->table, ['is_deleted' => 1]);
    }

    public function get_all_ids()
    {
        $ids = $this->db
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

    public function get_kits()
    {
        return $this->db->get('kits')->result();
    }
}
