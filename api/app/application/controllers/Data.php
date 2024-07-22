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
        $url = 'http://umc.native-code-iq.com/app/index.php/data/get_new_data';
        $data = post_data($url, array('data' => json_encode($data), 'lab_id' => 0));
        $result = $this->DataModel->insert_all(json_decode($data, true));
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($result));
    }

    function check_tests()
    {
        $tests = $this->DataModel->check_tests();
        $url = 'http://umc.native-code-iq.com/app/index.php/data/get_new_tests';
        $data = post_data($url, array('data' => json_encode($tests)));
        $data = json_decode($data, true);
        $result = $this->DataModel->insert_all($data);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output($result);
        exit();
    }

    function insert_lab_data()
    {
        $username = $this->input->post('username');
        $password = $this->input->post('password');
        $url = 'http://umc.native-code-iq.com/app/index.php/data/get_lab_data';
        $data = post_data($url, array('username' => $username, 'password' => $password));
        $res = json_decode($data, true);
        if (isset($res['error'])) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $res['error'])));
            return;
        }
        $result = $this->DataModel->insert_lab_data(json_decode($data, true));
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($result));
    }

    function install_rest()
    {
        $ids = $this->DataModel->get_smallest_id();
        $url = 'http://umc.native-code-iq.com/app/index.php/data/install_rest';
        $data = post_data($url, $ids);
        $result = $this->DataModel->insert_lab_data(json_decode($data, true));
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($result));
    }
}
