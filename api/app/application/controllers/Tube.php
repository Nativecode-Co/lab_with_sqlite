<?php



class Tube extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('TubeModel');
        $this->load->library('form_validation');
    }



    function index()
    {
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("message" => "Welcome to the tubes API")));
    }


    function get_tubes()
    {
        $req = $this->input->post();
        $data = $this->TubeModel->get_all($req);
        $total = $this->TubeModel->count_all($req);
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

    function get_tube()
    {
        $id = $this->input->get('id');
        $data = $this->TubeModel->get($id);
        if (!$data) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Tube not found")));
            return;
        }
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function create_tube()
    {
        $data = $this->input->post();
        // die(json_encode($data));
        $valid = $this->form_validation->set_data($data)->run('tubes');
        if (!$valid) {
            $errors = $this->form_validation->error_array();
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode($errors));
            return;
        };
        $tests = $data['tests'];
        if (!is_array($tests)) {
            $tests = json_decode($tests);
        }
        unset($data['tests']);
        $data = $this->TubeModel->insert($data, $tests);
        $this->output
            ->set_status_header(201)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function update_tube()
    {
        $req = $this->input->post();
        $this->form_validation->set_data($req);
        $valid = $this->form_validation->set_data($req)->set_rules(
            'id',
            'id',
            'required|numeric',
            array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        )->run('tubes');
        if (!$valid) {
            $errors = $this->form_validation->error_array();
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode($errors));
            return;
        }
        $id = $req['id'];
        unset($req['id']);
        $tests = $req['tests'];
        if (!is_array($tests)) {
            $tests = json_decode($tests);
        }
        unset($req['tests']);
        $data = $this->TubeModel->update($id, $req, $tests);
        if (!$data) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode(array("message" => "Tube not found")));
            return;
        }
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function delete_tube()
    {
        $id = $this->input->post('id');
        $this->TubeModel->delete($id);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("id" => $id)));
    }

    function get_tube_by_tests()
    {
        $tests = $this->input->post('tests');
        // form validation
        $this->form_validation->set_data($this->input->post())->set_rules(
            'tests',
            'tests',
            'required|is__array',
            array(
                'required' => 'هذا الحقل مطلوب',
                'is__array' => 'يجب ادخال قيمة مصفوفة'
            )
        );
        if (!is_array($tests)) {
            $tests = json_decode($tests);
        }
        $data = $this->TubeModel->get_tube_by_tests($tests);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }
}
