<?php



class Data extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('DataModel');
    }



    function check_data()
    {
        $data = $this->DataModel->check_data();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            // return arabic message
            ->set_output(json_encode($data, JSON_UNESCAPED_UNICODE));
    }
}
