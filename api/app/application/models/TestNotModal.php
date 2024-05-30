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
        if (!$this->db->table_exists("test_notification")) {
            // Create the table directly
            $this->db->query("CREATE TABLE `test_notification` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `message` varchar(1000) NULL,
                `activated` tinyint(1) NOT NULL DEFAULT '1',
                `created_at` timestamp NOT NULL,
                `updated_at` timestamp NOT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");
        } else {
            // If the table exists, discard the tablespace (this will be an unusual scenario)
            try {
                $this->db->query("ALTER TABLE `test_notification` DISCARD TABLESPACE;");
            } catch (Exception $e) {
                // Log or handle the exception if needed
            }
        }
    }

    public function insert($data)
    {
        $this->db->insert('test_notification', $data);
        return $this->db->insert_id();
    }

    public function deleteActivated()
    {
        $this->db->where('activated', 1);
        $this->db->delete('test_notification');
        return $this->db->affected_rows();
    }

    public function getActivated()
    {
        $data =  $this->db
            ->where('activated', 1)
            ->limit(1)->order_by('id', 'DESC')
            ->get('test_notification')
            ->row_array();
        $this->deleteActivated();
        return $data;
    }
}
