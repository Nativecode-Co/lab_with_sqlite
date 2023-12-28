<?php
class CodeType extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }

    public function records($search){
        $this->db->select('count(*) as count');
        $this->db->from('activation_code_type');
        $this->db->like('name', $search);
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
    }

    public function create($name, $dur){
        $hash = rand(1000000000000000, 9999999999999999);
        $this->db->query("INSERT INTO activation_code_type (name, dur,hash) VALUES ('$name', '$dur','$hash')");
        return $this->db->affected_rows();
    }

    public function update($hash, $data){
        $this->db->where('hash', $hash);
        $this->db->update('activation_code_type', $data);
        return $this->db->affected_rows();
    }

    public function delete($hash){
        $length = $this->db->query("SELECT count(*) as count FROM activation_code WHERE type='$hash'")->result_array();
        if($length[0]['count'] > 0){
            return -1;
        }
        $this->db->where('hash', $hash);
        $this->db->delete('activation_code_type');
        return $this->db->affected_rows();
    }

    public function get($hash){
        $this->db->select('name,dur,hash');
        $this->db->from('activation_code_type');
        $this->db->where('hash', $hash);
        $code = $this->db->get();
        return $code->result_array();
    }

    public function getAll($start, $length, $search){
        $this->db->select('name,dur,hash');
        $this->db->from('activation_code_type');
        $this->db->like('name', $search);
        $this->db->order_by('id', 'DESC');
        $this->db->limit($length, $start);
        $codes = $this->db->get();
        $codes = $codes->result_array();
        $length = $this->records($search);
        return array(
            "length" => $length,
            "codes" => $codes,
        );
    }
}
