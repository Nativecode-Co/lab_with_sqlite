<?php



class TestNot extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('TestNotModal');
    }

    function index()
    {
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("message" => "Welcome to the TestNot API")));
    }

    function get()
    {
        $data = $this->TestNotModal->getActivated();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function delete()
    {
        $data = $this->TestNotModal->deleteActivated();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("message" => "Activated notifications deleted")));
    }
}
