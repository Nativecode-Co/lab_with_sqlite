<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Offline_sync extends CI_Controller
{

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Offline_sync_model');
    }

    public function index()
    {
        $resultQueries = $this->Offline_sync_model->offline_sync_query();

        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($resultQueries));
    }

    public function update_sync()
    {
        $this->Offline_sync_model->update_offline_sync();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array('message' => 'Sync updated')));
    }

    public function trancate_sync()
    {
        $this->Offline_sync_model->trancate_offline_sync();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array('message' => 'Sync trancated')));
    }
}
