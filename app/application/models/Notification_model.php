<?php
class Notification_model extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        // $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }

    public function record_count($search)
    {
        return $this
            ->db
            ->like('text', $search)
            ->count_all_results('lab_notifications');
    }

    function getNotifications($start, $length, $search)
    {
        return $this->db->from('lab_notifications')
            ->like('text', $search)
            ->order_by('id', 'DESC')
            ->limit($start, $length)
            ->get()
            ->result_array();
    }
}
