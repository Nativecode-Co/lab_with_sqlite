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
        $req = $this->input->get();
        // validate data by get_data validation
        $valid = $this->form_validation->set_data($req)->run('get_data');
        if ($valid === false) {
            $errors = $this->form_validation->error_array();
            die(json_encode($errors));
        }
        $data = $req->data;
        $lab_id = $req->lab_id;
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array('lab_id' => $lab_id, 'data' => $data)));
    }
}
