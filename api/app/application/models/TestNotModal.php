<?php
class TestNotModal extends CI_Model {

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        // create table if not exists
        $this->db->query("CREATE TABLE IF NOT EXISTS `test_notification` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `message` text NULL,
            `activated` tinyint(1) NOT NULL DEFAULT '1',
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
          ) ENGINE=InnoDB DEFAULT CHARSET=latin1;");
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