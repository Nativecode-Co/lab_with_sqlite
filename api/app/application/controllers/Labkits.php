<?php
defined('BASEPATH') or exit('No direct script access allowed');

class LabKits extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('LabKitsModel');
        $this->load->library('form_validation');
    }

    public function index()
    {
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("message" => "Welcome to the lab kits API")));
    }

    public function get_kits()
    {
        $req = $this->input->post();
        $data = $this->LabKitsModel->get_all($req);
        $total = $this->LabKitsModel->count_all($req);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(
                json_encode(
                    array(
                        "recordsTotal" => $total,
                        "recordsFiltered" => $total,
                        "data" => $data
                    )
                )
            );
    }

    public function get_kit()
    {
        $hash = $this->input->get('hash');
        $data = $this->LabKitsModel->get($hash);
        if (!$data) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Kit not found")));
            return;
        }
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function create_kit()
    {
        $data = $this->input->post();
        $data = $this->LabKitsModel->insert($data);
        $this->output
            ->set_status_header(201)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function update_kit()
    {
        $req = $this->input->post();
        $hash = $req['hash'];
        unset($req['hash']);
        $data = $this->LabKitsModel->update($hash, $req);
        if (!$data) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Kit not found")));
            return;
        }
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function delete_kit()
    {
        $hash = $this->input->post('hash');
        $this->LabKitsModel->delete($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("hash" => $hash)));
    }

    public function get_kits_groups()
    {
        $data = $this->LabKitsModel->get_kits();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }
}
