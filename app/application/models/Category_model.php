<?php
class Category_model extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }

    public function record_count($search)
    {
        $this->db->select('count(*) as count');
        $this->db->from('lab_test_catigory');
        $this->db->where('isdeleted', 0);
        $this->db->like('name', $search);
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
    }

    function getCategory($start, $length, $search)
    {
        // like
        $this->db->select(
            'hash,name'
        );
        // inner join 
        $this->db->from('lab_test_catigory');
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
