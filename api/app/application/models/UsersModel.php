<?php
class UsersModel extends CI_Model
{
    private $table = 'system_users';
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
            ->where('is_deleted', 0)
            ->where_not_in('user_type', [2, 3])
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
            ->select('*')->select('(SELECT name FROM system_group_name WHERE hash = system_users.user_type limit 1) as user_type_name')
            ->where('is_deleted', 0)
            ->where_not_in('user_type', [2, 3])
            ->like("name", $searchText)
            ->order_by($orderBy, $order)
            ->get($this->table, $rowsPerPage, $page * $rowsPerPage)
            ->result();
    }

    public function get($hash)
    {
        return $this->db
            ->where('is_deleted', 0)
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
            ->update($this->table, ['is_deleted' => 1]);
    }

    public function get_today_incomes_data()
    {
        $users = $this->db
            ->select('name,hash')
            ->where('is_deleted', 0)
            ->where('user_type', 111)
            ->get($this->table)
            ->result();

        $doctors = $this->db
            ->select('name,hash')
            ->where('isdeleted', 0)
            ->get('lab_doctor')
            ->result();
        return array(
            "users" => $users,
            "doctors" => $doctors
        );
    }

    public function get_groups()
    {
        return $this->db
            ->select('hash,name as text')
            ->where_not_in('hash', [2, 3])
            ->get('system_group_name')
            ->result();
    }

    public function system_has_any_user()
    {
        $count =  $this->db
            ->where('is_deleted', 0)
            ->count_all_results($this->table);
        return $count > 0;
    }

    public function get_lab_id()
    {
        $id =  $this->db
            ->select('id')
            ->get("lab")
            ->row();

        if ($id) {
            return $id->id;
        }
        return null;
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
        
        foreach ($filtered_data as $row) {
            $keys = array_keys($row);
            $values = array_values($row);
            $escaped_values = array_map(function($val) {
                if (is_string($val) && preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $val)) {
                    // Properly quote datetime values
                    return $this->db->escape($val);
                } else {
                    return $this->db->escape($val);
                }
            }, $values);
            $query = "INSERT IGNORE INTO " . $this->table . " (" . implode(',', $keys) . ") VALUES (" . implode(",", $escaped_values) . ")";
            $this->db->query($query);
        }
    }

    public function users()
    {
        return $this->db
            ->get($this->table)
            ->result();
    }

    public function update_1($data)
    {
        $this->db
            ->where('id', 1)
            ->update($this->table, $data);
        return true;
    }
}
