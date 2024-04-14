<?php



class Alias extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('TestAliasModel');
        $this->load->library('form_validation');
    }



    function index()
    {
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("message" => "Welcome to the aliases API")));
    }


    function get_aliases()
    {
        $req = $this->input->post();
        $data = $this->TestAliasModel->get_all($req);
        $total = $this->TestAliasModel->count_all($req);
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

    function get_alias()
    {
        $hash = $this->input->get('hash');
        $data = $this->TestAliasModel->get($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function create_alias()
    {
        $req = $this->input->post();
        $valid = $this->form_validation->
            set_data($req)->
            run('aliases');
        if (!$valid) {
            $errors = $this->form_validation->error_array();
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode($errors));
            return;
        }
        ;
        $data = $this->TestAliasModel->insert($req);
        $this->output
            ->set_status_header(201)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function update_alias()
    {
        $req = $this->input->post();
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
            run('aliases');
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
        $data = $this->TestAliasModel->update($hash, $req);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function delete_alias()
    {
        $hash = $this->input->post('hash');
        $this->TestAliasModel->delete($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("hash" => $hash)));
    }

    public function get_tests()
    {
        $data = $this->TestAliasModel->get_tests();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function get_devices()
    {
        $data = $this->TestAliasModel->get_devices();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function insert_all()
    {
        $data = $this->input->post("data");
        if(!$data) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "data is required")));
            return;
        }
        if(!is_array($data)) {
            try {
                $data = json_decode($data, true);
            } catch (Exception $e) {
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode(array("message" => "data must be an array")));
                return;
            }
        }
        $this->TestAliasModel->insert_all($data);
        $this->output
            ->set_status_header(201)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function get_all_alias()
    {
        $data = $this->TestAliasModel->get_all_alias();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

}
