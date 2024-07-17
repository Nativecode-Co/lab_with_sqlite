<?php



class MainTests extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('MainTestsModel');
        $this->load->library('form_validation');
        $this->load->helper('json');
    }



    function index()
    {
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("message" => "Welcome to the main_tests API")));
    }


    function get_main_tests()
    {
        $req = $this->input->post();
        $data = $this->MainTestsModel->get_all($req);
        $total = $this->MainTestsModel->count_all($req);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(
                json_encode(
                    array(
                        "recordsTotal" => $total,
                        "recordsFiltered" => $total,
                        "data" => $data
                    )
                )
            );
    }

    function get_tests_options()
    {
        $data = $this->MainTestsModel->get_tests_options();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function get_main_test()
    {
        $fields = $this->input->post();
        $hash = $fields['hash'];
        unset($fields['hash']);
        $data = $this->MainTestsModel->get($hash, $fields);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }
    function get_by_patient_and_test()
    {
        $hash = $this->input->post("hash");
        $visit_hash = $this->input->post("visit_hash");
        $data = $this->MainTestsModel->get_by_patient_and_test($hash, $visit_hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function get_calc_test()
    {
        $hash = $this->input->get('hash');
        $data = $this->MainTestsModel->get_calc($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function get_structural_tests()
    {
        $data = $this->MainTestsModel->get_structural_tests();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }


    function create_main_test()
    {
        $req = $this->input->post();
        $data = $this->MainTestsModel->insert($req);
        $this->output
            ->set_status_header(201)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function update_main_test()
    {
        $req = $this->input->post();
        $this->form_validation->set_data($req);

        $valid = $this->form_validation->set_data($req)->set_rules(
            'hash',
            'hash',
            'required|numeric',
            array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        )->run('main_tests');
        if (!$valid) {
            $errors = $this->form_validation->error_array();
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode($errors));
            return;
        }
        $hash = $req['hash'];
        unset($req['hash']);
        $data = $this->MainTestsModel->update($hash, $req);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function delete_main_test()
    {
        $hash = $this->input->post('hash');
        $this->MainTestsModel->delete($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("hash" => $hash)));
    }
    public function get_calc_tests()
    {
        $params = $this->input->post();
        $data = $this->MainTestsModel->get_calc_tests($params);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function get_main_tests_data()
    {
        $data = $this->MainTestsModel->get_main_tests_data();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function get_main_tests_by_updated_at()
    {
        $data = $this->input->post('data');
        $data = $this->MainTestsModel->get_main_tests_by_updated_at($data);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }
}
