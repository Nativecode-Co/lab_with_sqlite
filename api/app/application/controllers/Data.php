<?php



class Data extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('DataModel');
        $this->load->helper('url');
    }

    function check_data()
    {
        $data = $this->DataModel->check_data();
        // new curl request
        $url = 'http://umc.native-code-iq.com/app/index.php/data/get_new_data';
        $data = post_data($url, array('data' => json_encode($data), 'lab_id' => 0));
        $result = $this->DataModel->insert_all(json_decode($data, true));
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($result));
    }
}
