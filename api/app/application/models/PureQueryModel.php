<?php
class PureQueryModel extends CI_Model
{
    function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function query($query)
    {
       // check if query update or insert else return error
        if (strpos($query, 'UPDATE') !== false || strpos($query, 'INSERT') !== false || strpos($query, 'update') !== false || strpos($query, 'insert') !== false) {
            $result = $this->db->query($query);
            if ($result) {
                return array("message" => "Query executed successfully");
            } else {
                return array("message" => "Query execution failed");
            }
        }
        return array("message" => "Only SELECT queries are allowed");
    }

}