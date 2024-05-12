<?php
class DataModel extends CI_Model
{
    function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function get_new_data($data)
    {
        $all = array();
        foreach ($data as $key => $value) {
            if (is_array($value) && count($value) > 0) {
                $selectedData = $this->db->where_not_in('id', $value)->get($key);
                if ($selectedData->num_rows() > 0) {
                    $all[$key] = $selectedData->result_array();
                }
            } else {
                $selectedData = $this->db->get($key);
                if ($selectedData->num_rows() > 0) {
                    $all[$key] = $selectedData->result_array();
                }
            }
        }
        return $all;
    }
}
