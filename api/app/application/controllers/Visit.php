<?php

class Visit extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->helper('visit');
        $this->load->model('VisitModel');
    }

    function index()
    {
        $data = $this->VisitModel->get_visits();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function get_visits()
    {
        $req = $this->input->get();
        $data = $this->VisitModel->get_visits($req);
        $total = $this->VisitModel->visit_count($req);
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

    public function get_visit_form_data()
    {
        $data = $this->VisitModel->get_visit_form_data();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }
    function create_visit()
    {
        $data = split_data($this->input->post());
        $visit_hash = $this->VisitModel->create_visit($data);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($visit_hash));
    }

    function update_visit()
    {
        $data = split_data($this->input->post());
        $visit_hash = $this->VisitModel->update_visit($data);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($visit_hash));
    }

    function get_visit()
    {
        $hash = $this->input->get("hash");
        $data = $this->VisitModel->get_visit($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }
}
