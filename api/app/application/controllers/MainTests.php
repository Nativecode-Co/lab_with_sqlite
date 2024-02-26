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

    public function getRefrence()
    {
        $fields = $this->input->post();
        $hash = $fields['hash'];
        unset($fields['hash']);
        $test = $this->MainTestsModel->get($hash);
        // test is stdClass object
        $test = json_decode(json_encode($test), true);
        $option_test = $test["option_test"];

        $json = new Json($option_test);
        $data = $json->getRefrenceByFields($fields);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
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
        $req = $this->input->get();
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
        $hash = $this->input->get('hash');
        $data = $this->MainTestsModel->get($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function create_main_test()
    {
        $req = json_decode(trim(file_get_contents('php://input')), true);
        $valid = $this->form_validation->
            set_data($req)->
            run('main_tests');
        if (!$valid) {
            $errors = $this->form_validation->error_array();
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode($errors));
            return;
        }
        ;
        $data = $this->MainTestsModel->insert($req);
        $this->output
            ->set_status_header(201)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function update_main_test()
    {
        $req = json_decode(trim(file_get_contents('php://input')), true);
        $this->form_validation->set_data($req);

        $valid = $this->form_validation->
            set_data($req)->
            set_rules(
                'hash',
                'hash',
                'required|numeric',
                array(
                    'required' => 'هذا الحقل مطلوب',
                    'numeric' => 'يجب ادخال قيمة رقمية'
                )
            )->
            run('main_tests');
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

}
