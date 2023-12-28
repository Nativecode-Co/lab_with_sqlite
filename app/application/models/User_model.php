<?php
class User_model extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }


    public function verify_user($username, $password)
    {
        $query = $this->db->get_where('system_users', array('username' => $username, 'password' => $password));
        return $query->row();
    }

    // get user count
    public function get_user_count()
    {
        $query = $this->db->get('system_users');
        return $query->num_rows();
    }

    // add user to database
    public function add_user($data)
    {
        $this->db->insert('system_users', $data);
        return $this->db->insert_id();
    }

    public function record_count($search)
    {
        $this->db->select('count(*) as count');
        $this->db->from('system_users');
        $this->db->where('user_type <>', '3');
        $this->db->where('is_deleted', '0');
        $this->db->like('name', $search);
        // $this->db->or_like('username', $search);

        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
    }

    function getUsers($start, $length, $search)
    {
        // like
        $this->db->select(
            'hash,name,username,password,
             (select name from system_group_name where hash=system_users.user_type) as user_type_name,
             user_type,
             (select name from lab where id=system_users.lab_id) as lab_name,
             lab_id'
        );
        // inner join 
        $this->db->from('system_users');
        // and
        $this->db->where('user_type <>', '3');
        $this->db->where('is_deleted', '0');
        // like
        $this->db->like('name', $search);
        // or
        // $this->db->or_like('username', $search);
        // order by
        $this->db->order_by('id', 'DESC');
        // limit
        $this->db->limit($start, $length);
        // get
        $query = $this->db->get();
        return $query->result_array();
    }

    function getUsersByLab($start, $length, $search, $hash)
    {
        // like
        $this->db->select(
            'hash,name,username,password,
             (select name from system_group_name where hash=system_users.user_type) as user_type_name,
             user_type,
             (select name from lab where id=system_users.lab_id) as lab_name,
             lab_id'
        );
        // inner join 
        $this->db->from('system_users');
        // and
        $this->db->where('user_type <>', '1');
        $this->db->where('user_type <>', '2');
        $this->db->where('user_type <>', '3');
        $this->db->where('lab_id', $hash);
        $this->db->where('is_deleted', '0');
        // like
        $this->db->like('name', $search);
        // or
        // $this->db->or_like('username', $search);
        // order by
        $this->db->order_by('id', 'DESC');
        // limit
        $this->db->limit($start, $length);
        // get
        $query = $this->db->get();
        return $query->result_array();
    }
}
