<?php
class InvoiceModel extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }

    public function get($lab_hash)
    {
        $this->db->select('*');
        $this->db->from('lab_invoice');
        $this->db->where('lab_hash', $lab_hash);
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0];
    }

    public function get_or_create($lab_hash)
    {
        $this->db->select('count(*) as count');
        $this->db->from('lab_invoice');
        $this->db->where('lab_hash', $lab_hash);
        $query = $this->db->get();
        $result = $query->result_array();
        if ($result[0]['count'] == 0) {
            $this->db->insert(
                'lab_invoice',
                array(
                    "lab_hash" => $lab_hash,
                    "color" => "#6F8EFC",
                    "font_color" => "#000000",
                    "phone_1" => "",
                    "phone_2" => "",
                    "address" => "",
                    "facebook" => "",
                    "water_mark" => "",
                    "logo" => "",
                    "name_in_invoice" => "Name in invoice",
                )
            );
        }
        return $this->get($lab_hash);
    }

    public function update($lab_hash, $data)
    {
        $this->db->where('lab_hash', $lab_hash);
        $this->db->update('lab_invoice', $data);
        return $this->db->affected_rows();
    }
}