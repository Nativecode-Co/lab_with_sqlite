<?php
class TestNotModal extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        // create table if not exists
        // delete table if CHARSET=latin1 and create new table with utf8

        $this->db->query("CREATE TABLE IF NOT EXISTS `test_notification` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `message` varchar(1000) NULL,
            `activated` tinyint(1) NOT NULL DEFAULT '1',
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
          ) ENGINE=InnoDB DEFAULT CHARSET=latin1;");
        // update ENGINE=InnoDB DEFAULT CHARSET=latin1; to ENGINE=InnoDB DEFAULT CHARSET=utf8; 
        $this->db->query("ALTER TABLE test_notification CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;");
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
