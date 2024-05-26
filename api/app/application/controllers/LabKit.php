<?php
defined('BASEPATH') or exit('No direct script access allowed');

class LabKit extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('LabKits_model');
        $this->load->helper('url');
        $this->load->library('form_validation');
    }

    // Create a new lab kit
    public function create()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Invalid input")));
            return;
        }

        $this->form_validation->set_data($data);
        $this->form_validation->set_rules('name', 'Name', 'required');
        $this->form_validation->set_rules('quantity', 'Quantity', 'required|integer');
        $this->form_validation->set_rules('purchase_price', 'Purchase Price', 'required|decimal');
        $this->form_validation->set_rules('total_price', 'Total Price', 'required|decimal');
        $this->form_validation->set_rules('date', 'Date', 'required');
        $this->form_validation->set_rules('expiry_date', 'Expiry Date', 'required');

        if ($this->form_validation->run() == FALSE) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => validation_errors())));
            return;
        }

        if ($this->LabKits_model->create($data)) {
            $this->output
                ->set_status_header(201)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Lab kit created successfully")));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Failed to create lab kit")));
        }
    }

    // Read a lab kit by hash
    public function read($hash)
    {
        $data = $this->LabKits_model->read($hash);

        if ($data) {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode($data));
        } else {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Lab kit not found")));
        }
    }

    // Update a lab kit by hash
    public function update($hash)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Invalid input")));
            return;
        }

        $this->form_validation->set_data($data);
        $this->form_validation->set_rules('name', 'Name', 'required');
        $this->form_validation->set_rules('quantity', 'Quantity', 'required|integer');
        $this->form_validation->set_rules('purchase_price', 'Purchase Price', 'required|decimal');
        $this->form_validation->set_rules('total_price', 'Total Price', 'required|decimal');
        $this->form_validation->set_rules('date', 'Date', 'required');
        $this->form_validation->set_rules('expiry_date', 'Expiry Date', 'required');

        if ($this->form_validation->run() == FALSE) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => validation_errors())));
            return;
        }

        if ($this->LabKits_model->update($hash, $data)) {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Lab kit updated successfully")));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Failed to update lab kit")));
        }
    }

    // Delete a lab kit by hash (soft delete)
    public function delete($hash)
    {
        if ($this->LabKits_model->delete($hash)) {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Lab kit deleted successfully")));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Failed to delete lab kit")));
        }
    }
}
