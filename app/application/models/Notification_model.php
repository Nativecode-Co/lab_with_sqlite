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

    function getAll($lab_id)
    {
        $this->db->select('lab_notifications.*, lab_notifications_labs.lab_id');
        $this->db->from('lab_notifications');
        $this->db->join('lab_notifications_labs', 'lab_notifications_labs.notification_hash = lab_notifications.hash');
        $this->db->where('lab_notifications_labs.lab_id', $lab_id);
        $this->db->order_by('lab_notifications.id', 'DESC');
        return $this->db->get()->result_array();
    }

    function get($hash)
    {

        $not = $this->db->from('lab_notifications')
            ->where('hash', $hash)
            ->get()->row();
        $labs = $this->db->from('lab_notifications_labs')
            ->where('notification_hash', $hash)
            ->get()->result_array();
        $labs = array_column($labs, 'lab_id');
        $not->labs = $labs;
        return $not;
    }

    function add($data, $labs)
    {
        $this->db->insert('lab_notifications', $data);
        foreach ($labs as $lab) {
            $this->db->insert('lab_notifications_labs', array('lab_id' => $lab, 'notification_hash' => $data["hash"]));
        }
        return $this->db->insert_id();
    }

    function update($hash, $data, $labs)
    {
        $this->db->where('hash', $hash);
        $this->db->update('lab_notifications', $data);
        // delete not in labs
        $this->db->where('notification_hash', $hash);
        $this->db->where_not_in('lab_id', $labs);
        $this->db->delete('lab_notifications_labs');
        // insert new labs if not exists
        foreach ($labs as $lab) {
            $this->db->where('lab_id', $lab);
            $this->db->where('notification_hash', $hash);
            $exists = $this->db->get('lab_notifications_labs')->row();
            if (!$exists) {
                $this->db->insert('lab_notifications_labs', array('lab_id' => $lab, 'notification_hash' => $hash));
            }
        }
    }

    function delete($hash)
    {
        $this->db->delete('lab_notifications_labs', array('notification_hash' => $hash));
        return $this->db->delete('lab_notifications', array('hash' => $hash));

    }

    function getLabs()
    {
        return $this->db
            ->select('lab.id as hash, lab.name as text')
            ->join('lab', 'lab.id = lab_expire.lab_id')
            ->order_by('lab.id', 'DESC')
            ->group_by('lab_id')
            ->get("lab_expire")
            ->result_array();
    }
}
