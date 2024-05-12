<?php



class Data extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('DataModel');
        // form validation
        $this->load->library('form_validation');
    }

    function get_new_data()
    {
        $req = $this->input->post();
        // validate data by get_data validation
        $valid = $this->form_validation->set_data($req)->run('get_data');
        if ($valid === false) {
            $errors = $this->form_validation->error_array();
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode($errors, JSON_UNESCAPED_UNICODE));
            return;
        }
        $data = $req['data'];
        $data = json_decode($data, true);
        $data = $this->DataModel->get_new_data($data);

        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(array('data' => $data));
    }
}
