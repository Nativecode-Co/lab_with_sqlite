<?php

class MedContent extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('MedConnectModel');
        // form validation
        $this->load->library('form_validation');
    }

    function index()
    {
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("message" => "Welcome to MedConnect API")));
    }

    function tests()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if ($data == null) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Invalid JSON")));
            return;
        }
        $name = $data['Name'] ?? null;
        $code = $data['Code'] ?? null;
        $tests = $this->MedConnectModel->tests($name, $code);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("tests" => $tests)));
    }

    function orders()
    {
        $visit_hash = $this->input->post('SampleNumber') ?? null;
        if ($visit_hash == null) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "SampleNumber is required")));
            return;
        }
        $all_tests = $this->input->post('allTests') ?? true;
        $orders = $this->MedConnectModel->orders($visit_hash, $all_tests);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($orders));
    }

    function result()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if ($data == null) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Invalid JSON")));
            return;
        }
        /**
         *[
         *    {
         *      "SampleNumber":required string,
         *      "TestCode":required string,
         *      "SubTestCode":optional string,
         *      "Result":required string
         *    }
         *] 
         */
        $this->form_validation->set_rules('SampleNumber', 'SampleNumber', 'required');
        $this->form_validation->set_rules('TestCode', 'TestCode', 'required');
        $this->form_validation->set_rules('Result', 'Result', 'required');
        // for each test in the data
        foreach ($data as $test) {
            $this->form_validation->set_data($test);

            if ($this->form_validation->run() == FALSE) {
                $errors = $this->form_validation->error_array();
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode($errors));


                return;
            }
        }


        $result = $this->MedConnectModel->result($data);
        if ($result['status'] == 404) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode($result));
            return;
        }
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($result));
    }
}
