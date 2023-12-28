<?php
class LabActivate extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->database('unimedica', TRUE);
        $this->load->library('session');
        $this->load->dbforge();
        $this->check();
    }

    public function check(){
        if (!$this->db->table_exists('lab_expire')) {
            $fields = array(
                'id' => array(
                    'type' => 'INT',
                    'constraint' => 11,
                    'unsigned' => TRUE,
                    'auto_increment' => TRUE
                ),
                'last_code' => array(
                    'type' => 'INT',
                    'constraint' => 16,
                ),
                'lab_id' => array(
                    'type' => 'INT',
                    'constraint' => 16,
                ),
                'status' => array(
                    'type' => 'INT',
                    'constraint' => 1,
                ),
                // date to end 
                'expire_date' => array(
                    'type' => 'DATE',
                ),
                // user hash 
                'user_hash' => array(
                    'type' => 'INT',
                    'constraint' => 16,
                ),
            );

            // Set the primary key
            $this->dbforge->add_key('id', TRUE);
            $this->dbforge->add_field($fields);
            $this->dbforge->create_table('lab_expire');
        }
        return true;
    }

    public function update_or_insert($code, $lab, $user_hash){
        $last_expire = $this->get_last_expire($lab);
        $days = $this->get_days_of_code($code);
        $new_date = $this->get_new_expire_date($last_expire, $days);
        if(!$last_expire){
            $this->db->insert('lab_expire', array(
                'last_code' => $code,
                'lab_id' => $lab,
                'status' => 1,
                'expire_date' => $new_date,
                'user_hash' => $user_hash,
            ));
        }else{
            $this->db->where('lab_id', $lab);
            $this->db->update('lab_expire', array(
                'last_code' => $code,
                'status' => 1,
                'expire_date' => $new_date,
                'user_hash' => $user_hash,
            ));
        }
        
        return $this->db->affected_rows();
    }

    public function get_last_expire($lab){
        $this->db->select('expire_date');
        $this->db->from('lab_expire');
        $this->db->where('lab_id', $lab);
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        $result = $query->result_array();
        if(empty($result)){
            return false;
        }
        $expire_date = $result[0]['expire_date'];
        return $expire_date;
    }

    public function get_days_of_code($code){
        $this->db->select('(select dur from activation_code_type where hash=activation_code.type) as days');
        $this->db->from('activation_code');
        $this->db->where('number', $code);
        $query = $this->db->get();
        $result = $query->result_array();
        $days = $result[0]['days'];
        return $days;
    }

    public function get_new_expire_date($last_date, $days){
        // check if last_date gte or lte today
        $today = date('Y-m-d');
        switch ($last_date) {
            case $last_date >= $today:
                $new_date = date('Y-m-d', strtotime($last_date. ' + '.$days.' days'));
                break;
            case $last_date <= $today:
                $new_date = date('Y-m-d', strtotime($today. ' + '.$days.' days'));
                break;
        }
        return $new_date;
    }

    public function check_expire($lab_id){
        $date = $this->get_last_expire($lab_id);
        if($date){
            $today = date('Y-m-d');
            if($date >= $today){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

}
