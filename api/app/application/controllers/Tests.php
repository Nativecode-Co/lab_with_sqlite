<?php



class Tests extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('TestsModel');
        $this->load->library('form_validation');
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
        $req = json_decode(trim(file_get_contents('php://input')), true);
        $valid = $this->form_validation->
            set_data($req)->
            run('package');
        if (!$valid) {
            $errors = $this->form_validation->error_array();
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode($errors));
            return;
        }
        ;
        $tests = $req['tests'];
        unset($req['tests']);
        $data = $this->TestsModel->insert($req, $tests);
        $this->output
            ->set_status_header(201)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function update_test()
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
            run('package');
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
        $tests = $req['tests'];
        unset($req['tests']);
        $data = $this->TestsModel->update($hash, $req, $tests);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
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
