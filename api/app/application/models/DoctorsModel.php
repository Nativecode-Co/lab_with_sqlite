<?php
class DoctorsModel extends CI_Model
{
    private $table = 'lab_doctor';
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
            ->select('*')
            ->select('(SELECT name FROM lab_doctor_partment WHERE hash = lab_doctor.partmen_hash limit 1) as partment_name')
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
        $this->db->insert("system_put_role_to_users", [
            "group_hash" => $data['group_hash'],
            "user_hash" => $data['hash']
        ]);
        $this->db->insert($this->table, $data);
        return $this->get($data['hash']);
    }

    public function update($hash, $data)
    {
        // check if the user is in the group if not add him else update
        $this->db->where('user_hash', $hash);
        $this->db->where('group_hash', $data['group_hash']);
        $count = $this->db->count_all_results("system_put_role_to_users");
        if ($count == 0) {
            $this->db->insert("system_put_role_to_users", [
                "group_hash" => $data['group_hash'],
                "user_hash" => $hash
            ]);
        } else {
            $this->db->where('user_hash', $hash);
            $this->db->where('group_hash', $data['group_hash']);
            $this->db->update("system_put_role_to_users", [
                "group_hash" => $data['group_hash'],
                "user_hash" => $hash
            ]);
        }
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

    public function get_partments()
    {
        return $this->db
            ->select('hash, name as text')
            ->where('isdeleted', 0)
            ->get('lab_doctor_partment')
            ->result();
    }

}