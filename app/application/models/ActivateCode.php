<?php
class ActivateCode extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }


    public function active($lab, $code)
    {
        $check = $this->check($code);
        if ($check) {
            $this->insert($code, $lab);
            $this->db->where('number', $code);
            $this->db->update(
                'activation_code',
                array(
                    'status' => 1,
                )
            );
            return $this->db->affected_rows();
        } else {
            return false;
        }
    }

    public function check($code)
    {
        $this->db->select('count(*) as count');
        $this->db->from('activation_code');
        $this->db->where('number', $code);
        $this->db->where('status', 0);
        $query = $this->db->get();
        $result = $query->result_array();
        $count_of_codes = $result[0]['count'];
        // get count of codes used by
        $this->db->select('count(*) as count');
        $this->db->from('activation_code_used_by');
        $this->db->where('code_number', $code);
        $query = $this->db->get();
        $result = $query->result_array();
        $count_of_codes_used_by = $result[0]['count'];
        if ($count_of_codes >= 0 && !$count_of_codes_used_by) {
            return true;
        } else {
            return false;
        }
    }

    public function insert($code, $lab)
    {
        $this->db->insert(
            'activation_code_used_by',
            array(
                'code_number' => $code,
                'lab_hash' => $lab,
            )
        );
        return $this->db->affected_rows();
    }

}