<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Offline_sync_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function offline_sync_query()
    {
        // Start a transaction to ensure atomicity
        $this->db->trans_start();

        // Select 20 rows where sync is 0 or 1, including the 'id' column
        $this->db->select("id, query")
            ->where_in('sync', [0, 1])
            ->limit(20);
        $result = $this->db->get('offline_sync')->result_array();

        // Extract the IDs of the selected rows
        $selected_ids = array_map(function ($row) {
            return $row['id'];  // Now 'id' should be defined
        }, $result);

        // Update sync to 3 for these 20 rows
        if (!empty($selected_ids)) {
            $this->db->where_in('id', $selected_ids);
            $this->db->update('offline_sync', ['sync' => 3]);
        }

        // Complete the transaction
        $this->db->trans_complete();

        // Transform the array of arrays into an array of strings
        $queries = array_map(function ($query) {
            return $query['query'];
        }, $result);

        $queries_string = implode(';', $queries);

        return ['queries' => $queries_string];
    }


    public function update_offline_sync()
    {
        $this->db->set('sync', 1)->update('offline_sync');
    }

    public function trancate_offline_sync()
    {
        $this->db->where('sync', 3);
        $this->db->delete('offline_sync');
    }
}
