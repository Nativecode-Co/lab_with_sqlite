<?php
class Doctor_model extends CI_Model
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
        $this->db->from('lab_doctor');
        $this->db->where('lab_id', $this->input->post('lab_id'));
        $this->db->where('isdeleted', 0);
        $this->db->like('name', $search);
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
    }

    function getDoctorForLAb($labID, $start, $length, $search)
    {
        // like
        $this->db->select(
            'hash,name,partmen_hash,commission,phone,(select name from lab_doctor_partment where hash=partmen_hash) as jop'
        );
        // inner join 
        $this->db->from('lab_doctor');
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
}
