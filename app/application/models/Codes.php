<?php
class Codes extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }

    public function records($search, $status, $type, $customer, $date)
    {
        $this->db->select('count(*) as count');
        $this->db->from('activation_code');
        $this->db->like('number', $search);
        if ($status == 0 || $status == 1) {
            $this->db->where('status', $status);
        }
        if ($type != "") {
            $this->db->where('type', $type);
        }
        if ($customer != "") {
            $this->db->like('customer', $customer);
        }
        if ($date != "") {
            $this->db->where('date(date)', $date);
        }
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
    }

    public function createCodes($number, $type, $hash, $customer)
    {
        $codesNumber = $number;
        while ($number > 0) {
            $this->db->insert('activation_code', array(
                'type' => $type,
                'generated_by' => $hash,
                'customer' => $customer,
            ));
            $number--;
        }
        // get the last inserted codes limit by $codesNumber
        $this->db->select('number, type, status,date, (select name from system_users where hash=generated_by limit 1) as user');
        $this->db->from('activation_code');
        // limit
        $this->db->limit($codesNumber);
        $codes = $this->db->get();
        return $codes->result_array();
    }

    public function updateCode($number, $data)
    {
        $this->db->where('number', $number);
        $this->db->update('activation_code', $data);
        return $this->db->affected_rows();
    }

    public function deleteCode($number)
    {
        $this->db->where('number', $number);
        $this->db->delete('activation_code');
        return $this->db->affected_rows();
    }

    public function getCode($number)
    {
        $this->db->select('number, type, status,date, (select name from system_users where hash=generated_by limit 1) as user');
        $this->db->from('activation_code');
        $this->db->where('number', $number);
        $code = $this->db->get();
        return $code->result_array();
    }

    public function getCodes($start, $length, $search, $status, $type, $customer, $date)
    {
        $this->db->select('number, customer,(select name from activation_code_type where hash=activation_code.type) as type, status,date(date) as date, generated_by as user');
        $this->db->from('activation_code');
        $this->db->like('number', $search);
        if ($status == 0 || $status == 1) {
            $this->db->where('status', $status);
        }
        if ($type != "") {
            $this->db->where('type', $type);
        }
        if ($customer != "") {
            $this->db->like('customer', $customer);
        }
        if ($date != "") {
            $this->db->where('date(date)', $date);
        }
        $this->db->order_by('id', 'DESC');
        $this->db->limit($length, $start);
        $codes = $this->db->get();
        $codes = $codes->result_array();
        $length = $this->records($search, $status, $type, $customer, $date);
        return array(
            "length" => $length,
            "codes" => $codes,
        );
    }
}
