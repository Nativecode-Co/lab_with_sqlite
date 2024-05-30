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
        $this->db->query("CREATE TABLE IF NOT EXISTS `testNotification` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `message` varchar(1000) NULL,
            `activated` tinyint(1) NOT NULL DEFAULT '1',
            `visit_hash` varchar(100) NULL,
            `created_at` timestamp NOT NULL,
            `updated_at` timestamp NOT NULL,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");
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
