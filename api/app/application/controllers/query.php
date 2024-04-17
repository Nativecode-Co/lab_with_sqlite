<?php



class Query extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('PureQueryModel');
    }



    function index()
    {
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("message" => "Welcome to the Query API")));
    }

    function query()
    {
        $req = $this->input->post();
        $query = $req['query'];
        $data = $this->PureQueryModel->query($query);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }



}
