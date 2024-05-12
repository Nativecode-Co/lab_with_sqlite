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
        die(json_decode($data));
    }
}
