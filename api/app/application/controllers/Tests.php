<?php

class Tests extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->helper('visit');
        $this->load->model('TestsModel');
    }

    function index()
    {
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("message" => "Welcome to the Tests API")));
    }

    function get_tests()
    {
        $req = $this->input->get();
        $tests = $this->TestsModel->get_all($req, 9);
        $packages = $this->TestsModel->get_all($req, 8);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(
                json_encode(
                    array(
                        "tests" => $tests,
                        "packages" => $packages
                    )
                )
            );
    }

    function get_test()
    {
        $hash = $this->input->get('hash');
        $data = $this->TestsModel->get($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function create_test()
    {
        $req = $this->input->post();
        $hash = $this->TestsModel->insert($req);
        $this->output
            ->set_status_header(201)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("hash" => $hash)));
    }

    function update_test()
    {
        $req = $this->input->post();
        $hash = $req['hash'];
        $this->TestsModel->update($hash, $req);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("hash" => $hash)));
    }

    function delete_test()
    {
        $hash = $this->input->post('hash');
        $this->TestsModel->delete($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("hash" => $hash)));
    }

}
