<?php

class Patient extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->helper('visit');
        $this->load->model('PatientModel');
    }

    function index()
    {
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("message" => "Welcome to the Patient API")));
    }

    function get_patients()
    {
        $req = $this->input->get();
        $data = $this->PatientModel->get_all($req);
        $total = $this->PatientModel->count_all($req);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(
                json_encode(
                    array(
                        "total" => $total,
                        "data" => $data
                    )
                )
            );
    }

    function get_patient()
    {
        $hash = $this->input->get('hash');
        $data = $this->PatientModel->get($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function create_patient()
    {
        $req = $this->input->post();
        $hash = $this->PatientModel->insert($req);
        $this->output
            ->set_status_header(201)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("hash" => $hash)));
    }

    function update_patient()
    {
        $req = $this->input->post();
        $hash = $req['hash'];
        $this->PatientModel->update($hash, $req);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("hash" => $hash)));
    }

    function delete_patient()
    {
        $hash = $this->input->post('hash');
        $this->PatientModel->delete($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("hash" => $hash)));
    }

    public function patientIsExist()
    {
        $name = $this->input->post('name');
        $data = $this->PatientModel->patientIsExist($name);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

}
