<?php
class Patient_model extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }

    public function record_count_for_lab($search)
    {
        $this->db->select('count(*) as count');
        $this->db->from('lab_patient');
        $this->db->where('lab_id', $this->input->post('lab_id'));
        $this->db->where('isdeleted', 0);
        $this->db->like('name', $search);
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
    }

    function getPatientForLAb($labID, $start, $length, $search)
    {
        // like
        $this->db->select(
            'hash,birth,name,gender,birth,address,phone'
        );
        // inner join 
        $this->db->from('lab_patient');
        // where
        $this->db->where('lab_id', $labID);
        // and
        $this->db->where('isdeleted', 0);
        // like
        $this->db->like('name', $search);
        // order by
        $this->db->order_by('id', 'DESC');
        // limit
        $this->db->limit($start, $length);
        // get
        $query = $this->db->get();
        return $query->result_array();
    }

    function updateName($name, $hash)
    {
        $this->db->where('hash', $hash);
        $this->db->update('lab_patient', array('name' => $name));
        return $this->db->affected_rows();
    }
}
