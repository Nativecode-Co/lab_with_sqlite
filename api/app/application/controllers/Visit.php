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

    public function get_tests_and_packages()
    {
        $data = $this->VisitModel->get_tests_and_packages();
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

    function saveTestResult()
    {
        $data = $this->input->post();
        $visit_hash = $this->VisitModel->saveTestResult($data);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($visit_hash));
    }

    function saveTestsResult()
    {
        $data = $this->input->post("data");
        $visit_hash = $this->VisitModel->saveTestsResults($data);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($visit_hash));
    }

    public function getInvoiceHeader()
    {
        $data = $this->VisitModel->getInvoiceHeader();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function update_invoice()
    {
        $data = $this->input->post();
        $lab_hash = $data['lab_hash'];
        unset($data['lab_hash']);
        $visit_hash = $this->VisitModel->update_invoice($data, $lab_hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }
}
