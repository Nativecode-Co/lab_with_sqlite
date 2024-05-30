<?php
class TestNotModal extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->createTable();
    }

    public function createTable()
    {
        if (!$this->db->table_exists("testNotification")) {
            // Create the table directly
            $this->db->query("CREATE TABLE `testNotification` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `message` varchar(1000) NULL,
                `activated` tinyint(1) NOT NULL DEFAULT '1',
                `visit_hash` varchar(100) NULL,
                `created_at` timestamp NOT NULL,
                `updated_at` timestamp NOT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");
        } else {
            // If the table exists, discard the tablespace (this will be an unusual scenario)
            try {
                $this->db->query("ALTER TABLE `testNotification` DISCARD TABLESPACE;");
            } catch (Exception $e) {
                // Log or handle the exception if needed
            }
        }
    }

    public function insert($data)
    {
        $this->db->insert('testNotification', $data);
        return $this->db->insert_id();
    }

    public function deleteActivated()
    {
        $this->db->where('activated', 1);
        $this->db->delete('testNotification');
        return $this->db->affected_rows();
    }

    public function getActivated()
    {
        $data =  $this->db
            ->where('activated', 1)
            ->limit(1)->order_by('id', 'DESC')
            ->get('testNotification')
            ->row_array();
        $this->deleteActivated();
        return $data;
    }
}
