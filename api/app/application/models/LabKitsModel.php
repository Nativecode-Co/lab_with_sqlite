<?php
defined('BASEPATH') or exit('No direct script access allowed');

class LabKitsModel extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        // Create table if not exists
        $this->create_table();
    }

    private function create_table()
    {
        $this->load->dbforge();

        $fields = array(
            'id' => array(
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => TRUE,
                'auto_increment' => TRUE
            ),
            'name' => array(
                'type' => 'VARCHAR',
                'constraint' => '100',
            ),
            'quantity' => array(
                'type' => 'INT',
                'constraint' => 11,
            ),
            'purchase_price' => array(
                'type' => 'DECIMAL',
                'constraint' => '10,2',
            ),
            'total_price' => array(
                'type' => 'DECIMAL',
                'constraint' => '10,2',
            ),
            'note' => array(
                'type' => 'TEXT',
            ),
            'date' => array(
                'type' => 'DATE',
            ),
            'status' => array(
                'type' => 'VARCHAR',
                'constraint' => '50',
            ),
            'expiry_date' => array(
                'type' => 'DATE',
            ),
            'hash' => array(
                'type' => 'BIGINT',
                'constraint' => '20',
            ),
            'is_deleted' => array(
                'type' => 'INT',
                'constraint' => '1',
                'default' => 0,
            ),
            'created_at' => array(
                'type' => 'DATETIME',
                'null' => TRUE,
            ),
            'updated_at' => array(
                'type' => 'DATETIME',
                'null' => TRUE,
            )
        );

        $this->dbforge->add_field($fields);
        $this->dbforge->add_key('id', TRUE);
        $this->dbforge->create_table('lab_kits', TRUE);
    }

    // Create a new record
    public function create($data)
    {
        $data['hash'] = $this->generate_hash();
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['updated_at'] = date('Y-m-d H:i:s');
        return $this->db->insert('lab_kits', $data);
    }

    // Read a record by hash
    public function read($hash)
    {
        $this->db->where('hash', $hash);
        $query = $this->db->get('lab_kits');
        return $query->row_array();
    }

    // Update a record by hash
    public function update($hash, $data)
    {
        $data['updated_at'] = date('Y-m-d H:i:s');
        $this->db->where('hash', $hash);
        return $this->db->update('lab_kits', $data);
    }

    // Delete a record by hash (soft delete)
    public function delete($hash)
    {
        $data = array(
            'is_deleted' => 1,
            'updated_at' => date('Y-m-d H:i:s')
        );
        $this->db->where('hash', $hash);
        return $this->db->update('lab_kits', $data);
    }

    // Generate a hash using the current timestamp and a random number
    private function generate_hash()
    {
        return intval(microtime(true) * 1000000) . mt_rand(1000, 9999);
    }
}
