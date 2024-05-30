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
        // $valid = $this->form_validation->set_data($req)->run('get_data');
        // if ($valid === false) {
        //     $errors = $this->form_validation->error_array();
        //     $this->output
        //         ->set_status_header(400)
        //         ->set_content_type('application/json')
        //         ->set_output(json_encode($errors, JSON_UNESCAPED_UNICODE));
        //     return;
        // }
        $data = $req['data'];
        $data = json_decode($data, true);
        $data = $this->DataModel->get_new_data($data);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(array('data' => $data));
    }

    public function get_lab_data()
    {
        $username = $this->input->post('username');
        $password = $this->input->post('password');
        $lab_id = $this->DataModel->get_lab_id($username, $password);
        if ($lab_id === false) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => 'Invalid username or password'), JSON_UNESCAPED_UNICODE));
            return;
        }
        $this->DataModel->insertTestsForLab($lab_id);
        $data = $this->DataModel->get_lab_data($lab_id);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data, JSON_UNESCAPED_UNICODE));
    }

    public function install_rest()
    {
        $lab_id = $this->input->post('lab');
        $patient = $this->input->post('lab_patient');
        $visit = $this->input->post('lab_visits');
        $visit_test = $this->input->post('lab_visits_tests');
        $visit_package = $this->input->post('lab_visits_package');
        $data = $this->DataModel->install_rest($lab_id, $patient, $visit, $visit_test, $visit_package);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data, JSON_UNESCAPED_UNICODE));
    }
}
