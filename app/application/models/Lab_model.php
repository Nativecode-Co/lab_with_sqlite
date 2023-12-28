<?php
class Lab_model extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }

    function searchLab($length = 10, $search = '')
    {
        $this->db->select('name,id,owner,(select name from region where region.id=lab.region_id) as region');
        $this->db->from('lab');
        $this->db->like('name', $search);
        $this->db->or_like('owner', $search);
        $this->db->limit($length);
        $query = $this->db->get();
        return $query->result_array();
    }
}
