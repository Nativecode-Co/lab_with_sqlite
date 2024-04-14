<?php
defined('BASEPATH') or exit ('No direct script access allowed');

class Offline_sync_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function offline_sync_query()
    {
        $queries = $this->db->select("query")->where('sync', 0)->get('offline_sync')->result_array();
        // transform the array of arrays into an array of strings
        $queries = array_map(function ($query) {
            return $query['query'];
        }, $queries);
        $queries = implode(';', $queries);
        return array('queries' => $queries);
    }

    public function update_offline_sync()
    {
        $this->db->set('sync', 1)->update('offline_sync');
    }

    public function trancate_offline_sync()
    {
        $this->db->truncate('offline_sync');
    }
}
